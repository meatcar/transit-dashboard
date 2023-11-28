import Locator from "../islands/Locator.tsx";
import Slider from "../islands/Slider.tsx";
import { nearbyStops } from "../transit-api-client/nearbyStops.ts";

export default async function Stops(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat") || "";
  const lon = url.searchParams.get("lon") || "";
  if (!lat || !lon) return <Locator action="/stops" />;

  let max_distance;
  if (url.searchParams.has("max_distance")) {
    max_distance = Number.parseInt(
      url.searchParams.get("max_distance") ?? "",
      10,
    );
  }
  const { stops } = await nearbyStops(
    lat,
    lon,
    max_distance,
  );
  return (
    <div class="stops">
      <h1>Nearby Stops</h1>
      <form>
        <input type="hidden" name="lat" value={lat} />
        <input type="hidden" name="lon" value={lon} />
        <Slider
          name="max_distance"
          min="0"
          max="5000"
          value={max_distance || 150}
        />
        <button type="submit">Refresh</button>
      </form>
      <form action="/routes">
        <ul>
          {stops.map((stop) => (
            <li className="stop">
              <input type="checkbox" name="stops" value={stop.global_stop_id} />
              {" "}
              {stop.stop_name} <small>{stop.global_stop_id}</small>
            </li>
          ))}
        </ul>
        <button type="submit">Find Routes</button>
      </form>
    </div>
  );
}
