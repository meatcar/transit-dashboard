import { GlobalStopId } from "../transit-api-client/schema/models/GlobalStopId.ts";
import { Itinerary } from "../transit-api-client/schema/models/Itinerary.ts";
import { stopDepartures } from "../transit-api-client/stopDepartures.ts";
import Clock from "../islands/Clock.tsx";
import { RouteLabel } from "../components/RouteLabel.tsx";
import { Schedule } from "../components/Schedule.tsx";

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
                    <RouteLabel route={rt} itinerary={it} />
                    <div className="schedules">
                      {it.schedule_items.map((
                        s,
                      ) => <Schedule schedule={s} />)}
                    </div>
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
