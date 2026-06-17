import { page } from "fresh";
import { define } from "../utils.ts";

import type { GlobalStopId } from "../transit-api-client/schema/models/GlobalStopId.ts";
import type { Route } from "../transit-api-client/schema/models/Route.ts";
import type { Itinerary } from "../transit-api-client/schema/models/Itinerary.ts";
import type { Freshness } from "../transit-api-client/cache.ts";

import { stopDepartures } from "../transit-api-client/stopDepartures.ts";

import { type Signal, useSignal } from "@preact/signals";
import { FIELD_STOPS } from "../util/stops.ts";
import {
  FIELD_ITINERARY,
  type HiddenItineraries,
  type ItineraryId,
  makeItineraryId,
} from "../util/itineraries.ts";

import { FreshnessNote } from "../components/Freshness.tsx";
import { Schedule } from "../components/Schedule.tsx";
import { RouteLabel } from "../components/RouteLabel.tsx";

import Clock from "../islands/Clock.tsx";
import Toggle from "../islands/Toggle.tsx";

interface StopData {
  id: GlobalStopId;
  routes: Route[];
  state: Freshness;
  ageSeconds: number | null;
}

interface Data {
  stops: GlobalStopId[];
  stopData: StopData[];
  hidden: HiddenItineraries;
}

export const handler = define.handlers({
  async GET(ctx) {
    const url = ctx.url;
    const stops = url.searchParams.getAll(FIELD_STOPS);
    const hidden_its = url.searchParams.getAll(FIELD_ITINERARY);

    if (stops.length === 0) {
      return new Response(null, {
        status: 307,
        headers: { Location: "/stops" },
      });
    }

    const hidden: HiddenItineraries = {};
    for (const id of hidden_its) {
      hidden[id as ItineraryId] = true;
    }

    const stopData: StopData[] = [];
    for (const id of stops) {
      const { route_departures, state, ageSeconds } = await stopDepartures(
        id as GlobalStopId,
      );
      stopData.push({
        id: id as GlobalStopId,
        routes: route_departures,
        state,
        ageSeconds,
      });
    }

    return page<Data>({ stops, stopData, hidden });
  },
});

export default define.page<typeof handler>(({ url, data }) => {
  const { stops, stopData, hidden } = data;
  const hideMode = useSignal(false);

  // Flatten routes across stops for rendering, carrying freshness per-stop.
  return (
    <section>
      <form className="routes">
        <h1>
          Nearby Routes
          <Clock />
        </h1>
        {stops.map((s) => (
          <input key={s} type="hidden" name={FIELD_STOPS} value={s} />
        ))}
        <ul>
          {stopData.map(({ id, routes, state, ageSeconds }) =>
            routes.length === 0
              ? (
                <li key={id} className="itinerary unavailable">
                  <FreshnessNote state={state} ageSeconds={ageSeconds} />
                </li>
              )
              : routes.map((route) =>
                route.itineraries?.map((itinerary: Itinerary) => (
                  <ItineraryRow
                    key={`${id}-${route.global_route_id}-${itinerary.direction_id}`}
                    data={{
                      route,
                      itinerary,
                      hideMode,
                      hidden,
                      state,
                      ageSeconds,
                    }}
                  />
                ))
              )
          )}
        </ul>
        <ItineraryButtons data={{ url, hideMode, hidden }} />
      </form>
    </section>
  );
});

interface ItineraryProps {
  route: Route;
  itinerary: Itinerary;
  hidden: HiddenItineraries;
  hideMode: Signal<boolean>;
  state: Freshness;
  ageSeconds: number | null;
}
function ItineraryRow({ data }: { data: ItineraryProps }) {
  const { route, itinerary, hidden, hideMode, state, ageSeconds } = data;
  const { schedule_items } = itinerary;
  const id = makeItineraryId(route, itinerary);

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
      <FreshnessNote state={state} ageSeconds={ageSeconds} />
      <div className="schedules">
        {schedule_items.map((s) => (
          <Schedule key={s.scheduled_departure_time} schedule={s} />
        ))}
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
          <input key={id} type="hidden" name={FIELD_ITINERARY} value={id} />
        ))}
      </Toggle>
      <Toggle show={hideMode}>
        <button type="submit">✅ Hide Checked Routes</button>
      </Toggle>
      <Toggle hide={hideMode}>
        <button type="button" className="toggle-control">
          👻 Hide Routes
        </button>
      </Toggle>
      {hidden_list.length > 0 && (
        <a className="button" href={urlWithoutHidden.toString()}>
          ✴️ Show {hidden_list.length} hidden routes
        </a>
      )}
    </div>
  );
}
