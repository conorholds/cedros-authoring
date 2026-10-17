import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_FILES = ["page.json", "page.tsx", "page.native.tsx", "page.md"];
const MANIFEST_KEYS = new Set(["route", "title", "label", "seo"]);
const SEO_KEYS = new Set(["indexability", "descriptionSource", "schemaType", "breadcrumbs", "minWords"]);
const INDEXABILITY = new Set(["publication-controlled", "never"]);
const CONTRACT_ROOT = resolve(fileURLToPath(new URL("../contracts", import.meta.url)));
const SCHEMA_CONTRACT = JSON.parse(readFileSync(resolve(CONTRACT_ROOT, "seo-schema-types.json"), "utf8"));
const ALLOWED_SCHEMA_TYPES = new Set(SCHEMA_CONTRACT.entityTypes);
const ROUTE_PATTERN = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/u;
const IMPORT_PATTERN = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/gu;
const DOM_TAG_PATTERN = /<(?:a|article|aside|button|div|footer|form|h[1-6]|header|img|input|main|nav|p|section|span)(?:\s|>|\/)/iu;
const PROHIBITED_CODE = /\b(?:eval\s*\(|new\s+Function\s*\()/u;

export function validatePageWorkspace(rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)))) {
  const missing = REQUIRED_FILES.filter((file) => !existsSync(resolve(rootDir, file)));
  if (missing.length > 0) return { ok: false, errors: missing.map((file) => `missing required ${file}`) };
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(resolve(rootDir, "page.json"), "utf8"));
  } catch (error) {
    return { ok: false, errors: [`page.json must be valid JSON: ${message(error)}`] };
  }
  return validatePageSources({
    manifest,
    web: readFileSync(resolve(rootDir, "page.tsx"), "utf8"),
    native: readFileSync(resolve(rootDir, "page.native.tsx"), "utf8"),
    markdown: readFileSync(resolve(rootDir, "page.md"), "utf8"),
  });
}

export function validatePageSources({ manifest, web, native, markdown }) {
  const errors = [];
  validateManifest(manifest, errors);
  validateSurface(web, "page.tsx", new Set(["react"]), errors);
  validateSurface(native, "page.native.tsx", new Set(["react", "react-native"]), errors);
  if (DOM_TAG_PATTERN.test(native)) errors.push("page.native.tsx must use React Native primitives, not DOM elements");
  validateMarkdown(markdown, manifest?.seo, errors);
  return { ok: errors.length === 0, errors };
}

export function assertValidPageWorkspace(rootDir) {
  const result = validatePageWorkspace(rootDir);
  if (result.ok) return result;
  throw new Error(result.errors.join("\n"));
}

function validateManifest(manifest, errors) {
  if (!isObject(manifest)) {
    errors.push("page.json must contain an object");
    return;
  }
  unknownKeys(manifest, MANIFEST_KEYS, "page.json", errors);
  if (typeof manifest.route !== "string" || !ROUTE_PATTERN.test(manifest.route)) errors.push("page.json route must be a normalized lowercase absolute path without parameters");
  textLength(manifest.title, "page.json title", manifest.seo?.indexability === "never" ? 3 : 10, 180, errors);
  textLength(manifest.label, "page.json label", 1, 120, errors);
  if (!isObject(manifest.seo)) {
    errors.push("page.json seo must be an object");
    return;
  }
  unknownKeys(manifest.seo, SEO_KEYS, "page.json seo", errors);
  if (!INDEXABILITY.has(manifest.seo.indexability)) errors.push("page.json seo.indexability is unsupported");
  if (manifest.seo.descriptionSource !== "markdown-lede") errors.push("page.json seo.descriptionSource must be markdown-lede");
  if (!ALLOWED_SCHEMA_TYPES.has(manifest.seo.schemaType)) errors.push("page.json seo.schemaType is not in the bundled Core schema catalog");
  if (typeof manifest.seo.breadcrumbs !== "boolean") errors.push("page.json seo.breadcrumbs must be boolean");
  if (!Number.isInteger(manifest.seo.minWords) || manifest.seo.minWords < 1) errors.push("page.json seo.minWords must be a positive integer");
}

