import Locator from "../islands/Locator.tsx";

export default function Home() {
  return (
    <section>
      <h2>Find Stops</h2>
      <Locator action="/stops" />
    </section>
  );
}
