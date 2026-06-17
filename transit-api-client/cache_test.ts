import { assertEquals } from "@std/assert";
import { DatabaseSync } from "node:sqlite";
import * as cache from "./cache.ts";

// ---------- helpers ----------

function makeDb(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  cache.init(db);
  cache._testReset();
  return db;
}

function stubFetch(
  status: number,
  body = '{"ok":true}',
  headers?: Record<string, string>,
): typeof fetch {
  return (_url, _req?) =>
    Promise.resolve(
      new Response(body, { status, headers: new Headers(headers) }),
    );
}

/** Seed N fetch calls on a given day (default today) into api_calls_daily. */
function seedCalls(db: DatabaseSync, n: number, day?: string): void {
  const d = day ?? new (class extends Date {})(Date.now())
    .toISOString()
    .slice(0, 10);
  db.prepare(
    "INSERT INTO api_calls_daily(day,n) VALUES(?,?) ON CONFLICT(day) DO UPDATE SET n=n+?",
  ).run(d, n, n);
}

/** Seed a cache row with given expiry offsets relative to nowSec. */
function seedRow(
  db: DatabaseSync,
  url: string,
  body: string,
  nowSec: number,
  { softOffset, hardOffset }: { softOffset: number; hardOffset: number },
): void {
  db.prepare(
    "INSERT OR REPLACE INTO fetches(url,response,fetched_at,soft_expiry,hard_expiry) VALUES(?,?,?,?,?)",
  ).run(url, body, nowSec - 1, nowSec + softOffset, nowSec + hardOffset);
}

const URL1 =
  "https://external.transitapp.com/v3/public/stop_departures?global_stop_id=X";
const SOFT = 300; // 5 min
const HARD = 3600; // 60 min
const NOW = 2_000_000; // fixed epoch for tests

// ---------- tests ----------

Deno.test("fresh hit: returns cached body, no real fetch", async () => {
  const db = makeDb();
  seedRow(db, URL1, '{"route_departures":[]}', NOW, {
    softOffset: 100,
    hardOffset: 3600,
  });

  let fetched = false;
  const result = await cache.cacheFetch(
    new URL(URL1),
    SOFT,
    HARD,
    {},
    {
      _now: NOW,
      _fetch: () => {
        fetched = true;
        return stubFetch(200)(new URL(URL1));
      },
    },
  );

  assertEquals(result.state, "fresh");
  assertEquals(fetched, false);
  assertEquals(result.ageSeconds, 0);
});

Deno.test("miss: fetches, stores, returns fresh", async () => {
  makeDb();

  const result = await cache.cacheFetch(
    new URL(URL1),
    SOFT,
    HARD,
    {},
    { _now: NOW, _fetch: stubFetch(200, '{"route_departures":[1]}') },
  );

  assertEquals(result.state, "fresh");
  const text = await result.response?.text();
  assertEquals(text, '{"route_departures":[1]}');
});

Deno.test("stale: expired soft but within hard, gated by burst", async () => {
  const db = makeDb();
  // Row soft-expired 10s ago, hard expiry in future
  seedRow(db, URL1, '{"stale":true}', NOW, {
    softOffset: -10,
    hardOffset: 3600,
  });
  // Exhaust burst so the gate blocks a real fetch
  for (let i = 0; i < cache.BURST_LIMIT; i++) {
    await cache.cacheFetch(
      new URL(URL1 + `&i=${i}`), // different URLs so each misses
      SOFT,
      HARD,
      {},
      { _now: NOW, _fetch: stubFetch(200) },
    );
  }
  cache._testReset(); // reset burst WITHOUT resetting db
  // Manually exhaust burst again using the same NOW so the window test works
  // We re-inject burst times by calling with unique non-cached URLs
  for (let i = 10; i < 10 + cache.BURST_LIMIT; i++) {
    await cache.cacheFetch(
      new URL(URL1 + `&j=${i}`),
      SOFT,
      HARD,
      {},
      { _now: NOW, _fetch: stubFetch(200) },
    );
  }

  // Next call for the original URL should be gated → stale
  const result = await cache.cacheFetch(
    new URL(URL1),
    SOFT,
    HARD,
    {},
    { _now: NOW, _fetch: stubFetch(200, '{"fresh":true}') },
  );

  assertEquals(result.state, "stale");
  const text = await result.response?.text();
  assertEquals(text, '{"stale":true}');
  assertEquals(typeof result.ageSeconds, "number");
});

