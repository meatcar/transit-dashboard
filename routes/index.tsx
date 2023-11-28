import Locator from "../islands/Locator.tsx";

export default function Home() {
  return (
    <div>
      <h2>Find Stops</h2>
      <Locator action="/stops" />
    </div>
  );
}
