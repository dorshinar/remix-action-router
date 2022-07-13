import { Request } from "@remix-run/node";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { callAction } from "../src";
import { loadRoutes } from "../src/routes-loader";

let nodeEnv = process.env.NODE_ENV;

vi.mock("../src/routes-loader", () => ({
  loadRoutes: vi.fn(),
}));

const loadRoutesMock = loadRoutes as Mock<
  Parameters<typeof loadRoutes>,
  ReturnType<typeof loadRoutes>
>;

describe("action-caller", () => {
  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv;

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
});
