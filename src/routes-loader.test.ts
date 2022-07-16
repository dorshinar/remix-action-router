import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { requireBuild } from "./require-build";
import { loadRoutes, resetStore } from "./routes-loader";
import { ActionRoutes } from "./typings";

vi.mock("./require-build", async () => {
  const requireBuildModule = await vi.importActual<
    typeof import("./require-build")
  >("./require-build.ts");

  return {
    ...requireBuildModule,
    requireBuild: vi.fn(),
  };
});

const requireBuildMock = requireBuild as Mock<
  Parameters<typeof requireBuild>,
  ReturnType<typeof requireBuild>
>;

const nodeEnv = process.env.NODE_ENV;

describe("routes-loader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetStore();

    process.env.NODE_ENV = nodeEnv;
  });

  it("returns actionsStore from build.js", () => {
    requireBuildMock.mockReturnValue({ routes: {} });

    const store = loadRoutes();
    expect(store).toHaveProperty("state", "INITIALIZED");
    expect(store).toHaveProperty("actions", {});
    expect(requireBuildMock).toHaveBeenCalled();
  });

  it("filters non-actions related routes", () => {
    /**
     * routes taken from @link https://github.com/remix-run/remix/blob/d09663e608cc5373a25f1c23ec32844ff67ad9a6/examples/multiple-params/package.json
     */
    const routesToFilterOut: ActionRoutes = {
      root: {
        id: "root",
        parentId: void 0,
        path: "",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/clients": {
        id: "routes/clients",
        parentId: "root",
        path: "clients",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/clients/$clientId": {
        id: "routes/clients/$clientId",
        parentId: "routes/clients",
        path: ":clientId",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/clients/$clientId/invoices": {
        id: "routes/clients/$clientId/invoices",
        parentId: "routes/clients/$clientId",
        path: "invoices",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/clients/$clientId/invoices/$invoiceId": {
        id: "routes/clients/$clientId/invoices/$invoiceId",
        parentId: "routes/clients/$clientId/invoices",
        path: ":invoiceId",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/clients/$clientId/invoices/index": {
        id: "routes/clients/$clientId/invoices/index",
        parentId: "routes/clients/$clientId/invoices",
        path: void 0,
        index: !0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/clients/$clientId/index": {
        id: "routes/clients/$clientId/index",
        parentId: "routes/clients/$clientId",
        path: void 0,
        index: !0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/clients/index": {
        id: "routes/clients/index",
        parentId: "routes/clients",
        path: void 0,
        index: !0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/index": {
        id: "routes/index",
        parentId: "root",
        path: void 0,
        index: !0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
    };

    const actionRoutes: ActionRoutes = {
      root: {
        id: "root",
        parentId: void 0,
        path: "",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/actions__/recurring": {
        id: "routes/actions__/recurring",
        parentId: "root",
        path: "actions__/recurring",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/actions__/item": {
        id: "routes/actions__/item",
        parentId: "root",
        path: "actions__/item",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/actions__/item/create": {
        id: "routes/actions__/item/create",
        parentId: "root",
        path: "actions__/item/create",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
    };

    requireBuildMock.mockReturnValue({
      routes: {
        ...routesToFilterOut,
        ...actionRoutes,
      },
    });

    const store = loadRoutes();
    expect(store).toHaveProperty("state", "INITIALIZED");
    expect(store).toHaveProperty("actions", actionRoutes);
    expect(requireBuildMock).toHaveBeenCalled();
  });

  it.each(["test", "production", "staging"])(
    "does not require build.js on second call to loadRoutes() in %s environment",
    (env) => {
      process.env.NODE_ENV = env as "production" | "test";
      requireBuildMock.mockReturnValue({
        routes: {},
      });

      loadRoutes();
      loadRoutes();
      expect(requireBuildMock).toHaveBeenCalledOnce();
    }
  );

  it("requires build.js on every call to loadRoutes() in development", () => {
    process.env.NODE_ENV = "development";
    requireBuildMock.mockReturnValue({
      routes: {},
    });

    loadRoutes();
    loadRoutes();
    loadRoutes();
    loadRoutes();
    expect(requireBuildMock).toHaveBeenCalledTimes(4);
  });

  it.each(["test", "production", "staging"])(
    "require build.js in %s environment if actionsStore is not initialized",
    (env) => {
      process.env.NODE_ENV = env as "production" | "test";
      requireBuildMock.mockReturnValue({
        routes: {},
      });

      loadRoutes();
      resetStore();
      loadRoutes();
      resetStore();
      loadRoutes();
      resetStore();
      loadRoutes();
      resetStore();

      expect(requireBuildMock).toHaveBeenCalledTimes(4);
    }
  );

  it("calls action added to store after first store initialization in development", () => {
    process.env.NODE_ENV = "development";

    requireBuildMock.mockReturnValue({
      routes: {},
    });

    let store = loadRoutes();
    expect(store).toHaveProperty("state", "INITIALIZED");
    expect(store).toHaveProperty("actions", {});

    const newRoutes = {
      root: {
        id: "root",
        parentId: void 0,
        path: "",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
      "routes/actions__/recurring": {
        id: "routes/actions__/recurring",
        parentId: "root",
        path: "actions__/recurring",
        index: void 0,
        caseSensitive: void 0,
        module: { default: vi.fn() },
      },
    };

    requireBuildMock.mockReturnValue({
      routes: newRoutes,
    });

    store = loadRoutes();
    expect(store).toHaveProperty("state", "INITIALIZED");
    expect(store).toHaveProperty("actions", newRoutes);
  });
});
