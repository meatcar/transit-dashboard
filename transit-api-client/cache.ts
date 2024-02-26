import { DB, PreparedQuery } from "sqlite";
import * as DateFns from "date-fns";

let db: DB;
const CACHE_DIRECTORY = Deno.env.get("CACHE_DIRECTORY") ?? "cache";
const CACHE_DB = `${CACHE_DIRECTORY}/cache.sqlite3`;
const NO_CACHE = Deno.env.get("NO_CACHE") ?? false;

type CacheURL = string;
type CacheResponse = string;
type CacheExpiry = string;
type CacheRow = [CacheURL, CacheResponse, CacheExpiry];

let getCacheQuery: PreparedQuery;
let setCacheQuery: PreparedQuery;
let clearCacheQuery: PreparedQuery;

export class ProxyError extends Error {
  constructor(res: Response) {
    super(`${res.status} ${res.statusText}`);
  }
}

export function init() {
  if (NO_CACHE) {
    console.log("cache:", "disabled");
    return;
  }

  console.log("cache:", "open db", CACHE_DB);
  db = new DB(CACHE_DB, {});

  addEventListener("beforeunload", (e) => {
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

  db.execute(`
    CREATE TABLE IF NOT EXISTS fetches (
      url TEXT PRIMARY KEY,
      response TEXT NOT NULL,
      expiry INTEGER NOT NULL
    )
  `);

  getCacheQuery = db.prepareQuery<CacheRow>(
    "SELECT * FROM fetches WHERE url = ? and expiry > unixepoch('now')",
  );
  setCacheQuery = db.prepareQuery(
    "INSERT OR REPLACE INTO fetches(url, response, expiry) VALUES (?, ?, ?)",
  );
  clearCacheQuery = db.prepareQuery("DELETE FROM fetches");
}

export function close() {
  console.log("cache:", "close db");
  db.close(true);
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
  const [cache] = getCacheQuery.all([urlStr]);
  console.debug(`cache ${cache ? "HIT" : "MISS"} (${urlStr})`);

  let res: Response;
  if (cache) {
    const [_url, response, _expiry] = cache as CacheRow;
    res = new Response(response, { status: 200 });
  } else {
    res = await fetch(url, req);
    if (res.status === 200) {
      const expiry = DateFns.getUnixTime(Date.now()) + cacheTime;
      setCacheQuery.execute([urlStr, await res.clone().text(), expiry]);
    }
  }

  return res;
}

export function cacheClear(): void {
  clearCacheQuery.execute();
}
