import type { PageProps } from "fresh";

export default function Layout({ Component }: PageProps) {
  return (
    <main>
      <Component />
    </main>
  );
}
