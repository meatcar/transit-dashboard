import * as cache from "./cache.ts";

const API_KEY = Deno.env.get("TRANSIT_API_KEY") ?? "";

export function init() {
  cache.init();
}

export class APIError extends Error {
  constructor(res: Response) {
    super(`${res.status} ${res.statusText}`);
  }
}

const BASE_BACKOFF = 1000; // 1 second
let backoff = 0;

export async function fetchAPI(
  cacheTime: number,
  path: string,
  searchParams: URLSearchParams = new URLSearchParams(),
  req: RequestInit = {},
): Promise<Response> {
  if (backoff > 0) await new Promise((resolve) => setTimeout(resolve, backoff));

  const headers = new Headers(req.headers);
  headers.append("apiKey", API_KEY);

  const trimmed = path.replace(/^\//, "");
  const url = new URL(`https://external.transitapp.com/v3/${trimmed}`);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const res = await cache.cacheFetch(url, { ...req, headers }, cacheTime);

  if (res.status === 429) {
    // exponential backoff
    backoff = (backoff || BASE_BACKOFF) * 2;
    return fetchAPI(cacheTime, path, searchParams, req);
  } else {
    return res;
  }
}
