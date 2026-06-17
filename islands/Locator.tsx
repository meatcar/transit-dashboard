import { Head } from "fresh/runtime";
import {
  type Signal,
  signal,
  useSignal,
  useSignalEffect,
} from "@preact/signals";
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

// Module-level signal so the effect re-runs when Maps finishes loading.
const mapsReady = signal(false);
globalThis.initMap = () => {
  mapsReady.value = true;
};
// Handle the race: if Maps loaded before island hydrated, set immediately.
if (globalThis.google?.maps?.places?.PlaceAutocompleteElement) {
  mapsReady.value = true;
}

export default function Locator({ action, gmapsKey }: Props) {
  const loading = useSignal(false);
  const lat = useSignal("");
  const lon = useSignal("");
  const error = useSignal<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useSignalEffect(() => {
    if (!mapsReady.value) return; // reactive: re-runs when Maps finishes loading
    const container = containerRef.current;
    const PlaceAutocompleteElement = globalThis.google?.maps?.places
      ?.PlaceAutocompleteElement;
    if (!container || !PlaceAutocompleteElement) return;

    // deno-lint-ignore no-explicit-any
    const el: HTMLElement = new (PlaceAutocompleteElement as any)();

    const handleSelect = async (e: Event) => {
      // deno-lint-ignore no-explicit-any
      const place = (e as any).placePrediction.toPlace();
      await place.fetchFields({ fields: ["location"] });
      lat.value = place.location.lat().toString();
      lon.value = place.location.lng().toString();
      error.value = null;
    };

    el.addEventListener("gmp-select", handleSelect);
    container.appendChild(el);

    return () => {
      el.removeEventListener("gmp-select", handleSelect);
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

  function searchSubmit(e: Event) {
    e.preventDefault();
    if (lat.value && lon.value) {
      formRef.current?.submit();
    } else {
      error.value = "Select an address from the suggestions";
    }
  }

  async function useMyLocation() {
    await getLocation();
    formRef.current?.submit();
  }

  function onInput(s: Signal): JSX.GenericEventHandler<HTMLInputElement> {
    return (e) => s.value = e.currentTarget.value;
  }

  return (
    <form ref={formRef} action={action} method="GET" onSubmit={searchSubmit}>
      <Head>
        <script
          key="gmaps"
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${gmapsKey}&libraries=places&callback=initMap&loading=async`}
        />
        <script>{"window.initMap=function(){};"}</script>
      </Head>
      <input type="hidden" name="lat" value={lat} onInput={onInput(lat)} />
      <input type="hidden" name="lon" value={lon} onInput={onInput(lon)} />
      <Button type="button" onClick={useMyLocation} disabled={loading}>
        📍Use my current location
      </Button>
      <div className="hr">OR</div>
      <div ref={containerRef} />
      {error.value && <span className="error">{error.value}</span>}
      <Button type="submit" disabled={loading}>
        🔎 Search
      </Button>
      <div>
        {loading.value && <span>Requesting location...</span>}
      </div>
    </form>
  );
}
