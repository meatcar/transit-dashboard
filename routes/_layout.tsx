import { LayoutProps } from "$fresh/server.ts";
import { Badge } from "../components/Badge.tsx";

export default function Layout({ Component, state }: LayoutProps) {
  // do something with state here
  return (
    <main>
      <Component />
    </main>
  );
}
