import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authoringKitFiles } from "./authoring-kit.mjs";

import {
  assertInsideTarget,
  readHumanText,
  renderTemplate,
  resolveSafeTarget,
} from "./authoring-utils.mjs";

const DEFAULT_THEME_VERSION = "1.0.0";
const RESERVED_THEME_IDS = new Set(["minimalist", "editorial", "product", "commerce", "starter"]);

/**
 * Creates a routine-safe Cedros theme authoring project.
 *
 * Inputs: targetDir plus optional id, displayName/label, version, force,
 * withFonts. Throws on invalid identifiers, reserved theme
 * ids, invalid versions, unknown package specs, or non-empty targets without
 * force. Returns the resolved target and normalized theme metadata.
 */
export function scaffoldThemeProject(input) {
  const targetDir = readTargetDir(input.targetDir);
  const themeId = normalizeThemeId(input.id ?? basename(targetDir));
  const displayName = readDisplayName(input.displayName ?? input.label, themeId);
  const version = readVersion(input.version ?? DEFAULT_THEME_VERSION);
  if (input.dataReactSpec !== undefined) throw new Error("Use the supported @cedros/theme-runtime artifact through make install THEME_RUNTIME_TARBALL=/path/to/package.tgz; @cedros/data-react is not a supported external dependency.");
  assertWritableTarget(targetDir, Boolean(input.force));

  const templateRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../templates/themes"
  );
  const replacements = buildReplacements({ themeId, displayName, version });

  mkdirSync(targetDir, { recursive: true });
  copyTemplateTree({
    templateRoot,
    sourceDir: templateRoot,
    targetDir,
    replacements,
    withFonts: Boolean(input.withFonts),
  });
  for (const file of authoringKitFiles("theme")) {
    const path = resolve(targetDir, file.path);
    assertInsideTarget(targetDir, path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.content);
  }

  return { targetDir, themeId, displayName, version };
}

function readTargetDir(targetDir) {
  return resolveSafeTarget(targetDir);
}

function normalizeThemeId(value) {
  const id = String(value).trim().toLowerCase();
  if (!/^[a-z][a-z0-9-]{1,62}$/.test(id)) {
    throw new Error("Theme id must be 2-63 chars: lowercase letters, numbers, and hyphens.");
  }
  if (RESERVED_THEME_IDS.has(id)) {
    throw new Error(`Theme id '${id}' is reserved by a built-in Cedros theme.`);
  }
  return id;
}

function readDisplayName(value, themeId) {
  return readHumanText(value, themeId.split("-").map(capitalize).join(" "), {
    field: "display name",
    maxLength: 120,
  });
}

function readVersion(value) {
  const version = String(value).trim();
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error("Version must be a semver string such as 1.0.0.");
  }
  return version;
}

function assertWritableTarget(targetDir, force) {
  if (!existsSync(targetDir)) return;
  if (force) return;
  const entries = readdirSync(targetDir);
  if (entries.length > 0) {
    throw new Error(`Target directory already exists: ${targetDir}. Re-run with --force to write scaffold files there.`);
  }
}

function buildReplacements({ themeId, displayName, version }) {
  const description = `${displayName} routine-safe Cedros theme.`;
  return new Map([
    ["__CEDROS_THEME_ID__", themeId],
    ["__CEDROS_THEME_VERSION__", version],
    ["__CEDROS_THEME_DISPLAY_NAME__", displayName],
    ["__CEDROS_THEME_DISPLAY_NAME_JSON__", JSON.stringify(displayName)],
    ["__CEDROS_THEME_DESCRIPTION_JSON__", JSON.stringify(description)],
  ]);
}

function copyTemplateTree(input) {
  for (const entry of readdirSync(input.sourceDir)) {
    const sourcePath = resolve(input.sourceDir, entry);
    const relativePath = relative(input.templateRoot, sourcePath);
    if (!input.withFonts && relativePath.startsWith("fonts/")) continue;

    const targetPath = resolve(input.targetDir, resolveTargetRelativePath(relativePath));
    assertInsideTarget(input.targetDir, targetPath);
    if (statSync(sourcePath).isDirectory()) {
      mkdirSync(targetPath, { recursive: true });
      copyTemplateTree({ ...input, sourceDir: sourcePath });
      continue;
    }
    copyTemplateFile(sourcePath, targetPath, input.replacements);
  }
}

function copyTemplateFile(sourcePath, targetPath, replacements) {
  mkdirSync(dirname(targetPath), { recursive: true });
  if (isBinaryTemplate(sourcePath)) {
    cpSync(sourcePath, targetPath, { force: true });
    return;
  }
  writeFileSync(targetPath, renderTemplate(readFileSync(sourcePath, "utf8"), replacements), "utf8");
}

function resolveTargetRelativePath(relativePath) {
  if (relativePath === "gitignore.template") return ".gitignore";
  return relativePath;
}

function isBinaryTemplate(path) {
  return /\.(png|jpe?g|webp|woff2?|ttf|otf)$/i.test(path);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
