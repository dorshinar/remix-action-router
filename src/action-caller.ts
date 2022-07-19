import { join } from "node:path";
import invariant from "tiny-invariant";
import { loadRoutes } from "./routes-loader";
import type {
  RouteMatch,
  DataFunctionArgs,
  ServerRouteManifest,
} from "./remix-shim";
import {
  createRoutes,
  matchServerRoutes,
  getActionRequestMatch,
} from "./remix-shim";
import type { ActionCallerConfig, ActionRoute } from "./typings";

const DEFAULT_CONFIG: ActionCallerConfig = {
  actionName: "_action",
  actionsRoute: "actions__",
};

export async function callAction(
  args: DataFunctionArgs,
  {
    actionName: _actionName = DEFAULT_CONFIG.actionName,
    actionsRoute: _actionsRoute = DEFAULT_CONFIG.actionsRoute,
  }: Partial<ActionCallerConfig> = DEFAULT_CONFIG
) {
  const store = loadRoutes();

  invariant(
    store.state === "INITIALIZED",
    "Store must be initialized to call actions"
  );

  const actionRoutes = createRoutes(store.actions as ServerRouteManifest);

  const formData = await args.request.formData();
  const actionName = formData.get(_actionName);

  invariant(typeof actionName === "string", "Action must be a string");
  invariant(actionName.length > 0, "Action must be longer than 0");

  const url = new URL(args.request.url);
  const matches = matchServerRoutes(
    actionRoutes,
    join("/", _actionsRoute, url.pathname, actionName)
  );

  invariant(matches, "No routes matched URL");

  const match = getActionRequestMatch(url, matches) as RouteMatch<ActionRoute>;

  return match.route.module.default({ ...args, formData });
}
