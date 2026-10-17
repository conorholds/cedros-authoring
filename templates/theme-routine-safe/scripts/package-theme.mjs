import {
  mkdirSync,
  readdirSync,
  lstatSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { relative, resolve } from "node:path";
import { zipSync } from "fflate";

import { themePackage } from "../src/theme-package.mjs";
import { assertValidThemePackage } from "./validate-theme.mjs";
import { copyThemeFonts } from "./theme-assets.mjs";

async function packageTheme() {
  const { compiled } = assertValidThemePackage(themePackage);
  const { id, version } = compiled.manifest.theme;
  const baseName = `${id}-${version}`;
  const packageDir = resolve(process.cwd(), "dist", baseName);
  const manifestPath = resolve(packageDir, "manifest.json");
  const zipPath = resolve(process.cwd(), "dist", `${baseName}.zip`);

  for (const path of [resolve(process.cwd(), "dist"), packageDir, zipPath, `${zipPath}.sha256`]) {
    if (lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink()) {
      throw new Error(`theme package output cannot be a symlink: ${relative(process.cwd(), path)}`);
    }
  }
  // Rebuild the owned staging directory so removed assets cannot leak into ZIPs.
  rmSync(packageDir, { recursive: true, force: true });
  mkdirSync(packageDir, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(themePackage, null, 2)}\n`, "utf8");
  copyThemeFonts(process.cwd(), packageDir, compiled.manifest);
  writeZip(packageDir, zipPath);
  writeFileSync(`${zipPath}.sha256`, `${sha256(readFileSync(zipPath))}  ${baseName}.zip\n`, "utf8");

  console.log(`packaged ${manifestPath}`);
  console.log(`packaged ${zipPath}`);
}

function writeZip(packageDir, zipPath) {
  const entries = {};
  for (const filePath of collectFiles(packageDir)) {
    const archivePath = relative(packageDir, filePath).replaceAll("\\", "/");
    entries[archivePath] = readFileSync(filePath);
  }
  writeFileSync(zipPath, Buffer.from(zipSync(entries)));
}

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = resolve(dir, entry);
    const stats = lstatSync(path);
    if (stats.isSymbolicLink()) {
      throw new Error(`theme package staging contains a symlink: ${relative(process.cwd(), path)}`);
    }
    if (stats.isDirectory()) {
      files.push(...collectFiles(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

packageTheme().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
