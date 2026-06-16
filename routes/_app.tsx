import type { PageProps } from "fresh";
import { Badge } from "../components/Badge.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>transit-dashboard</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header>
          <nav>
            <ul>
              <li>
                <a href="/" class="logo">🚌</a>
              </li>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/stops">Stops</a>
              </li>
              <li>
                <a href="/routes">Routes</a>
              </li>
            </ul>
          </nav>
        </header>
        <Component />
        <footer>
          <Badge />
        </footer>
      </body>
    </html>
  );
}
