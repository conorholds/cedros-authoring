import { createElement } from "react";
import {
  cedrosThemeStarterManifest,
  validateCedrosRoutineThemeManifest,
  compileCedrosRoutineThemeManifest,
  type CedrosThemeManifest,
} from "@cedros/theme-runtime";
import { DocArticleTemplate, BlogPostTemplate } from "@cedros/theme-runtime/preview";

const manifest: CedrosThemeManifest = cedrosThemeStarterManifest;
const issues = validateCedrosRoutineThemeManifest(manifest);
const compiled = compileCedrosRoutineThemeManifest(manifest);
const props = { standalone: true, theme: compiled, siteTitle: "Theme review", navigation: [{ key: "home", label: "Home", route: "/" }], title: "Review", bodyMarkdown: "## Review\n\nShared runtime content." };
console.log(issues, createElement(DocArticleTemplate, props), createElement(BlogPostTemplate, props));
