import { cacheFetch } from "./cache.ts";
import * as DateFns from "date-fns";

function api_url(url: string): URL {
  const trimmed = url.replace(/^\//, "");
  return new URL(`https://external.transitapp.com/v3/${trimmed}`);
}

async function api_fetch(
  url: URL,
  req: RequestInit = {},
  cacheTime = 0,
  backoff = 1000, // 1 second
): Promise<Response> {
  const headers = new Headers(req.headers);
  headers.append("apiKey", Deno.env.get("TRANSIT_API_KEY") ?? "");

  const res = await cacheFetch(url, { ...req, headers }, cacheTime);

  if (res.status !== 529) {
    return res;
  }
  // exponential backoff
  await new Promise((resolve) => setTimeout(resolve, backoff));
  return api_fetch(url, req, cacheTime, backoff * 2);
}

class APIError extends Error {
  constructor(res: Response) {
    super(`${res.status} ${res.statusText}`);
  }
}

export const nearbyStopsCacheTime = DateFns.hoursToSeconds(24);
export async function nearbyStops(
  lat: string,
  lon: string,
  max_distance = 150,
): Promise<{ stops: Stop[] }> {
  const url = api_url("/public/nearby_stops");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  if (max_distance != 150) {
    url.searchParams.set("max_distance", max_distance.toString());
  }
  const res = await api_fetch(url, {}, nearbyStopsCacheTime);
  if (res.status !== 200) throw new APIError(res);
  return await res.json();
}

type GlobalStopId = string;
interface Stop {
  distance: number;
  global_stop_id: GlobalStopId;
  location_type: 0 | 2;
  parent_station_global_stop_id: GlobalStopId;
  route_type: number;
  stop_lat: number;
  stop_lon: number;
  stop_name: string;
  stop_code: string;
  rt_stop_id: string;
  wheelchair_boarding: 0 | 1 | 2;
}

export async function stopDepartures(
  global_stop_id: GlobalStopId,
): Promise<unknown> {
  const url = api_url("/public/stop_departures");
  url.searchParams.set("global_stop_id", global_stop_id);
  url.searchParams.set("time", `${Date.now().valueOf() / 1000}`);
  const res = await api_fetch(url, {});
  if (res.status !== 200) throw new APIError(res);
  return res.json();
}
