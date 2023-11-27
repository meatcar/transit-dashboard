import * as DateFns from "date-fns";
import { APIError, fetchAPI } from "./api.ts";
import { GlobalStopId } from "./schema/models/GlobalStopId.ts";
import { Route } from "./schema/models/Route.ts";

export const CACHE_TIME = DateFns.minutesToSeconds(5);
export async function stopDepartures(
  global_stop_id: GlobalStopId,
): Promise<Route[]> {
  const params = new URLSearchParams();
  params.set("global_stop_id", global_stop_id);
  params.set("time", `${DateFns.getUnixTime(Date.now())}`);
  const res = await fetchAPI(
    CACHE_TIME,
    "/public/stop_departures",
    params,
  );
  if (res.status !== 200) throw new APIError(res);
  return res.json();
}
