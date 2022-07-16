import { join } from "node:path";
import invariant from "tiny-invariant";
import { loadRoutes } from "./routes-loader";
import {
  createRoutes,
  matchServerRoutes,
  getActionRequestMatch,
  RouteMatch,
  DataFunctionArgs,
  ServerRouteManifest,
} from "./remix-shim";
import { ActionCallerConfig, ActionRoute } from "./typings";

const DEFAULT_CONFIG: ActionCallerConfig = {
  actionName: "_action",
};

export async function callAction(
  args: DataFunctionArgs,
  config: ActionCallerConfig = DEFAULT_CONFIG
) {
  const store = loadRoutes();

  invariant(
    store.state === "INITIALIZED",
    "Store must be initialized to call actions"
  );

  const actionRoutes = createRoutes(store.actions as ServerRouteManifest);

  const formData = await args.request.formData();
  const actionName = formData.get(config.actionName);

  invariant(typeof actionName === "string", "Action must be a string");
  invariant(actionName.length > 0, "Action must be longer than 0");

  const url = new URL(args.request.url);
  const matches = matchServerRoutes(
    actionRoutes,
    join("/actions__", url.pathname, actionName)
  );

  invariant(matches, "No routes matched URL");

  const match = getActionRequestMatch(url, matches) as RouteMatch<ActionRoute>;

  return match.route.module.default({ ...args, formData });
}
