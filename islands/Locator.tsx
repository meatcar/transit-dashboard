import { type Signal, useSignal, useSignalEffect } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";

export default function Locator() {
  const loading: Signal<boolean> = useSignal(false);
  const lat: Signal<string> = useSignal("");
  const lon: Signal<string> = useSignal("");

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async function getLocation(e: Event) {
    loading.value = true;
    if (!IS_BROWSER) return;
    const position = await getCurrentPosition();
    lat.value = position.coords.latitude.toString();
    lon.value = position.coords.longitude.toString();
    loading.value = false;
  }

  async function submit(e: Event) {
    e.preventDefault();
    if (lat.value == "" || lon.value == "") {
      await getLocation(e);
    }
    (e.target as HTMLFormElement).form.submit();
  }

  return (
    <form action="/dashboard" method="GET">
      <div>
        <h2>Location</h2>
        <div>
          <label htmlFor="lat">Latitude:</label>
          <br />
          <input type="text" name="lat" value={lat} />
        </div>
        <div>
          <label htmlFor="lon">Longitude:</label>
          <br />
          <input type="text" name="lon" value={lon} />
        </div>
      </div>
      <Button type="submit" onClick={submit} disabled={loading}>
        Open Dashboard
      </Button>
      <div>
        {loading.value && <span>Getting location, please wait.</span>}
      </div>
    </form>
  );
}
