import { join } from "node:path";

export function requireBuild() {
  const buildPath = join(process.cwd(), "build", "index.js");
  return require(buildPath);
}