function validateSurface(source, file, allowedImports, errors) {
  if (typeof source !== "string" || source.trim().length === 0) {
    errors.push(`${file} must contain real source`);
    return;
  }
  if (source.length > 100_000) errors.push(`${file} exceeds 100,000 characters`);
  const imports = [...source.matchAll(IMPORT_PATTERN)].map((match) => match[1]);
  for (const imported of imports) if (!allowedImports.has(imported)) errors.push(`${file} imports unsupported module ${imported}`);
  if (!/(?:export\s+default\s+function|export\s+(?:function|const)\s+|\brender\s*\()/u.test(source)) errors.push(`${file} must export a component or call render`);
  if (PROHIBITED_CODE.test(source)) errors.push(`${file} must not use eval or Function construction`);
  if (/\bimport\s*\(/u.test(source)) errors.push(`${file} must not use dynamic imports`);
  if (/\brequire\s*\(/u.test(source)) errors.push(`${file} must not use CommonJS require`);
  if (/\b(?:process\.env|localStorage|sessionStorage)\b/u.test(source)) errors.push(`${file} must not access ambient secrets or browser storage`);
}

function validateMarkdown(markdown, seo, errors) {
  if (typeof markdown !== "string" || markdown.trim().length === 0) {
    errors.push("page.md must contain real fallback content");
    return;
  }
  if (markdown.length > 100_000) errors.push("page.md exceeds 100,000 characters");
  const visible = markdown.replace(/<!--[\s\S]*?-->/gu, "").trim();
  const headings = visible.match(/^#\s+.+$/gmu) ?? [];
  if (headings.length !== 1) errors.push(`page.md must contain exactly one H1 (found ${headings.length})`);
  const lede = markdownLede(visible);
  if (lede.length < 50 || lede.length > 320) errors.push(`page.md lede must be 50-320 characters (found ${lede.length})`);
  const wordCount = visible.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
  const minimum = Number.isInteger(seo?.minWords) ? seo.minWords : 100;
  if (wordCount < minimum) errors.push(`page.md is thin (${wordCount} words; minimum ${minimum})`);
}

function markdownLede(markdown) {
  const lines = markdown.split(/\r?\n/u);
  const h1 = lines.findIndex((line) => /^#\s+/u.test(line));
  const paragraph = [];
  for (const line of lines.slice(h1 + 1)) {
    const trimmed = line.trim();
    if (!trimmed && paragraph.length === 0) continue;
    if (!trimmed || /^(?:#|[-*]\s|\d+\.\s|\[)/u.test(trimmed)) break;
    paragraph.push(trimmed);
  }
  return paragraph.join(" ").replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1").replace(/[*_`~]/gu, "").replace(/\s+/gu, " ").trim();
}

function unknownKeys(value, allowed, label, errors) { const unknown = Object.keys(value).filter((key) => !allowed.has(key)); if (unknown.length > 0) errors.push(`${label} has unsupported keys: ${unknown.join(", ")}`); }
function textLength(value, label, min, max, errors) { if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) errors.push(`${label} must be ${min}-${max} characters`); }
function isObject(value) { return Boolean(value && typeof value === "object" && !Array.isArray(value)); }
function message(error) { return error instanceof Error ? error.message : String(error); }

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  try {
    assertValidPageWorkspace();
    const manifest = JSON.parse(readFileSync(resolve(fileURLToPath(new URL("..", import.meta.url)), "page.json"), "utf8"));
    console.log(`validated ${manifest.route} (${manifest.seo.indexability})`);
  } catch (error) {
    console.error(message(error));
    process.exitCode = 1;
  }
}
