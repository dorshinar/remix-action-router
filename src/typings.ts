import { DataFunctionArgs, ActionFunction } from "@remix-run/server-runtime";
import { ServerRouteModule } from "@remix-run/server-runtime/dist/routeModules";
import { ServerRoute } from "@remix-run/server-runtime/dist/routes";

interface ActionArgs extends DataFunctionArgs {
  formData: FormData;
}

export interface ActionRouteFunction {
  (args: ActionArgs): ReturnType<ActionFunction>;
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
}
