import type { GlobalStopId } from "../transit-api-client/schema/models/GlobalStopId.ts";
import type { DirectionId } from "../transit-api-client/schema/models/DirectionId.ts";
import type { Itinerary } from "../transit-api-client/schema/models/Itinerary.ts";
import type { Route } from "../transit-api-client/schema/models/Route.ts";

export type ItineraryId = `${GlobalStopId}|${DirectionId}`;
export type HiddenItineraries = Record<ItineraryId, true>;

export const FIELD_ITINERARY = "h";

/* identify itineraries by route and direction. */
export function makeItineraryId(
  route: Route,
  itinerary: Itinerary,
): ItineraryId {
  return `${route.global_route_id}|${itinerary.direction_id}`;
}
