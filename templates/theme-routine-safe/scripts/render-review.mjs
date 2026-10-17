import { lstatSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DocArticleTemplate, BlogPostTemplate } from "@cedros/theme-runtime/preview";

import { themePackage } from "../src/theme-package.mjs";
import { assertValidThemePackage } from "./validate-theme.mjs";
import { copyThemeFonts } from "./theme-assets.mjs";

const { compiled } = assertValidThemePackage(themePackage);
const require = createRequire(import.meta.url);
const stylesheet = readFileSync(require.resolve("@cedros/theme-runtime/styles.css"), "utf8");
const props = {
  standalone: true,
  theme: compiled,
  siteTitle: compiled.manifest.theme.label,
  navigation: [{ key: "home", label: "Home", route: "/" }],
  title: "Shared theme runtime review",
  bodyMarkdown: "## Theme review\n\nReview paragraphs, **emphasis**, [links](/docs), and `code` through the shared runtime.\n\n### Long content\n\nThis preview uses the same docs and blog templates as the host. Check typography, spacing, focus, contrast, and responsive widths before installed-site acceptance.",
};
const previews = [
  { file: "index.html", component: DocArticleTemplate, props: { ...props, docs: [{ slug: "theme-review", title: "Theme review", category: "Guides" }], currentPath: "/docs/theme-review" } },
  { file: "blog.html", component: BlogPostTemplate, props: { ...props, author: "Theme author", publishedAt: "2026-10-16", currentPath: "/blog/theme-review" } },
];
const output = resolve(process.cwd(), ".theme-review");
for (const path of [output, ...previews.map((preview) => resolve(output, preview.file))]) {
  if (lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error("theme review output cannot be a symlink");
}
mkdirSync(output, { recursive: true });
copyThemeFonts(process.cwd(), output, compiled.manifest);
for (const preview of previews) {
  const content = renderToStaticMarkup(React.createElement(preview.component, preview.props));
  const html = `<!doctype html>
<html lang="en" data-cedros-theme-review="@cedros/theme-runtime@0.1.0">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Shared theme runtime review</title><style>${stylesheet}</style></head>
<body><nav aria-label="Review surface"><a href="index.html">Docs preview</a> · <a href="blog.html">Blog preview</a></nav>${content}</body></html>\n`;
  writeFileSync(resolve(output, preview.file), html);
}
console.log(`Rendered shared docs/blog runtime previews at ${output}; installed-site acceptance remains separate.`);
