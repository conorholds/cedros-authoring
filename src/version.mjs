import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function packageVersion() {
  const packagePath = resolve(fileURLToPath(new URL("../package.json", import.meta.url)));
  return JSON.parse(readFileSync(packagePath, "utf8")).version;
}
