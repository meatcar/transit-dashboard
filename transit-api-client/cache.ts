import { DatabaseSync } from "node:sqlite";

// ---------- constants (exported for tests) ----------

export const MONTHLY_LIMIT = 1500;
const MONTHLY_RESERVE = 75;
export const MONTHLY_STOP = MONTHLY_LIMIT - MONTHLY_RESERVE; // 1425
export const BURST_LIMIT = 5;
export const BURST_WINDOW_S = 60;
const COOLDOWN_DEFAULT_S = 60;

// ---------- types ----------

export type Freshness = "fresh" | "stale" | "unavailable";

export interface CacheResult {
  response: Response | null;
  state: Freshness;
  /** Seconds since fetch, null when unavailable or fresh (age 0) */
  ageSeconds: number | null;
}

type FetchRow = {
  url: string;
  response: string;
  fetched_at: number;
  soft_expiry: number;
  hard_expiry: number;
};

// ---------- config ----------

const CACHE_DIRECTORY = Deno.env.get("CACHE_DIRECTORY") ?? "cache";
const CACHE_DB = `${CACHE_DIRECTORY}/cache.sqlite3`;
const NO_CACHE = !!Deno.env.get("NO_CACHE");

// ---------- module state ----------

let db: DatabaseSync | undefined;
let cooldownUntil = 0; // unix seconds
let burstTimes: number[] = []; // unix seconds of recent real fetches
const inFlight = new Map<string, Promise<void>>();

// ---------- lifecycle ----------

