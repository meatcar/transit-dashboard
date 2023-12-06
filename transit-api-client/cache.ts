import { Database, Statement } from "sqlite3";
import * as DateFns from "date-fns";

let db: Database;
const CACHE_DB = Deno.env.get("CACHE_DB") ?? "db/cache.sqlite3";

type CacheURL = string;
type CacheResponse = string;
type CacheExpiry = string;
type CacheRow = [CacheURL, CacheResponse, CacheExpiry];

let getCacheQuery: Statement;
let setCacheQuery: Statement;
let clearCacheQuery: Statement;

export class ProxyError extends Error {
  constructor(res: Response) {
    super(`${res.status} ${res.statusText}`);
  }
}

export function init() {
  if (!CACHE_DB) {
    console.log("cache:", "no db configured");
    return;
  }

  console.log("cache:", "open db", CACHE_DB);
  db = new Database(CACHE_DB, {
    enableLoadExtension: true,
  });
  addEventListener("beforeunload", (e) => {
    e.preventDefault();
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

  getCacheQuery = db.prepare(
    "SELECT * FROM fetches WHERE url = ? and expiry > unixepoch('now')",
  );
  setCacheQuery = db.prepare(
    "INSERT OR REPLACE INTO fetches(url, response, expiry) VALUES (?, ?, ?)",
  );
  clearCacheQuery = db.prepare("DELETE FROM fetches");
}

export function close() {
  console.log("cache:", "close db");
  db.close();
}

/**
 * Return the response from a URL, caching it for `cacheTime` seconds.
 * All responses are no older than `cacheTime` seconds.
 * @param url The URL to fetch
 * @param req The request options
 * @param cacheTime the time in seconds to cache the Response
 * @returns The API Response
 */
export async function cacheFetch(
  url: URL,
  req: RequestInit = {},
  cacheTime: number,
): Promise<Response> {
  const urlStr = url.toString();
  const cache = getCacheQuery.value<CacheRow>(urlStr);
  console.debug(`cache ${cache ? "HIT" : "MISS"} (${urlStr})`);

  let res: Response;
  if (cache) {
    const [_url, response, _expiry] = cache;
    res = new Response(response, { status: 200 });
  } else {
    res = await fetch(url, req);
    if (res.status === 200) {
      const expiry = DateFns.getUnixTime(Date.now()) + cacheTime;
      setCacheQuery.run(urlStr, await res.clone().text(), expiry);
    }
  }

  return res;
}

export function cacheClear(): void {
  clearCacheQuery.run();
}
