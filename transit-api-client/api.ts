import { cacheFetch } from "./cache.ts";

export class APIError extends Error {
  constructor(res: Response) {
    super(`${res.status} ${res.statusText}`);
  }
}

export async function fetchAPI(
  cacheTime: number,
  path: string,
  searchParams: URLSearchParams = new URLSearchParams(),
  req: RequestInit = {},
  backoff = 1000, // 1 second
): Promise<Response> {
  const headers = new Headers(req.headers);
  headers.append("apiKey", Deno.env.get("TRANSIT_API_KEY") ?? "");

  const trimmed = path.replace(/^\//, "");
  const url = new URL(`https://external.transitapp.com/v3/${trimmed}`);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const res = await cacheFetch(url, { ...req, headers }, cacheTime);

  if (res.status !== 529) {
    return res;
  }
  // exponential backoff
  await new Promise((resolve) => setTimeout(resolve, backoff));
  return fetchAPI(cacheTime, path, searchParams, req, backoff * 2);
}
