import { DatabaseSync } from "node:sqlite";
import * as DateFns from "date-fns";

const CACHE_DIRECTORY = Deno.env.get("CACHE_DIRECTORY") ?? "cache";
const CACHE_DB = `${CACHE_DIRECTORY}/cache.sqlite3`;
const NO_CACHE = Deno.env.get("NO_CACHE") ?? false;

type CacheRow = {
  url: string;
  response: string;
  expiry: number;
};

let db: DatabaseSync | undefined;

export function init() {
  if (NO_CACHE) {
    console.log("cache:", "disabled");
    return;
  }

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

  db.exec(`
    CREATE TABLE IF NOT EXISTS fetches (
      url TEXT PRIMARY KEY,
      response TEXT NOT NULL,
      expiry INTEGER NOT NULL
    )
  `);
}

export function close() {
  console.log("cache:", "close db");
  db?.close();
  db = undefined;
}

/**
 * Return the response from a URL, caching it for `cacheTime` seconds.
 */
export async function cacheFetch(
  url: URL,
  req: RequestInit = {},
  cacheTime: number,
): Promise<Response> {
  const urlStr = url.toString();

  if (db) {
    const rows = db.prepare(
      "SELECT * FROM fetches WHERE url = ? AND expiry > unixepoch('now')",
    ).all(urlStr) as CacheRow[];
    if (rows[0]) {
      console.debug(`cache: hit (${urlStr})`);
      return new Response(rows[0].response, { status: 200 });
    }
  }

  console.debug(`cache: miss (${urlStr})`);
  const res = await fetch(url, req);
  if (res.status === 200 && db) {
    const expiry = DateFns.getUnixTime(Date.now()) + cacheTime;
    db.prepare(
      "INSERT OR REPLACE INTO fetches(url, response, expiry) VALUES (?, ?, ?)",
    ).run(urlStr, await res.clone().text(), expiry);
  }

  return res;
}

export function cacheClear(): void {
  db?.prepare("DELETE FROM fetches").run();
}
