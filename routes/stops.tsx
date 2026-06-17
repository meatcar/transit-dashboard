import { page } from "fresh";
import { define } from "../utils.ts";
import Locator from "../islands/Locator.tsx";
import Slider from "../islands/Slider.tsx";
import { nearbyStops } from "../transit-api-client/nearbyStops.ts";
import { FIELD_STOPS } from "../util/stops.ts";
import type { Stop } from "../transit-api-client/schema/models/Stop.ts";

interface Data {
  gmapsKey: string;
  lat: string;
  lon: string;
  stops: Stop[];
  max_distance: number | undefined;
  selectedStops: string[];
}

export const handler = define.handlers({
  async GET(ctx) {
    const gmapsKey = Deno.env.get("GMAPS_API_KEY") ?? "";
    const url = ctx.url;
    const lat = url.searchParams.get("lat") ?? "";
    const lon = url.searchParams.get("lon") ?? "";

    if (!lat || !lon) {
      return page<Data>({
        gmapsKey,
        lat,
        lon,
        stops: [],
        max_distance: undefined,
        selectedStops: [],
      });
    }

    let max_distance: number | undefined;
    if (url.searchParams.has("max_distance")) {
      max_distance = Number.parseInt(
        url.searchParams.get("max_distance") ?? "",
        10,
      );
    }
    const selectedStops = url.searchParams.getAll(FIELD_STOPS);
    const { stops } = await nearbyStops(lat, lon, max_distance);
    return page<Data>({
      gmapsKey,
      lat,
      lon,
      stops,
      max_distance,
      selectedStops,
    });
  },
});

export default define.page<typeof handler>(({ data }) => {
  const { gmapsKey, lat, lon, stops, max_distance, selectedStops } = data;

  if (!lat || !lon) {
    return (
      <section>
        <h2>Nearby Stops</h2>
        <Locator action="/stops" gmapsKey={gmapsKey} />
      </section>
    );
  }

  return (
    <section className="stops">
      <h1>Nearby Stops</h1>
      <form>
        <input type="hidden" name="lat" value={lat} />
        <input type="hidden" name="lon" value={lon} />
        <Slider
          label="Within"
          unit="meters"
          name="max_distance"
          min="0"
          max="5000"
          value={max_distance || 150}
        />
        <button type="submit">🔄️ Refresh stops</button>
        <button type="submit" formaction="/routes">🔎 Find routes</button>
        <ul>
          {stops.map((stop) => (
            <li key={stop.global_stop_id} className="stop">
              <input
                type="checkbox"
                name={FIELD_STOPS}
                value={stop.global_stop_id}
                checked={selectedStops.includes(stop.global_stop_id)}
              />{" "}
              {stop.stop_name}{" "}
              <small className="stop_id">{stop.global_stop_id}</small>
            </li>
          ))}
        </ul>
      </form>
    </section>
  );
});
