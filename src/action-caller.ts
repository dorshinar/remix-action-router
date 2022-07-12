import { DataFunctionArgs } from "@remix-run/server-runtime";
import { ServerRouteManifest } from "@remix-run/server-runtime/dist/routes";
import { join } from "node:path";
import invariant from "tiny-invariant";
import { loadRoutes } from "./routes-loader";
import {
  createRoutes,
  matchServerRoutes,
  getActionRequestMatch,
  RouteMatch,
} from "./remix-shim";
import { ActionRoute } from "./typings";

export async function callAction(args: DataFunctionArgs) {
  if (process.env.NODE_ENV === "development" || !global.actionsStore?.actions) {
    loadRoutes();
  }

  const store = global.actionsStore;

  invariant(store?.actions, "Actions must be defined");

  const actionRoutes = createRoutes(store.actions as ServerRouteManifest);

  const formData = await args.request.formData();
  const actionName = formData.get("_action");

  invariant(typeof actionName === "string", "Action must be a string");

  const url = new URL(args.request.url);
  const matches = matchServerRoutes(
    actionRoutes,
    join("/actions__", url.pathname, actionName)
  );

  invariant(matches, "No routes matched URL");

  const match = getActionRequestMatch(url, matches) as RouteMatch<ActionRoute>;

  return match.route.module.default({ ...args, formData });
}
