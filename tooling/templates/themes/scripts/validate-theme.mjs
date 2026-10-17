import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateCedrosRoutineThemeManifest,
  compileCedrosRoutineThemeManifest,
  formatCedrosThemeValidationIssues,
} from "@cedros/theme-runtime";

import { themePackage } from "../src/theme-package.mjs";

const CORE_BLOCK_VARIANTS = {
  entryHeader: ["detail-header", "offer-header", "product-header", "story-header"],
  entryActions: ["actions-row", "byline-actions", "conversion-actions", "detail-actions", "toolbar-actions"],
  hero: ["feature", "spotlight", "essay-lead", "launchpad", "shadcn-section", "catalog", "featured-deal"],
  contentCard: ["grid", "shadcn-grid", "column", "panel", "offer"],
  contentMedia: ["media-stack", "media-frame", "gallery-stack", "catalog-media"],
  relatedContent: ["related-grid", "reading-list", "resource-grid", "offer-grid", "shadcn-list"],
  support: ["support-card", "assist-card", "note-card", "offer-support", "shadcn-card"],
  article: ["article-shell", "blog-shell", "essay", "guide", "detail", "preview-doc-shell", "shadcn-surface"],
  paywall: ["pay-gate", "reader-gate", "purchase-gate", "access-gate"],
  sidebar: ["rail", "section-list", "detail-sidebar", "catalog-rail", "product-rail"],
  toc: ["outline", "outline-panel", "margin-notes", "detail-toc", "offer-summary"],
  controls: ["toolbar", "filters", "refine"],
  breadcrumbs: ["trail", "detail-breadcrumbs", "capsules", "shop-trail"],
  pagination: ["pager", "folio", "steps"],
  prose: ["docs", "longform", "detail", "guide", "preview-doc-body", "shadcn-prose"],
  codeBlock: ["terminal", "annotated", "recipe"],
};
const REQUIRED_BRAND_KIT_FIELDS = [
  "summary", "audience", "voice", "visualDirection", "logoUsage", "assistantGuidance",
];
const BRAND_ASSET_KEYS = ["primaryLogoUrl", "wordmarkLogoUrl", "iconUrl", "socialShareImageUrl"];

export function validateThemePackage(candidate = themePackage) {
  const issues = [];
  if (!isObject(candidate)) return { ok: false, issues: [{ path: "", message: "Theme package must be an object." }] };
  if (candidate.kind !== "cedros-theme-library-package") issues.push({ path: "kind", message: "Expected cedros-theme-library-package." });
  if (candidate.schemaVersion !== 1) issues.push({ path: "schemaVersion", message: "Expected schema version 1." });
  if (!isObject(candidate.manifest)) issues.push({ path: "manifest", message: "Expected a theme manifest object." });
  else {
    issues.push(...validateCedrosRoutineThemeManifest(candidate.manifest).map((issue) => ({
      ...issue,
      path: issue.path ? `manifest.${issue.path}` : "manifest",
    })));
    validatePortableMetadata(candidate.manifest, issues);
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true, issues: [], compiled: compileCedrosRoutineThemeManifest(candidate.manifest) };
}

export function assertValidThemePackage(candidate = themePackage) {
  const result = validateThemePackage(candidate);
  if (!result.ok) throw new Error(formatCedrosThemeValidationIssues(result.issues));
  return result;
}

// Portable handoff rules supplement the shared runtime's manifest validation.
function validatePortableMetadata(manifest, issues) {
  if (typeof manifest.theme?.id !== "string" || !/^[a-z][a-z0-9-]{1,62}$/u.test(manifest.theme.id)) {
    issues.push({ path: "manifest.theme.id", message: "Theme id must be 2-63 chars: lowercase letters, numbers, and hyphens." });
  }
  if (["minimalist", "editorial", "product", "commerce", "starter"].includes(manifest.theme?.id)) {
    issues.push({ path: "manifest.theme.id", message: "Built-in theme ids are reserved." });
  }
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(manifest.theme?.version ?? "")) {
    issues.push({ path: "manifest.theme.version", message: "Expected a semantic version." });
  }
  validateBrandKit(manifest.brandKit, issues);
  if (!isObject(manifest.blockVariants)) return;
  for (const [block, variants] of Object.entries(CORE_BLOCK_VARIANTS)) {
    const config = manifest.blockVariants[block];
    if (!isObject(config)) continue;
    if (!variants.includes(config.default)) {
      issues.push({ path: `manifest.blockVariants.${block}.default`, message: `Use a styled catalog value: ${variants.join(", ")}.` });
    }
    if (isObject(config.surfaces)) {
      for (const [surface, variant] of Object.entries(config.surfaces)) {
        if (!variants.includes(variant)) issues.push({ path: `manifest.blockVariants.${block}.surfaces.${surface}`, message: "Use a styled catalog value." });
      }
    }
  }
}

function validateBrandKit(brandKit, issues) {
  if (!isObject(brandKit)) {
    issues.push({ path: "manifest.brandKit", message: "Portable themes require a brand kit." });
    return;
  }
  for (const key of REQUIRED_BRAND_KIT_FIELDS) requiredString(issues, brandKit[key], `manifest.brandKit.${key}`);
  if (!Array.isArray(brandKit.personalityKeywords) || brandKit.personalityKeywords.every((entry) => !nonEmpty(entry))) {
    issues.push({ path: "manifest.brandKit.personalityKeywords", message: "Provide at least one keyword." });
  }
  if (!isObject(brandKit.assets) || !BRAND_ASSET_KEYS.some((key) => rootRelativeAsset(brandKit.assets[key]))) {
    issues.push({ path: "manifest.brandKit.assets", message: "Provide at least one root-relative brand asset URL." });
  }
}

function nonEmpty(value) { return typeof value === "string" && value.trim().length > 0; }
function rootRelativeAsset(value) { return nonEmpty(value) && /^\/(?!\/)/u.test(value); }
function requiredString(issues, value, path) { if (!nonEmpty(value)) issues.push({ path, message: "Expected a non-empty string." }); }

function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  try {
    const { compiled } = assertValidThemePackage();
    console.log(`validated ${compiled.manifest.theme.id}@${compiled.manifest.theme.version} (@cedros/theme-runtime@0.1.0)`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
