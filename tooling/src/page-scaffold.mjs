import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertInsideTarget,
  readHumanText,
  renderTemplate,
  resolveSafeTarget,
} from "./authoring-utils.mjs";

const ROUTE_PATTERN = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/u;
const INDEXABILITY = new Set(["publication-controlled", "never"]);

export function scaffoldPageProject(input) {
  const targetDir = resolveSafeTarget(input.targetDir);
  const pageId = normalizePageId(input.id ?? basename(targetDir));
  const route = readRoute(input.route ?? `/${pageId}`);
  const label = readHumanText(input.label, titleFromId(pageId), { field: "page label", maxLength: 120 });
  const title = readHumanText(input.title, `${label} | Cedros`, { field: "page title", maxLength: 180 });
  const indexability = input.indexability ?? "publication-controlled";
  if (!INDEXABILITY.has(indexability)) {
    throw new Error(`invalid page indexability "${indexability}"; use publication-controlled or never`);
  }
  assertWritableTarget(targetDir, Boolean(input.force));

  const templateRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../templates/pages");
  const replacements = new Map([
    ["__CEDROS_PAGE_ID__", pageId],
    ["__CEDROS_PAGE_COMPONENT__", componentName(pageId)],
    ["__CEDROS_PAGE_ROUTE_JSON__", JSON.stringify(route)],
    ["__CEDROS_PAGE_TITLE_JSON__", JSON.stringify(title)],
    ["__CEDROS_PAGE_LABEL_JSON__", JSON.stringify(label)],
    ["__CEDROS_PAGE_LABEL__", label],
    ["__CEDROS_PAGE_INDEXABILITY_JSON__", JSON.stringify(indexability)],
  ]);

  mkdirSync(targetDir, { recursive: true });
  copyTemplateTree({ templateRoot, sourceDir: templateRoot, targetDir, replacements });
  return { targetDir, pageId, route, title, label, indexability };
}

function normalizePageId(value) {
  const id = String(value).trim().toLowerCase();
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(id)) {
    throw new Error(`invalid page id "${id}"; use lowercase kebab-case starting with a letter`);
  }
  return id;
}

function readRoute(value) {
  const route = typeof value === "string" ? value.trim() : "";
  if (!ROUTE_PATTERN.test(route)) {
    throw new Error("page route must be a normalized lowercase absolute path without parameters");
  }
  return route;
}

function assertWritableTarget(targetDir, force) {
  if (!existsSync(targetDir)) return;
  if (force) return;
  if (readdirSync(targetDir).length > 0) {
    throw new Error(`${targetDir} is not empty; pass --force to write scaffold files there`);
  }
}

function copyTemplateTree(input) {
  for (const entry of readdirSync(input.sourceDir)) {
    const sourcePath = resolve(input.sourceDir, entry);
    const rel = relative(input.templateRoot, sourcePath);
    const targetPath = resolve(input.targetDir, rel === "gitignore.template" ? ".gitignore" : rel);
    assertInsideTarget(input.targetDir, targetPath);
    if (statSync(sourcePath).isDirectory()) {
      mkdirSync(targetPath, { recursive: true });
      copyTemplateTree({ ...input, sourceDir: sourcePath });
    } else {
      mkdirSync(dirname(targetPath), { recursive: true });
      if (/\.(png|jpe?g|webp|woff2?|ttf|otf)$/iu.test(sourcePath)) cpSync(sourcePath, targetPath);
      else writeFileSync(targetPath, renderTemplate(readFileSync(sourcePath, "utf8"), input.replacements), "utf8");
    }
  }
}

function componentName(id) {
  return `${id.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("")}Page`;
}

function titleFromId(id) {
  return id.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