Deno.test("unavailable: hard expiry passed", async () => {
  const db = makeDb();
  // Row hard-expired
  seedRow(db, URL1, '{"old":true}', NOW, {
    softOffset: -3700,
    hardOffset: -100,
  });
  // Exhaust burst so no real fetch
  for (let i = 0; i < cache.BURST_LIMIT; i++) {
    await cache.cacheFetch(
      new URL(URL1 + `&k=${i}`),
      SOFT,
      HARD,
      {},
      { _now: NOW, _fetch: stubFetch(200) },
    );
  }

  const result = await cache.cacheFetch(
    new URL(URL1),
    SOFT,
    HARD,
    {},
    { _now: NOW, _fetch: stubFetch(200) },
  );

  assertEquals(result.state, "unavailable");
  assertEquals(result.response, null);
});

Deno.test("monthly gate: stops real fetch at MONTHLY_STOP", async () => {
  const db = makeDb();
  // Seed 1425 calls (the stop threshold)
  seedCalls(db, cache.MONTHLY_STOP);

  let fetched = false;
  const result = await cache.cacheFetch(
    new URL(URL1),
    SOFT,
    HARD,
    {},
    {
      _now: NOW,
      _fetch: () => {
        fetched = true;
        return stubFetch(200)(new URL(URL1));
      },
    },
  );

  assertEquals(
    fetched,
    false,
    "should not fetch when monthly budget exhausted",
  );
  assertEquals(result.state, "unavailable"); // no stale row either
});

Deno.test("monthly gate: allows fetch at MONTHLY_STOP - 1", async () => {
  const db = makeDb();
  seedCalls(db, cache.MONTHLY_STOP - 1);

  const result = await cache.cacheFetch(
    new URL(URL1),
    SOFT,
    HARD,
    {},
    { _now: NOW, _fetch: stubFetch(200) },
  );

  assertEquals(result.state, "fresh");
});

Deno.test("burst gate: 6th call in 60s is gated", async () => {
  makeDb();

  // 5 unique miss fetches — all should succeed (burst limit is 5)
  for (let i = 0; i < cache.BURST_LIMIT; i++) {
    const r = await cache.cacheFetch(
      new URL(URL1 + `&b=${i}`),
      SOFT,
      HARD,
      {},
      { _now: NOW, _fetch: stubFetch(200) },
    );
    assertEquals(r.state, "fresh", `call ${i} should succeed`);
  }

  // 6th unique URL — gated
  let fetched = false;
  const r6 = await cache.cacheFetch(
    new URL(URL1 + "&b=overflow"),
    SOFT,
    HARD,
    {},
    {
      _now: NOW,
      _fetch: () => {
        fetched = true;
        return stubFetch(200)(new URL(URL1));
      },
    },
  );

  assertEquals(fetched, false, "6th call should be burst-gated");
  assertEquals(r6.state, "unavailable"); // no stale row
});

Deno.test("burst resets after window", async () => {
  makeDb();

  // Use up burst at NOW
  for (let i = 0; i < cache.BURST_LIMIT; i++) {
    await cache.cacheFetch(
      new URL(URL1 + `&w=${i}`),
      SOFT,
      HARD,
      {},
      { _now: NOW, _fetch: stubFetch(200) },
    );
  }

  // NOW + 61s — burst window expired
  const later = NOW + cache.BURST_WINDOW_S + 1;
  const result = await cache.cacheFetch(
    new URL(URL1 + "&w=later"),
    SOFT,
    HARD,
    {},
    { _now: later, _fetch: stubFetch(200, '{"later":true}') },
  );

  assertEquals(result.state, "fresh");
});

