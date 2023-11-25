import { useSignal } from "@preact/signals";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Badge } from "../components/Badge.tsx";
import Locator from "../islands/Locator.tsx";
import { nearbyStops } from "../transit-api-client/api.ts";

export default async function Dashboard(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat") || "";
  const lon = url.searchParams.get("lon") || "";
  if (!lat || !lon) return <Locator />;

  const stops = await nearbyStops(lat, lon);
  return <p>{stops}</p>;
}
