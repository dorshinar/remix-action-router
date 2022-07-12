import type { Params } from "@remix-run/react";
import type {
  DataFunctionArgs,
  ActionFunction,
} from "@remix-run/server-runtime";
import { ServerRouteModule } from "@remix-run/server-runtime/dist/routeModules";
import {
  ServerRoute,
  ServerRouteManifest,
} from "@remix-run/server-runtime/dist/routes";
import { join } from "node:path";
import type { RouteObject } from "react-router-dom";
import { matchRoutes } from "react-router-dom";
import invariant from "tiny-invariant";

interface ActionArgs extends DataFunctionArgs {
  formData: FormData;
}
export interface ActionRouteFunction {
  (args: ActionArgs): ReturnType<ActionFunction>;
}
type ActionRouteModule = Omit<ServerRouteModule, "default"> & {
  default: ActionRouteFunction;
};
type ActionRoute = Omit<ServerRoute, "children" | "module"> & {
  module: ActionRouteModule;
};
type ActionRoutes = {
  [routeId: string]: ActionRoute;
};

export interface ActionsStore {
  actions: ActionRoutes;
}

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

/**
 * The rest of this file was taken directly from repo Remix repo.
 * https://github.com/remix-run/remix/blob/5b8a0ce0aa0201aa2402fc41405ffbe89605963b/packages/remix-server-runtime/routeMatching.ts
 */
export interface RouteMatch<Route> {
  params: Params;
  pathname: string;
  route: Route;
}

export function matchServerRoutes(
  routes: ServerRoute[],
  pathname: string
): RouteMatch<ServerRoute>[] | null {
  const matches = matchRoutes(routes as unknown as RouteObject[], pathname);
  if (!matches) return null;

  return matches.map((match) => ({
    params: match.params,
    pathname: match.pathname,
    route: match.route as unknown as ServerRoute,
  }));
}

/**
 * This function was taken from the Remix repo.
 * https://github.com/remix-run/remix/blob/5b8a0ce0aa0201aa2402fc41405ffbe89605963b/packages/remix-server-runtime/routes.ts
 */
export function createRoutes(
  manifest: ServerRouteManifest,
  parentId?: string
): ServerRoute[] {
  return Object.keys(manifest)
    .filter((key) => manifest[key].parentId === parentId)
    .map((id) => ({
      ...manifest[id],
      children: createRoutes(manifest, id),
    }));
}

/**
 * This function was taken from the Remix repo.
 * https://github.com/remix-run/remix/blob/5b8a0ce0aa0201aa2402fc41405ffbe89605963b/packages/remix-server-runtime/server.ts
 */
function getActionRequestMatch(url: URL, matches: RouteMatch<ServerRoute>[]) {
  const match = matches.slice(-1)[0];

  if (!isIndexRequestUrl(url) && match.route.id.endsWith("/index")) {
    return matches.slice(-2)[0];
  }

  return match;
}

function isIndexRequestUrl(url: URL) {
  let indexRequest = false;

  for (const param of url.searchParams.getAll("index")) {
    if (!param) {
      indexRequest = true;
    }
  }

  return indexRequest;
}
