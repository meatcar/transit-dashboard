import { Itinerary } from "../transit-api-client/schema/models/Itinerary.ts";
import { Route } from "../transit-api-client/schema/models/Route.ts";

interface RouteLabelProps {
  route: Route;
  itinerary: Itinerary;
}
export function RouteLabel({ route, itinerary }: RouteLabelProps) {
  function routeType(s?: string) {
    switch (s) {
      case "Bus":
        return "🚌";
      case "Subway":
        return "🚇";
      case "Commuter Rail":
        return "🚂";
      default:
        return "🚀";
    }
  }

  const { route_short_name, route_long_name, route_network_name, mode_name } =
    route;
  const { merged_headsign } = itinerary;
  return (
    <span className="label">
      <strong>{route_short_name}</strong> {route_long_name} {merged_headsign}
      <span className="network">
        {routeType(mode_name)}
        {route_network_name}
      </span>
    </span>
  );
}