Deno.test("429: sets cooldown, returns stale, no retry", async () => {
  const db = makeDb();
  seedRow(db, URL1, '{"stale":true}', NOW, {
    softOffset: -10,
    hardOffset: 3600,
  });

  let fetchCount = 0;
  const result = await cache.cacheFetch(
    new URL(URL1),
    SOFT,
    HARD,
    {},
    {
      _now: NOW,
      _fetch: () => {
        fetchCount++;
        return stubFetch(429, "", { "Retry-After": "30" })(new URL(URL1));
      },
    },
  );

  assertEquals(fetchCount, 1, "only one real fetch attempt");
  assertEquals(result.state, "stale");

  // Subsequent call within cooldown window should be gated (no fetch)
  fetchCount = 0;
  const blocked = await cache.cacheFetch(
    new URL(URL1 + "&new=1"), // new URL, no stale row
    SOFT,
    HARD,
    {},
    {
      _now: NOW + 10, // still within 30s Retry-After
      _fetch: () => {
        fetchCount++;
        return stubFetch(200)(new URL(URL1));
      },
    },
  );

  assertEquals(fetchCount, 0, "should be blocked by cooldown");
  assertEquals(blocked.state, "unavailable");
});

Deno.test("429 without Retry-After: uses 60s default cooldown", async () => {
  makeDb();

  await cache.cacheFetch(
    new URL(URL1),
    SOFT,
    HARD,
    {},
    { _now: NOW, _fetch: stubFetch(429) },
  );

  let fetched = false;
  // 59s later — still in cooldown
  await cache.cacheFetch(
    new URL(URL1 + "&x=1"),
    SOFT,
    HARD,
    {},
    {
      _now: NOW + 59,
      _fetch: () => {
        fetched = true;
        return stubFetch(200)(new URL(URL1));
      },
    },
  );
  assertEquals(fetched, false, "should still be in default 60s cooldown");

  // 61s later — cooldown expired
  fetched = false;
  await cache.cacheFetch(
    new URL(URL1 + "&x=2"),
    SOFT,
    HARD,
    {},
    {
      _now: NOW + 61,
      _fetch: () => {
        fetched = true;
        return stubFetch(200)(new URL(URL1));
      },
    },
  );
  assertEquals(fetched, true, "cooldown should have expired");
});

Deno.test("coalescing: two concurrent misses share one real fetch", async () => {
  makeDb();

  let fetchCount = 0;
  const fetcher: typeof fetch = () => {
    fetchCount++;
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(new Response('{"ok":true}', { status: 200 })),
        10,
      )
    );
  };

  const [r1, r2] = await Promise.all([
    cache.cacheFetch(new URL(URL1), SOFT, HARD, {}, {
      _now: NOW,
      _fetch: fetcher,
    }),
    cache.cacheFetch(new URL(URL1), SOFT, HARD, {}, {
      _now: NOW,
      _fetch: fetcher,
    }),
  ]);

  assertEquals(
    fetchCount,
    1,
    "only one real fetch despite two concurrent misses",
  );
  assertEquals(r1.state, "fresh");
  assertEquals(r2.state, "fresh");
});

Deno.test("init prunes hard-expired rows", () => {
  const db = new DatabaseSync(":memory:");
  cache.init(db);
  // Seed an expired row
  db.prepare(
    "INSERT INTO fetches(url,response,fetched_at,soft_expiry,hard_expiry) VALUES(?,?,?,?,?)",
  ).run("https://old.example.com/", "{}", 1000, 1001, 1002);

  // Re-init — should prune (hard_expiry=1002 < unixepoch('now'))
  cache.init(db);
  const rows = db.prepare(
    "SELECT * FROM fetches WHERE url='https://old.example.com/'",
  ).all();
  assertEquals(rows.length, 0, "expired row should be pruned on init");
});

Deno.test("init prunes api_calls_daily older than 31 days", () => {
  const db = new DatabaseSync(":memory:");
  cache.init(db);
  db.prepare("INSERT INTO api_calls_daily(day,n) VALUES(?,?)").run(
    "2020-01-01",
    500,
  );

  cache.init(db);
  const rows = db.prepare(
    "SELECT * FROM api_calls_daily WHERE day='2020-01-01'",
  ).all();
  assertEquals(rows.length, 0, "old daily bucket should be pruned");
});
