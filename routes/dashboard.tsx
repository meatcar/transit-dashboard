import { useSignal } from "@preact/signals";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Badge } from "../components/Badge.tsx";
import Locator from "../islands/Locator.tsx";
import * as API from "../transit-api-client/api.ts";

export default async function Dashboard(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat") || "";
  const lon = url.searchParams.get("lon") || "";
  if (!lat || !lon) return <Locator />;

  let max_distance;
  if (url.searchParams.has("max_distance")) {
    max_distance = Number.parseInt(
      url.searchParams.get("max_distance") ?? "",
      10,
    );
  }
  const { stops } = await API.nearbyStops(
    lat,
    lon,
    max_distance,
  );
  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Nearby Stops</h2>
      <ul>
        {stops.map((stop) => (
          <li className="stop">
            <input type="checkbox" name={stop.global_stop_id} value="true" />
            {" "}
            {stop.stop_name} <small>{stop.global_stop_id}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
