import { Head } from "fresh/runtime";
import { type Signal, useSignal, useSignalEffect } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { JSX } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";

interface Props {
  action: string;
  gmapsKey: string;
}

declare global {
  var initMap: () => void; // google API callback
  // deno-lint-ignore no-explicit-any
  var google: any; // google API object
}

globalThis.initMap = () => {};

export default function Locator({ action, gmapsKey }: Props) {
  const loading = useSignal(false);
  const lat = useSignal("");
  const lon = useSignal("");
  const containerRef = useRef<HTMLDivElement>(null);

  useSignalEffect(() => {
    const container = containerRef.current;
    const PlaceAutocompleteElement = globalThis.google?.maps?.places
      ?.PlaceAutocompleteElement;
    if (!container || !PlaceAutocompleteElement) return;

    // deno-lint-ignore no-explicit-any
    const el: HTMLElement = new (PlaceAutocompleteElement as any)();

    const handleSelect = async (e: Event) => {
      // deno-lint-ignore no-explicit-any
      const place = (e as any).place;
      await place.fetchFields({ fields: ["location"] });
      lat.value = place.location.lat().toString();
      lon.value = place.location.lng().toString();
    };

    el.addEventListener("gmp-placeselect", handleSelect);
    container.appendChild(el);

    return () => {
      el.removeEventListener("gmp-placeselect", handleSelect);
      container.removeChild(el);
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
    (e.target as HTMLButtonElement).form?.submit();
  }

  function onInput(s: Signal): JSX.GenericEventHandler<HTMLInputElement> {
    return (e) => s.value = e.currentTarget.value;
  }

  return (
    <form action={action} method="GET">
      <Head>
        <script
          key="gmaps"
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${gmapsKey}&libraries=places&callback=initMap&loading=async`}
        />
        <script>{"function initMap() { console.log('gmaps init'); }"}</script>
      </Head>
      <input type="hidden" name="lat" value={lat} onInput={onInput(lat)} />
      <input type="hidden" name="lon" value={lon} onInput={onInput(lon)} />
      <Button type="submit" onClick={submit} disabled={loading}>
        📍Use my current location
      </Button>
      <div className="hr">OR</div>
      <div ref={containerRef} />
      <Button type="submit" onClick={submit} disabled={loading}>
        🔎 Search
      </Button>
      <div>
        {loading.value && <span>Requesting location...</span>}
      </div>
    </form>
  );
}
