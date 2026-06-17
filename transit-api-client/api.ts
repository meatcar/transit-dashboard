import * as cache from "./cache.ts";
import type { CacheResult } from "./cache.ts";

export type { CacheResult };

const API_KEY = Deno.env.get("TRANSIT_API_KEY") ?? "";

export function init() {
  cache.init();
}

export class APIError extends Error {
  constructor(res: Response) {
    super(`${res.status} ${res.statusText}`);
  }
}

export async function fetchAPI(
  softTtl: number,
  hardTtl: number,
  path: string,
  searchParams: URLSearchParams = new URLSearchParams(),
  req: RequestInit = {},
): Promise<CacheResult> {
  const headers = new Headers(req.headers);
  headers.append("apiKey", API_KEY);

  const trimmed = path.replace(/^\//, "");
  const url = new URL(`https://external.transitapp.com/v3/${trimmed}`);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  return await cache.cacheFetch(url, softTtl, hardTtl, { ...req, headers });
}
