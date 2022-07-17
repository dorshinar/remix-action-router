import { DataFunctionArgs, ActionFunction } from "@remix-run/server-runtime";
import { ServerRouteModule } from "@remix-run/server-runtime/dist/routeModules";
import { ServerRoute } from "@remix-run/server-runtime/dist/routes";

export interface RouteActionsArgs extends DataFunctionArgs {
  formData: FormData;
}

export interface ActionRouteFunction {
  (args: RouteActionsArgs): ReturnType<ActionFunction>;
}

type ActionRouteModule = Omit<ServerRouteModule, "default"> & {
  default: ActionRouteFunction;
};

export type ActionRoute = Omit<ServerRoute, "children" | "module"> & {
  module: ActionRouteModule;
};

export type ActionRoutes = {
  [routeId: string]: ActionRoute;
};

export interface ActionsStore {
  actions: ActionRoutes;
  state: ActionStoreState;
}

export type ActionStoreState = "UNINITIALIZED" | "INITIALIZED";

export interface ActionCallerConfig {
  /**
   * The name of the action to be executed.
   * @default _action
   */
  actionName: string;

  /**
   * The folder in which to search for action routes.
   * @default actions__
   */
  actionsRoute: string;
}
