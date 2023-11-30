import { JSX } from "preact/jsx-runtime";
import { Handlers, PageProps } from "$fresh/server.ts";

import { GlobalStopId } from "../transit-api-client/schema/models/GlobalStopId.ts";
import { Route } from "../transit-api-client/schema/models/Route.ts";
import { Itinerary } from "../transit-api-client/schema/models/Itinerary.ts";
import { DirectionId } from "../transit-api-client/schema/models/DirectionId.ts";

import { stopDepartures } from "../transit-api-client/stopDepartures.ts";

import Clock from "../islands/Clock.tsx";
import { RouteLabel } from "../components/RouteLabel.tsx";
import { Schedule } from "../components/Schedule.tsx";

// input field names.
const form = {
  stops: "stops",
  hidden_its: "h",
  hide_routes: "hide",
};

// identify itineraries by route and direction.
type ItineraryId = `${GlobalStopId}|${DirectionId}`;
interface Data {
  stops: GlobalStopId[];
  routes: Route[];
  hidden_itns: Set<ItineraryId>;
  shouldHide: boolean;
}

// TODO: hide/show checkboxes using interactive islands to save a reload.
export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const stops = url.searchParams.getAll(form.stops) || [];
    const itns = url.searchParams.getAll(form.hidden_its) || [];
    const shouldHide = url.searchParams.get(form.hide_routes) === "true";

    const set = new Set<ItineraryId>();
    for (const id of itns) {
      set.add(id as ItineraryId);
    }

    const routes = [];
    for (const id of stops) {
      console.time(id);
      const { route_departures } = await stopDepartures(id as GlobalStopId);
      console.timeEnd(id);
      for (const route of route_departures) {
        routes.push(route);
      }
    }

    return ctx.render({ stops, routes, hidden_itns: set, shouldHide });
  },
};

function itineraryId(route: Route, itinerary: Itinerary): ItineraryId {
  return `${route.global_route_id}|${itinerary.direction_id}`;
}

interface ItineraryProps extends Data {
  route: Route;
  itinerary: Itinerary;
  show: boolean;
}
function Itinerary({ route, itinerary, shouldHide, show }: ItineraryProps) {
  const { schedule_items } = itinerary;
  if (!show) return null;
  return (
    <li className="itinerary">
      <hr style={`border-color: #${route.route_color};`} />
      {shouldHide && (
        <input
          type="checkbox"
          name={form.hidden_its}
          value={itineraryId(route, itinerary)}
        />
      )}{" "}
      <RouteLabel route={route} itinerary={itinerary} />
      <div className="schedules">
        {schedule_items.map((s) => (
          <Schedule schedule={s} />
        ))}
      </div>
    </li>
  );
}

export default function Routes(props: PageProps<Data>) {
  const { stops, hidden_itns, routes } = props.data;

  return (
    <form className="routes">
      <h1>
        Routes
        <Clock />
      </h1>
      {stops.map((s) => (
        <input type="hidden" name={form.stops} value={s} />
      ))}
      <ul>
        {routes.map((route) =>
          route.itineraries?.map((itinerary: Itinerary) => (
            <Itinerary
              route={route}
              itinerary={itinerary}
              show={!hidden_itns.has(itineraryId(route, itinerary))}
              {...props.data}
            />
          ))
        )}
      </ul>
      <Buttons {...props} />
    </form>
  );
}

function Buttons({ data, url }: PageProps<Data>) {
  const { hidden_itns, shouldHide } = data;
  const urlWithoutHidden = new URL(url);
  urlWithoutHidden.searchParams.delete(form.hidden_its);

  const urlWithHideOn = new URL(url);
  urlWithHideOn.searchParams.set(form.hide_routes, "true");

  const hiddenInputs = [...hidden_itns].map((id) => (
    <input type="hidden" name={form.hidden_its} value={id} />
  ));

  return (
    <div class="buttons">
      <hr />
      {shouldHide && hiddenInputs}
      {shouldHide && <button type="submit">Hide Checked Routes</button>}
      {!shouldHide && (
        <a href={urlWithHideOn.toString()} className="button">
          Hide Routes
        </a>
      )}
      {hidden_itns.size > 0 && (
        <a href={urlWithoutHidden.toString()} className="button">
          Show {hidden_itns.size} hidden routes
        </a>
      )}
    </div>
  );
}
