import { join } from "node:path";
import { ActionRoutes } from "./typings";

export function loadRoutes() {
  if (global.actionsStore?.actions) return;

  const buildPath = join(process.cwd(), "build", "index.js");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const build = require(buildPath);

  const routes = build.routes as ActionRoutes;

  const actions = Object.fromEntries(
    Object.entries(routes).filter(
      ([route]) => route.startsWith("routes/actions__") || route === "root"
    )
  );

  global.actionsStore = { actions };
}
