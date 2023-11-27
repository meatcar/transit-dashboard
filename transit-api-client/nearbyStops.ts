import * as DateFns from "date-fns";
import { APIError, fetchAPI } from "./api.ts";
import { Stop } from "./schema/models/Stop.ts";

export const CACHE_TIME = DateFns.hoursToSeconds(24);
export async function nearbyStops(
  lat: string,
  lon: string,
  max_distance = 150,
): Promise<{ stops: Stop[] }> {
  const params = new URLSearchParams();
  params.set("lat", lat);
  params.set("lon", lon);
  if (max_distance != 150) {
    params.set("max_distance", max_distance.toString());
  }
  const res = await fetchAPI(
    CACHE_TIME,
    "/public/nearby_stops",
    params,
    {},
  );
  if (res.status !== 200) throw new APIError(res);
  return await res.json();
}
