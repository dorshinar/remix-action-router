import { vi } from "vitest";

export default async function setup() {
  console.log(process.version);

  if (!process.version.startsWith("v18")) {
    console.log("adding FormData to global");

    const { FormData: _FormData } = await import("formdata-polyfill/esm.min");
    global.FormData = _FormData;
    globalThis.FormData = _FormData;

    vi.stubGlobal("FormData", _FormData);

    const fd = new _FormData();

    console.log(FormData, global.FormData, fd);
  }
}
