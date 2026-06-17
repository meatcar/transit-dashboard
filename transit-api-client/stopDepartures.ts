import { fetchAPI } from "./api.ts";
import type { CacheResult } from "./api.ts";
import type { GlobalStopId } from "./schema/models/GlobalStopId.ts";
import type { Route } from "./schema/models/Route.ts";

export const SOFT_TTL = 5 * 60; // 5 minutes
export const HARD_TTL = 60 * 60; // 60 minutes

export interface StopDeparturesResult extends CacheResult {
  route_departures: Route[];
}

export async function stopDepartures(
  global_stop_id: GlobalStopId,
): Promise<StopDeparturesResult> {
  const params = new URLSearchParams();
  params.set("global_stop_id", global_stop_id);
  const result = await fetchAPI(
    SOFT_TTL,
    HARD_TTL,
    "/public/stop_departures",
    params,
  );

  if (result.state === "unavailable") {
    return { ...result, route_departures: [] };
  }

  const data = await result.response!.json() as { route_departures: Route[] };
  return { ...result, route_departures: data.route_departures };
}
