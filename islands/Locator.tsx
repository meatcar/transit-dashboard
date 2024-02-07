import { Head, IS_BROWSER } from "$fresh/runtime.ts";
import { type Signal, useSignal, useSignalEffect } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { JSX } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";

const GMAPS_API_KEY = IS_BROWSER ? "" : Deno.env.get("GMAPS_API_KEY");
window.initMap = () => {};

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
  const loading = useSignal(false);
  const lat = useSignal("");
  const lon = useSignal("");
  const addressRef = useRef<HTMLInputElement>(null);

  // deno-lint-ignore no-explicit-any
  let autocomplete: any;
  useSignalEffect(() => {
    const { Autocomplete } = window.google?.maps?.places || {};

    autocomplete = new Autocomplete(
      addressRef.current,
      {
        fields: ["address_components", "geometry", "name"],
        types: ["address"],
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      lat.value = place.geometry?.location.lat();
      lon.value = place.geometry?.location.lng();
    });
    return () => {
      autocomplete.removeListener("place_changed");
    };
  });

  function asyncGetCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async function getLocation() {
    loading.value = true;
    const position = await asyncGetCurrentPosition();
    lat.value = position.coords.latitude.toString();
    lon.value = position.coords.longitude.toString();
    loading.value = false;
  }

  async function submit(e: Event) {
    e.preventDefault();
    if (lat.value == "" || lon.value == "") {
      await getLocation();
    }
    (e.target as HTMLFormElement).form.submit();
  }

  function onInput(s: Signal): JSX.GenericEventHandler<HTMLInputElement> {
    return (e) => s.value = e.currentTarget.value;
  }

  return (
    <form action={action} method="GET">
      <Head>
        <script
          key="gmaps"
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&libraries=places&callback=initMap`}
        />
        <script>{"function initMap() { console.log('gmaps init'); }"}</script>
      </Head>
      <input type="hidden" name="lat" value={lat} onInput={onInput(lat)} />
      <input type="hidden" name="lon" value={lon} onInput={onInput(lon)} />
      <Button type="submit" onClick={submit} disabled={loading}>
        📍Use my current location
      </Button>
      <div className="hr">OR</div>
      <div>
        <input
          type="text"
          name="address"
          placeholder="Find an address"
          ref={addressRef}
        />
      </div>
      <Button type="submit" onClick={submit} disabled={loading}>
        🔎 Search
      </Button>
      <div>
        {loading.value && <span>Requesting location...</span>}
      </div>
    </form>
  );
}
