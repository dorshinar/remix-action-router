import type { Params } from "@remix-run/react";
import {
  ServerRoute,
  ServerRouteManifest,
} from "@remix-run/server-runtime/dist/routes";
import type { RouteObject } from "react-router-dom";
import { matchRoutes } from "react-router-dom";

/**
 * This type was taken directly from repo Remix repo.
 * https://github.com/remix-run/remix/blob/5b8a0ce0aa0201aa2402fc41405ffbe89605963b/packages/remix-server-runtime/routeMatching.ts
 */
export interface RouteMatch<Route> {
  params: Params;
  pathname: string;
  route: Route;
}

/**
 * This function was taken directly from repo Remix repo.
 * https://github.com/remix-run/remix/blob/5b8a0ce0aa0201aa2402fc41405ffbe89605963b/packages/remix-server-runtime/routeMatching.ts
 */
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
export function getActionRequestMatch(
  url: URL,
  matches: RouteMatch<ServerRoute>[]
) {
  const match = matches.slice(-1)[0];

  if (!isIndexRequestUrl(url) && match.route.id.endsWith("/index")) {
    return matches.slice(-2)[0];
  }

  return match;
}

/**
 * This function was taken from the Remix repo.
 * https://github.com/remix-run/remix/blob/5b8a0ce0aa0201aa2402fc41405ffbe89605963b/packages/remix-server-runtime/server.ts
 */
function isIndexRequestUrl(url: URL) {
  let indexRequest = false;

  for (const param of url.searchParams.getAll("index")) {
    if (!param) {
      indexRequest = true;
    }
  }

  return indexRequest;
}
