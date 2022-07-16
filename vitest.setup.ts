export default async function setup() {
  if (!process.version.startsWith("v18")) {
    global.FormData = (await import("formdata-polyfill")).FormData;
  }
}