export function init(injectedDb?: DatabaseSync): void {
  if (!injectedDb) {
    // Production: close any previously open DB.
    db?.close();
    db = undefined;
  }
  cooldownUntil = 0;
  burstTimes = [];
  inFlight.clear();

  if (NO_CACHE && !injectedDb) {
    console.log("cache:", "disabled");
    return;
  }

  if (injectedDb) {
    db = injectedDb;
  } else {
    console.log("cache:", "open db", CACHE_DB);
    db = new DatabaseSync(CACHE_DB);
    addEventListener("beforeunload", () => {
      close();
    });
    Deno.addSignalListener("SIGTERM", () => {
      close();
      Deno.exit(128 + 15);
    });
    Deno.addSignalListener("SIGINT", () => {
      close();
      Deno.exit(128 + 2);
    });
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS fetches (
      url        TEXT    PRIMARY KEY,
      response   TEXT    NOT NULL,
      fetched_at INTEGER NOT NULL,
      soft_expiry INTEGER NOT NULL,
      hard_expiry INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS api_calls_daily (
      day TEXT    PRIMARY KEY,
      n   INTEGER NOT NULL
    );
  `);

  // Prune stale entries
  db.exec(`
    DELETE FROM fetches WHERE hard_expiry < unixepoch('now');
    DELETE FROM api_calls_daily WHERE day < date('now', '-31 days');
  `);
}

export function close(): void {
  console.log("cache:", "close db");
  db?.close();
  db = undefined;
}

/** Reset in-memory rate-limiting state. For tests only. */
export function _testReset(): void {
  cooldownUntil = 0;
  burstTimes = [];
  inFlight.clear();
}

// ---------- rate-limit helpers ----------

function isBudgetExhausted(): boolean {
  if (!db) return false;
  const rows = db.prepare(
    "SELECT COALESCE(SUM(n), 0) AS spent FROM api_calls_daily WHERE day >= date('now', '-30 days')",
  ).all() as [{ spent: number }];
  return (rows[0]?.spent ?? 0) >= MONTHLY_STOP;
}

/** Returns true if a burst slot is available, pruning the window as a side-effect. */
function canBurst(nowSec: number): boolean {
  burstTimes = burstTimes.filter((t) => t > nowSec - BURST_WINDOW_S);
  return burstTimes.length < BURST_LIMIT;
}

function recordBurst(nowSec: number): void {
  burstTimes.push(nowSec);
}

function countCall(): void {
  db?.prepare(
    "INSERT INTO api_calls_daily(day, n) VALUES(date('now'), 1) ON CONFLICT(day) DO UPDATE SET n = n + 1",
  ).run();
}

function setCooldown(retryAfterHeader: string | null, nowSec: number): void {
  const parsed = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
  const delay = isNaN(parsed) ? COOLDOWN_DEFAULT_S : parsed;
  cooldownUntil = nowSec + delay;
  console.warn(
    `cache: cooldown for ${delay}s (until ${
      new Date(cooldownUntil * 1000).toISOString()
    })`,
  );
}

function queryRow(urlStr: string): FetchRow | undefined {
  return (
    (db
      ?.prepare(
        "SELECT url, response, fetched_at, soft_expiry, hard_expiry FROM fetches WHERE url = ?",
      )
      .all(urlStr) as FetchRow[] | undefined)?.[0] ?? undefined
  );
}

// ---------- main ----------

/**
 * Fetch `url` with caching and rate-limiting.
 *
 * @param softTtl  Seconds until a cached response is considered stale (triggers revalidation).
 * @param hardTtl  Seconds until a cached response is dropped entirely (past this → unavailable).
 * @param req      Fetch options (headers, method, …).
 * @param opts     Injection points for testing: `_now` (unix seconds) and `_fetch`.
 */
export async function cacheFetch(
  url: URL,
  softTtl: number,
  hardTtl: number,
  req: RequestInit = {},
  opts: { _now?: number; _fetch?: typeof fetch } = {},
): Promise<CacheResult> {
  const nowSec = opts._now ?? Math.floor(Date.now() / 1000);
  const fetchImpl = opts._fetch ?? fetch;
  const urlStr = url.toString();

  // NO_CACHE with no DB: passthrough without rate-limiting (dev mode).
  if (NO_CACHE && !db) {
    try {
      const res = await fetchImpl(url, req);
      if (!res.ok) {
        return { response: null, state: "unavailable", ageSeconds: null };
      }
      return { response: res, state: "fresh", ageSeconds: 0 };
    } catch {
      return { response: null, state: "unavailable", ageSeconds: null };
    }
  }

  // Step 1: Fresh hit.
  const row = queryRow(urlStr);
  if (row && nowSec < row.soft_expiry) {
    console.debug(`cache: fresh (${urlStr})`);
    return {
      response: new Response(row.response, { status: 200 }),
      state: "fresh",
      ageSeconds: 0,
    };
  }

  // Step 2: Gate check — may we do a real fetch?
  const inflightPromise = inFlight.get(urlStr);
  if (inflightPromise) {
    // Another fetch for this URL is in progress; wait for it, then re-check.
    await inflightPromise;
    const freshRow = queryRow(urlStr);
    if (freshRow && nowSec < freshRow.soft_expiry) {
      console.debug(`cache: fresh (coalesced) (${urlStr})`);
      return {
        response: new Response(freshRow.response, { status: 200 }),
        state: "fresh",
        ageSeconds: 0,
      };
    }
    // Fall through to stale with potentially-updated row.
  } else if (
    nowSec >= cooldownUntil &&
    !isBudgetExhausted() &&
    canBurst(nowSec)
  ) {
    // Allowed: start a real fetch.
    recordBurst(nowSec);
    console.debug(`cache: miss (${urlStr})`);

    let resolveInflight!: () => void;
    const doneSignal = new Promise<void>((r) => {
      resolveInflight = r;
    });
    inFlight.set(urlStr, doneSignal);

    try {
      const res = await fetchImpl(url, req);

      if (res.status === 200) {
        const body = await res.text();
        countCall();
        db?.prepare(
          "INSERT OR REPLACE INTO fetches(url, response, fetched_at, soft_expiry, hard_expiry) VALUES(?, ?, ?, ?, ?)",
        ).run(urlStr, body, nowSec, nowSec + softTtl, nowSec + hardTtl);
        return {
          response: new Response(body, { status: 200 }),
          state: "fresh",
          ageSeconds: 0,
        };
      } else if (res.status === 429) {
        setCooldown(res.headers.get("Retry-After"), nowSec);
        // fall through to stale
      } else {
        console.warn(`cache: upstream ${res.status} (${urlStr})`);
        // fall through to stale
      }
    } catch (e) {
      console.warn(`cache: fetch error (${urlStr}):`, e);
      // fall through to stale
    } finally {
      inFlight.delete(urlStr);
      resolveInflight();
    }
  }

  // Step 3: Stale fallback — re-query in case an inflight just wrote a fresh row.
  const staleRow = queryRow(urlStr) ?? row;
  if (staleRow && nowSec < staleRow.hard_expiry) {
    console.debug(`cache: stale (${urlStr})`);
    return {
      response: new Response(staleRow.response, { status: 200 }),
      state: "stale",
      ageSeconds: nowSec - staleRow.fetched_at,
    };
  }

  // Step 4: Nothing usable.
  console.debug(`cache: unavailable (${urlStr})`);
  return { response: null, state: "unavailable", ageSeconds: null };
}

export function cacheClear(): void {
  db?.prepare("DELETE FROM fetches").run();
}
