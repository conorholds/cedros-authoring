import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const REFERENCE_DIR = resolve(MODULE_DIR, "../skills/cedros-authoring/references");
const TOPICS = new Map([
  ["overview", "overview.md"],
  ["pages", "pages.md"],
  ["themes", "themes.md"],
  ["extensions", "extensions.md"],
  ["discovery", "discovery.md"],
  ["troubleshooting", "troubleshooting.md"],
]);

export function printReference(topic = "overview") {
  if (topic === "list") {
    console.log([...TOPICS.keys()].join("\n"));
    return;
  }
  const file = TOPICS.get(topic);
  if (!file) {
    throw new Error(`unknown reference topic "${topic}"; choose ${[...TOPICS.keys()].join(", ")}`);
  }
  process.stdout.write(readFileSync(resolve(REFERENCE_DIR, file), "utf8"));
}
