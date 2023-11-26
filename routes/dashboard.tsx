import { useSignal } from "@preact/signals";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Badge } from "../components/Badge.tsx";
import Locator from "../islands/Locator.tsx";
import * as API from "../transit-api-client/api.ts";

export default async function Dashboard(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat") || "";
  const lon = url.searchParams.get("lon") || "";
  const max_distance = url.searchParams.get("max_distance") || "";
  if (!lat || !lon) return <Locator />;

  const { stops } = await API.nearbyStops(
    lat,
    lon,
  );
  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Nearby Stops</h2>
      <ul>
        {stops.map((stop) => (
          <li className="stop">
            {stop.stop_name} <small>{stop.global_stop_id}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
