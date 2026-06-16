import { define } from "../utils.ts";
import Locator from "../islands/Locator.tsx";

export const handler = define.handlers({
  GET(_ctx) {
    return { data: { gmapsKey: Deno.env.get("GMAPS_API_KEY") ?? "" } };
  },
});

export default define.page<typeof handler>(({ data }) => {
  return (
    <section>
      <h2>Find Stops</h2>
      <Locator action="/stops" gmapsKey={data.gmapsKey} />
    </section>
  );
});
