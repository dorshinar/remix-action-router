import { join } from "node:path";
import { ActionRoutes, ActionsStore } from "./typings";

let actionsStore: ActionsStore = { actions: {}, state: "UNINITIALIZED" };

export function loadRoutes() {
  if (
    process.env.NODE_ENV !== "development" &&
    actionsStore?.state === "INITIALIZED"
  ) {
    return actionsStore;
  }

  const buildPath = join(process.cwd(), "build", "index.js");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const build = require(buildPath);

  const routes = build.routes as ActionRoutes;

  const actions = Object.fromEntries(
    Object.entries(routes).filter(
      ([route]) => route.startsWith("routes/actions__") || route === "root"
    )
  );

  actionsStore = { actions, state: "INITIALIZED" };

  return actionsStore;
}
