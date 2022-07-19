import { requireBuild } from "./require-build";
import type { ActionRoutes, ActionsStore } from "./typings";

let actionsStore: ActionsStore = { actions: {}, state: "UNINITIALIZED" };

export function loadRoutes() {
  if (
    process.env.NODE_ENV !== "development" &&
    actionsStore?.state === "INITIALIZED"
  ) {
    return actionsStore;
  }

  const build = requireBuild();

  const routes = build.routes as ActionRoutes;

  const actions = Object.fromEntries(
    Object.entries(routes).filter(
      ([route]) => route.startsWith("routes/actions__") || route === "root"
    )
  );

  actionsStore = { actions, state: "INITIALIZED" };

  return actionsStore;
}

export function resetStore() {
  actionsStore = { actions: {}, state: "UNINITIALIZED" };
}
