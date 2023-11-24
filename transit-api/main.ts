import { nearby_stops, stop_departures } from "./api.ts";

export function format_departures({ route_departures }) {
  const result = [];
  for (const deps of route_departures) {
    const { mode_name, route_short_name } = deps;
    // console.dir(deps);
    for (const it of deps.itineraries) {
      const name = `${route_short_name} (${mode_name}) ${it.headsign}`;
      for (const sch of it.schedule_items) {
        if (!sch.is_cancelled) {
          result.push({
            name,
            is_real_time: sch.is_real_time,
            time: new Date(sch.departure_time * 1000),
          });
        }
      }
    }
  }
  return result.sort((a, b) => a.time.valueOf() - b.time.valueOf());
}

if (import.meta.main) {
  const [lat, lon] = "43.44265338905237, -79.67963151907847".split(", ");

  const { stops } = await nearby_stops(lat, lon);
  console.dir(stops);

  // const departures = await stop_departures("OTON:12480");
  // console.dir(format_departures(departures))
}
