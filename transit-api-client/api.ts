import { proxyFetch } from "./proxy.ts";

function api_url(url: string): URL {
  return new URL(`https://external.transitapp.com/v3/${url}`);
}

function api_fetch(url: URL, req: RequestInit = {}): Promise<Response> {
  const headers = new Headers(req.headers);
  headers.append("apiKey", Deno.env.get("TRANSIT_API_KEY") ?? "");
  return fetch(url, { ...req, headers });
}

class APIError extends Error {
  constructor(res: Response) {
    super(`${res.status} ${res.statusText}`);
  }
}

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
  const res = await api_fetch(url);
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
): Promise<any> {
  const url = api_url("/public/stop_departures");
  url.searchParams.set("global_stop_id", global_stop_id);
  url.searchParams.set("time", `${Date.now().valueOf() / 1000}`);
  const res = await api_fetch(url);
  if (res.status !== 200) throw new APIError(res);
  return res.json();
}
