import { cpSync, lstatSync, readdirSync, rmSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

export function copyThemeFonts(projectRoot, outputRoot, manifest) {
  const fontsDir = resolve(projectRoot, "fonts");
  const source = lstatSync(fontsDir, { throwIfNoEntry: false });
  if (source) rejectSymlinks(fontsDir);
  for (const [index, font] of (manifest.assets?.fonts ?? []).entries()) {
    const sources = [
      { source: font.source, path: `assets.fonts.${index}.source` },
      ...(font.sources ?? []).map((entry, sourceIndex) => ({ source: entry.source, path: `assets.fonts.${index}.sources.${sourceIndex}.source` })),
    ];
    for (const entry of sources) {
      if (!entry.source.startsWith("./")) continue;
      const path = resolve(projectRoot, entry.source);
      const local = relative(fontsDir, path);
      if (!local || local === ".." || local.startsWith(`..${sep}`) || isAbsolute(local)) {
        throw new Error(`${entry.path}: bundled font sources must point inside ./fonts/.`);
      }
      if (!lstatSync(path, { throwIfNoEntry: false })?.isFile()) {
        throw new Error(`${entry.path}: referenced font is missing: ${entry.source}`);
      }
    }
  }
  const target = resolve(outputRoot, "fonts");
  if (lstatSync(outputRoot, { throwIfNoEntry: false })?.isSymbolicLink() || lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink()) {
    throw new Error("theme font output cannot be a symlink");
  }
  rmSync(target, { recursive: true, force: true });
  if (source) cpSync(fontsDir, target, { recursive: true, force: true });
}

function rejectSymlinks(dir) {
  const stats = lstatSync(dir);
  if (stats.isSymbolicLink()) throw new Error(`theme packages cannot include symlinks: ${dir}`);
  if (!stats.isDirectory()) throw new Error(`theme font directory is not a directory: ${dir}`);
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith(".tgz") || entry === ".theme-runtime" || entry === "node_modules") {
      throw new Error(`theme font assets cannot include runtime artifacts or installed dependencies: ${entry}`);
    }
    const path = resolve(dir, entry);
    const stats = lstatSync(path);
    if (stats.isSymbolicLink()) throw new Error(`theme packages cannot include symlinks: ${path}`);
    if (stats.isDirectory()) rejectSymlinks(path);
  }
}
