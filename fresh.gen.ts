// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_layout from "./routes/_layout.tsx";
import * as $_middleware from "./routes/_middleware.tsx";
import * as $index from "./routes/index.tsx";
import * as $routes from "./routes/routes.tsx";
import * as $stops from "./routes/stops.tsx";
import * as $Clock from "./islands/Clock.tsx";
import * as $Locator from "./islands/Locator.tsx";
import * as $Slider from "./islands/Slider.tsx";
import * as $Toggle from "./islands/Toggle.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_layout.tsx": $_layout,
    "./routes/_middleware.tsx": $_middleware,
    "./routes/index.tsx": $index,
    "./routes/routes.tsx": $routes,
    "./routes/stops.tsx": $stops,
  },
  islands: {
    "./islands/Clock.tsx": $Clock,
    "./islands/Locator.tsx": $Locator,
    "./islands/Slider.tsx": $Slider,
    "./islands/Toggle.tsx": $Toggle,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
