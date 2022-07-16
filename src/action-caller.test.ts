import { Request } from "@remix-run/node";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { callAction } from ".";
import { loadRoutes } from "./routes-loader";

vi.mock("./routes-loader", () => ({
  loadRoutes: vi.fn(),
}));

const loadRoutesMock = loadRoutes as Mock<
  Parameters<typeof loadRoutes>,
  ReturnType<typeof loadRoutes>
>;

describe("action-caller", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls loadRoutes", async () => {
    const formData = new FormData();
    formData.append("_action", "test");

    try {
      await callAction({
        context: {},
        params: {},
        request: new Request("https://example.com", {
          method: "POST",
          body: formData,
        }),
      });
      // eslint-disable-next-line no-empty
    } catch {}

    expect(loadRoutes).toBeCalled();
  });

  it("throws when actionsStore is uninitialized", async () => {
    loadRoutesMock.mockReturnValue({ actions: {}, state: "UNINITIALIZED" });

    const formData = new FormData();
    formData.append("_action", "test");

    await expect(
      callAction({
        context: {},
        params: {},
        request: new Request("https://example.com", {
          method: "POST",
          body: formData,
        }),
      })
    ).rejects.toThrow("Store must be initialized to call actions");
  });

  it("throws when no action is provided", async () => {
    loadRoutesMock.mockReturnValue({ actions: {}, state: "INITIALIZED" });

    const formData = new FormData();

    await expect(
      callAction({
        context: {},
        params: {},
        request: new Request("https://example.com", {
          method: "POST",
          body: formData,
        }),
      })
    ).rejects.toThrow("Action must be a string");
  });

  it("throws when empty action is provided", async () => {
    loadRoutesMock.mockReturnValue({ actions: {}, state: "INITIALIZED" });

    const formData = new FormData();
    formData.append("_action", "");

    await expect(
      callAction({
        context: {},
        params: {},
        request: new Request("https://example.com", {
          method: "POST",
          body: formData,
        }),
      })
    ).rejects.toThrow("Action must be longer than 0");
  });

  it("throws when no action matches", async () => {
    loadRoutesMock.mockReturnValue({
      actions: {
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
      },
      state: "INITIALIZED",
    });

    const formData = new FormData();
    formData.append("_action", "create");

    await expect(
      callAction({
        context: {},
        params: {},
        request: new Request("https://example.com", {
          method: "POST",
          body: formData,
        }),
      })
    ).rejects.toThrow("No routes matched URL");
  });

  it("calls correct action with only one action available", async () => {
    const correctActionMock = vi.fn();

    loadRoutesMock.mockReturnValue({
      actions: {
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
          module: { default: correctActionMock },
        },
      },
      state: "INITIALIZED",
    });

    const formData = new FormData();
    formData.append("_action", "recurring");

    await callAction({
      context: {},
      params: {},
      request: new Request("https://example.com", {
        method: "POST",
        body: formData,
      }),
    });

    expect(correctActionMock).toHaveBeenCalled();
  });

  it("calls correct action with more than one action available as the same depth", async () => {
    const correctActionMock = vi.fn();

    loadRoutesMock.mockReturnValue({
      actions: {
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
          module: { default: correctActionMock },
        },
        "routes/actions__/create": {
          id: "routes/actions__/create",
          parentId: "root",
          path: "actions__/create",
          index: void 0,
          caseSensitive: void 0,
          module: { default: vi.fn() },
        },
      },
      state: "INITIALIZED",
    });

    const formData = new FormData();
    formData.append("_action", "recurring");

    await callAction({
      context: {},
      params: {},
      request: new Request("https://example.com", {
        method: "POST",
        body: formData,
      }),
    });

    expect(correctActionMock).toHaveBeenCalled();
  });

  it("calls correct action a folder name conflicts with the action name", async () => {
    const correctActionMock = vi.fn();

    loadRoutesMock.mockReturnValue({
      actions: {
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
          module: { default: correctActionMock },
        },
        "routes/actions__/item/create": {
          id: "routes/actions__/item/create",
          parentId: "root",
          path: "actions__/item/create",
          index: void 0,
          caseSensitive: void 0,
          module: { default: vi.fn() },
        },
      },
      state: "INITIALIZED",
    });

    const formData = new FormData();
    formData.append("_action", "item");

    await callAction({
      context: {},
      params: {},
      request: new Request("https://example.com", {
        method: "POST",
        body: formData,
      }),
    });

    expect(correctActionMock).toHaveBeenCalled();
  });

  it("calls nested action", async () => {
    const correctActionMock = vi.fn();

    loadRoutesMock.mockReturnValue({
      actions: {
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
          module: { default: correctActionMock },
        },
      },
      state: "INITIALIZED",
    });

    const formData = new FormData();
    formData.append("_action", "create");

    await callAction({
      context: {},
      params: {},
      request: new Request("https://example.com/item", {
        method: "POST",
        body: formData,
      }),
    });

    expect(correctActionMock).toHaveBeenCalled();
  });

  it("calls a really nested action", async () => {
    const correctActionMock = vi.fn();

    loadRoutesMock.mockReturnValue({
      actions: {
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
        "routes/actions__/something/very/deeply/nested": {
          id: "routes/actions__/something/very/deeply/nested",
          parentId: "root",
          path: "actions__/something/very/deeply/nested",
          index: void 0,
          caseSensitive: void 0,
          module: { default: correctActionMock },
        },
        "routes/actions__/something/create": {
          id: "routes/actions__/something/create",
          parentId: "root",
          path: "actions__/something/create",
          index: void 0,
          caseSensitive: void 0,
          module: { default: vi.fn() },
        },
      },
      state: "INITIALIZED",
    });

    const formData = new FormData();
    formData.append("_action", "nested");

    await callAction({
      context: {},
      params: {},
      request: new Request("https://example.com/something/very/deeply", {
        method: "POST",
        body: formData,
      }),
    });

    expect(correctActionMock).toHaveBeenCalled();
  });
});
