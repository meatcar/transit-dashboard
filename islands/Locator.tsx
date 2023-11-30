import { Head, IS_BROWSER } from "$fresh/runtime.ts";
import { type Signal, useSignal } from "@preact/signals";
import { Button } from "../components/Button.tsx";

const GMAPS_API_KEY = IS_BROWSER ? "" : Deno.env.get("GMAPS_API_KEY");

interface Props {
  action: string;
}

declare global {
  interface Window {
    initMap: () => void;
    // deno-lint-ignore no-explicit-any
    google: any; // google API object
  }
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

  if (IS_BROWSER) {
    window.initMap = () => {
      const { Autocomplete } = window.google?.maps?.places || {};

      const autocomplete = new Autocomplete(
        document.getElementsByName("address")[0],
        {
          fields: ["address_components", "geometry", "name"],
          types: ["address"],
        },
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        console.dir(place);
        lat.value = place.geometry?.location.lat();
        lon.value = place.geometry?.location.lng();
      });
    };
  }

  return (
    <form action={action} method="GET">
      {!IS_BROWSER && (
        <Head>
          <script
            async
            defer
            src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&libraries=places&callback=initMap`}
          />
        </Head>
      )}
      <div>
        <label htmlFor="address">Address:</label>
        <br />
        <input type="text" name="address" />
      </div>
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
