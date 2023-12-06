import { defineRoute, Handlers, PageProps } from "$fresh/server.ts";

import type { GlobalStopId } from "../transit-api-client/schema/models/GlobalStopId.ts";
import type { Route } from "../transit-api-client/schema/models/Route.ts";
import type { Itinerary } from "../transit-api-client/schema/models/Itinerary.ts";

import { stopDepartures } from "../transit-api-client/stopDepartures.ts";

import { type Signal, useSignal } from "@preact/signals";
import { FIELD_STOPS } from "../util/stops.ts";
import {
  FIELD_ITINERARY,
  type HiddenItineraries,
  type ItineraryId,
  makeItineraryId,
} from "../util/itineraries.ts";

import { Schedule } from "../components/Schedule.tsx";
import { RouteLabel } from "../components/RouteLabel.tsx";

import Clock from "../islands/Clock.tsx";
import Toggle from "../islands/Toggle.tsx";

// identify itineraries by route and direction.
interface Data {
  stops: GlobalStopId[]; // stops to show
  routes: Route[]; // routes serving the stops fetched from the API
  hidden: HiddenItineraries; // itineraries to hide
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const stops = url.searchParams.getAll(FIELD_STOPS) || [];
    const hidden_its = url.searchParams.getAll(FIELD_ITINERARY) || [];

    if (stops.length == 0) {
      return new Response(null, {
        status: 307,
        headers: { Location: "/stops" },
      });
    }

    const hidden: HiddenItineraries = {};
    for (const id of hidden_its) {
      hidden[id as ItineraryId] = true;
    }

    const routes = [];
    for (const id of stops) {
      const { route_departures } = await stopDepartures(id as GlobalStopId);
      for (const route of route_departures) {
        routes.push(route);
      }
    }

    return ctx.render({ stops, routes, hidden });
  },
};

export default function Routes(
  { url, data: { stops, routes, hidden } }: PageProps<Data>,
) {
  const hideMode = useSignal(false);
  console.log("hidden", Object.keys(hidden));

  return (
    <form className="routes">
      <h1>
        Routes
        <Clock />
      </h1>
      {stops.map((s) => <input type="hidden" name={FIELD_STOPS} value={s} />)}
      <ul>
        {routes.map((route) =>
          route.itineraries?.map((itinerary: Itinerary) => (
            <ItineraryRow data={{ route, itinerary, hideMode, hidden }} />
          ))
        )}
      </ul>
      <ItineraryButtons data={{ url, hideMode, hidden }} />
    </form>
  );
}

interface ItineraryProps {
  route: Route;
  itinerary: Itinerary;
  hidden: HiddenItineraries;
  hideMode: Signal<boolean>;
}
function ItineraryRow({ data }: { data: ItineraryProps }) {
  const { route, itinerary, hidden, hideMode } = data;
  const { schedule_items } = itinerary;
  const id = makeItineraryId(route, itinerary);

  console.log("itinerary", {
    id,
    hideMode: hideMode.value,
  });

  if (hidden[id]) return null;
  return (
    <li className="itinerary">
      <hr style={`border-color: #${route.route_color};`} />
      <Toggle show={hideMode}>
        <input
          type="checkbox"
          name="h"
          value={id}
        />
        {" "}
      </Toggle>
      <RouteLabel route={route} itinerary={itinerary} />
      <div className="schedules">
        {schedule_items.map((s) => <Schedule schedule={s} />)}
      </div>
    </li>
  );
}

interface ItineraryButtons {
  url: URL;
  hidden: HiddenItineraries;
  hideMode: Signal<boolean>;
}
function ItineraryButtons({ data }: { data: ItineraryButtons }) {
  const { url, hidden, hideMode } = data;
  const hidden_list = Object.keys(hidden);
  const urlWithoutHidden = new URL(url);
  urlWithoutHidden.searchParams.delete(FIELD_ITINERARY);

  return (
    <div class="buttons">
      <hr />
      <Toggle hide={hideMode}>
        {hidden_list.map((id) => (
          <input type="hidden" name={FIELD_ITINERARY} value={id} />
        ))}
      </Toggle>
      <Toggle show={hideMode}>
        <button type="submit">Hide Checked Routes</button>
      </Toggle>
      <Toggle hide={hideMode}>
        <button type="button" className="toggle-control">
          Hide Routes
        </button>
      </Toggle>
      {hidden_list.length > 0 && (
        <a className="button" href={urlWithoutHidden.toString()}>
          Show {hidden_list.length} hidden routes
        </a>
      )}
    </div>
  );
}
