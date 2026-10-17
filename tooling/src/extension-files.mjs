import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { packageFiles } from "./templates-packages.mjs";
import { authoringKitFiles } from "./authoring-kit.mjs";
import { rootFiles } from "./templates-root.mjs";
import { scriptFiles } from "./templates-scripts.mjs";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const WIT_PATH = resolve(MODULE_DIR, "../templates/extensions/server/wit/cedros-extension.wit");

export async function buildExtensionFiles(model) {
  const wit = await readFile(WIT_PATH, "utf8");
  return [
    ...rootFiles(model),
    ...packageFiles(model),
    ...scriptFiles(model),
    ...authoringKitFiles("extension"),
    {
      path: "packages/server/wit/cedros-extension.wit",
      content: wit,
    },
  ].sort((a, b) => a.path.localeCompare(b.path));
}
