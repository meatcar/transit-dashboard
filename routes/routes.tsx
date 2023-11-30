import * as DateFns from "date-fns";
import { GlobalStopId } from "../transit-api-client/schema/models/GlobalStopId.ts";
import { Itinerary } from "../transit-api-client/schema/models/Itinerary.ts";
import { ScheduleItem } from "../transit-api-client/schema/models/ScheduleItem.ts";
import { stopDepartures } from "../transit-api-client/stopDepartures.ts";
import { Route } from "../transit-api-client/schema/models/Route.ts";

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

function timestamp(t: number) {
  const date = DateFns.fromUnixTime(t);
  return DateFns.format(date, "k:mm");
}

interface LabelProps {
  route: Route;
  itinerary: Itinerary;
}
function Label({ route, itinerary }: LabelProps) {
  const { route_short_name, route_long_name, route_network_name, mode_name } =
    route;
  const { merged_headsign } = itinerary;
  return (
    <div className="label">
      {route_short_name} {route_long_name} {merged_headsign}
      <span className="network">
        {routeType(mode_name)}
        {route_network_name}
      </span>
    </div>
  );
}

interface ScheduleProps {
  schedule: ScheduleItem;
}
function Schedule({ schedule }: ScheduleProps) {
  return (
    <span className="schedule">
      <i>{timestamp(schedule.scheduled_departure_time)}</i>
      {schedule.is_real_time
        ? <b>{timestamp(schedule.departure_time)}</b>
        : <span>&nbsp;</span>}
    </span>
  );
}
import Clock from "../islands/Clock.tsx";

export default async function Routes(req: Request) {
  const url = new URL(req.url);
  const stops = url.searchParams.getAll("stops") || [];
  const hidden = url.searchParams.getAll("hidden") || [];
  const dev = url.searchParams.get("dev") || false;

  const departures = [];
  for (const id of stops) {
    const { route_departures } = await stopDepartures(id as GlobalStopId);
    departures.push(route_departures);
  }

  return (
    <div className="routes">
      <form>
        {stops.map((id) => <input type="hidden" name="stops" value={id} />)}
        {hidden.map((id) => <input type="hidden" name="hidden" value={id} />)}
        <h1>
          Routes
          <Clock />
        </h1>
        <ul>
          {departures.map((routes) => (
            routes.map((rt) =>
              rt.itineraries?.map((it: Itinerary) => (
                !hidden.includes(rt.global_route_id) &&
                (
                  <li>
                    <hr
                      style={`border-color: #${rt.route_color};`}
                    />
                    <Label route={rt} itinerary={it} />
                    {it.schedule_items.map((s) => <Schedule schedule={s} />)}
                    <input
                      type="checkbox"
                      name="hidden"
                      value={rt.global_route_id}
                    />
                  </li>
                )
              ))
            )
          ))}
        </ul>
        <button type="submit">Hide Checked Routes</button>
      </form>
      <form>
        {stops.map((id) => <input type="hidden" name="stops" value={id} />)}
        <a href={`/routes?${stops.map((s) => `stops=${s}`).join("&")}`}>
          Show {hidden.length} hidden routes
        </a>
      </form>
    </div>
  );
}
