import { Head, IS_BROWSER } from "$fresh/runtime.ts";
import { type Signal, signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { JSX } from "preact/jsx-runtime";

const GMAPS_API_KEY = IS_BROWSER ? "" : Deno.env.get("GMAPS_API_KEY");

interface Props {
  action: string;
}

declare global {
  interface Window {
    initMap: () => void; // google API callback
    // deno-lint-ignore no-explicit-any
    google: any; // google API object
  }
}

export default function Locator({ action }: Props) {
  const loading = signal(false);
  const lat = signal("");
  const lon = signal("");

  function asyncGetCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async function getLocation(e: Event) {
    loading.value = true;
    const position = await asyncGetCurrentPosition();
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

  function onInput(s: Signal): JSX.GenericEventHandler<HTMLInputElement> {
    return (e) => s.value = e.currentTarget.value;
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
        <input type="text" name="lat" value={lat} onInput={onInput(lat)} />
      </div>
      <div>
        <label htmlFor="lon">Longitude:</label>
        <br />
        <input type="text" name="lon" value={lon} onInput={onInput(lon)} />
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
