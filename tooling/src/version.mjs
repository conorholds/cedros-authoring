import { readFileSync } from "node:fs";
import { findPackageJSON } from "node:module";

export function packageVersion() {
  const packagePath = findPackageJSON(import.meta.url);
  if (!packagePath) throw new Error("Cedros Authoring package metadata is missing.");
  return JSON.parse(readFileSync(packagePath, "utf8")).version;
}
