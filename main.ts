import { App, staticFiles } from "fresh";
import { init } from "./transit-api-client/api.ts";

init();

export const app = new App()
  .use(staticFiles())
  .fsRoutes();
