import { Database } from "sqlite3";
import * as DateFns from "date-fns";

const CACHE_DBNAME = Deno.env.get("CACHE_DBNAME") ?? "cache";
const db = new Database(`db/${CACHE_DBNAME}.sqlite3`, {
  enableLoadExtension: true,
});
addEventListener("unload", () => {
  console.log("Closing DB");
  db.close();
});

type CacheURL = string;
type CacheResponse = string;
type CacheExpiry = string;
type CacheRow = [CacheURL, CacheResponse, CacheExpiry];

db.exec(
  `CREATE TABLE IF NOT EXISTS fetches (
    url TEXT PRIMARY KEY,
    response TEXT NOT NULL,
    expiry INTEGER NOT NULL
  )`,
);

const getCache = db.prepare(
  "SELECT * FROM fetches WHERE url = ? and expiry > unixepoch('now')",
);
const setCache = db.prepare(
  "INSERT OR REPLACE INTO fetches(url, response, expiry) VALUES (?, ?, ?)",
);

export class ProxyError extends Error {
  constructor(res: Response) {
    super(`${res.status} ${res.statusText}`);
  }
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
  const cache = getCache.value<CacheRow>(urlStr);
  console.debug(`cache ${cache ? "HIT" : "MISS"} (${urlStr})`);

  let res: Response;
  if (cache) {
    const [_url, response, _expiry] = cache;
    res = new Response(response, { status: 200 });
    return res;
  }

  res = await fetch(url, req);
  if (res.status === 200) {
    const expiry = DateFns.getUnixTime(Date.now()) + cacheTime;
    setCache.run(
      urlStr,
      await res.clone().text(),
      expiry,
    );
  }

  return res;
}
