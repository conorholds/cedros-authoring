import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pins = JSON.parse(readFileSync(resolve(root, "authoring/source-snapshots.json"), "utf8"));
const args = process.argv.slice(2);
const kind = args[0] === "unpack-theme" ? "theme" : "extension";
const pin = pins.kits[kind];

try {
  const archive = resolve(root, "authoring", pin.archive);
  assertHash(readFileSync(archive), pin.sha256, "authoring archive");
  const destination = resolve(root, "archive/cedros-authoring");
  // The archive bytes are pinned before extraction; reject existing symlinks
  // so unzip cannot redirect a known entry outside the extraction directory.
  rejectSymlinks(resolve(root, "archive"), false);
  rejectSymlinks(destination);
  mkdirSync(destination, { recursive: true });
  execFileSync("unzip", ["-oq", archive, "-d", destination], { stdio: "pipe" });
  const kit = resolve(destination, `cedros-${kind}-authoring-kit`);
  const manifestBytes = readFileSync(resolve(kit, "AUTHORING-KIT.json"));
  assertHash(manifestBytes, pin.manifestSha256, "AUTHORING-KIT.json");
  const manifest = JSON.parse(manifestBytes);
  assertHash(Buffer.from(manifest.files.map((file) => `${file.path}:${file.sha256}\n`).join("")), pin.contentSetSha256, "authoring content set");
  for (const file of manifest.files) {
    assertHash(readFileSync(resolve(kit, file.path)), file.sha256, file.path);
  }
  if (kind === "theme") {
    console.log(`Theme guide: ${resolve(kit, "docs/theme-authoring/README.md")}`);
  } else {
    const verifier = resolve(kit, "docs/extension-authoring/scripts/cedros-authoring.mjs");
    const result = spawnSync(process.execPath, [verifier, ...args], { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.signal) throw new Error(`Canonical verifier terminated by ${result.signal}`);
    process.exitCode = result.status;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function assertHash(bytes, expected, label) {
  if (createHash("sha256").update(bytes).digest("hex") !== expected) {
    throw new Error(`${label} does not match the pinned Cedros ${pins.version} checksum`);
  }
}

function rejectSymlinks(path, recursive = true) {
  const stat = lstatSync(path, { throwIfNoEntry: false });
  if (!stat) return;
  if (stat.isSymbolicLink()) throw new Error(`Authoring kit extraction refuses symlink: ${path}`);
  if (recursive && stat.isDirectory()) {
    for (const name of readdirSync(path)) rejectSymlinks(resolve(path, name));
  }
}
