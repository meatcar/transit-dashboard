import { fetchAPI } from "./api.ts";
import type { CacheResult } from "./api.ts";
import type { Stop } from "./schema/models/Stop.ts";

export const SOFT_TTL = 24 * 60 * 60; // 24 hours
export const HARD_TTL = 365 * 24 * 60 * 60; // 1 year (stops rarely move)

export interface NearbyStopsResult extends CacheResult {
  stops: Stop[];
}

export async function nearbyStops(
  lat: string,
  lon: string,
  max_distance = 150,
): Promise<NearbyStopsResult> {
  const params = new URLSearchParams();
  params.set("lat", lat);
  params.set("lon", lon);
  if (max_distance !== 150) {
    params.set("max_distance", max_distance.toString());
  }
  const result = await fetchAPI(
    SOFT_TTL,
    HARD_TTL,
    "/public/nearby_stops",
    params,
  );

  if (result.state === "unavailable") {
    return { ...result, stops: [] };
  }

  const data = await result.response!.json() as { stops: Stop[] };
  return { ...result, stops: data.stops };
}
