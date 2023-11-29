import { type Signal, useSignal } from "@preact/signals";
import { Button } from "../components/Button.tsx";

interface Props {
  action: string;
}

export default function Locator({ action }: Props) {
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
    <form action={action} method="GET">
      <div>
        <label htmlFor="lat">Latitude:</label>
        <br />
        <input
          type="text"
          name="lat"
          value={lat}
          onChange={(e) => lat.value = e.currentTarget.value}
        />
      </div>
      <div>
        <label htmlFor="lon">Longitude:</label>
        <br />
        <input
          type="text"
          name="lon"
          value={lon}
          onChange={(e) => lon.value = e.currentTarget.value}
        />
      </div>
      <Button type="submit" onClick={submit} disabled={loading}>
        Search
      </Button>
      <div>
        {loading.value && <span>Getting location, please wait.</span>}
      </div>
    </form>
  );
}
