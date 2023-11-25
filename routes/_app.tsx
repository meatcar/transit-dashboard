import { AppProps } from "$fresh/server.ts";
import { Badge } from "../components/Badge.tsx";

export default function App({ Component }: AppProps) {
  return (
    <html>
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
                <a href="/dashboard">Dashboard</a>
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
