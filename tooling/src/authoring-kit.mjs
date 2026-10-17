import { readFileSync } from "node:fs";

export function authoringKitFiles(kind) {
  const root = new URL("../templates/authoring/", import.meta.url);
  const pins = JSON.parse(readFileSync(new URL("source-snapshots.json", root), "utf8"));
  const archive = pins.kits[kind].archive;
  const files = [
    { path: `authoring/${archive}`, content: readFileSync(new URL(archive, root)) },
    { path: "authoring/source-snapshots.json", content: JSON.stringify(pins, null, 2) + "\n" },
    { path: "scripts/cedros-authoring.mjs", content: readFileSync(new URL("cedros-authoring.mjs", root), "utf8") },
  ];
  if (kind === "extension") files.push({ path: "tests/extension.test.mjs", content: readFileSync(new URL("extension.test.mjs", root), "utf8") });
  return files;
}
