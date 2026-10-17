import test from "node:test";
import assert from "node:assert/strict";

import { themePackage } from "../src/theme-package.mjs";
import { validateThemePackage } from "../scripts/validate-theme.mjs";

test("theme package validates as routine-safe and portable", () => {
  const result = validateThemePackage(themePackage);

  assert.equal(result.ok, true);
  assert.equal(result.issues.length, 0);
  assert.equal(result.compiled.manifest.theme.id, "__CEDROS_THEME_ID__");
});

test("theme validation rejects routine-unsafe custom CSS with path context", () => {
  const invalidPackage = structuredClone(themePackage);
  invalidPackage.manifest.customCss = ".example { color: red; }";

  const result = validateThemePackage(invalidPackage);

  assert.equal(result.ok, false);
  assert.match(
    result.issues.map((issue) => issue.path).join("\n"),
    /customCss/
  );
});

test("theme validation rejects unknown and unstyled block variants", () => {
  const invalidPackage = structuredClone(themePackage);
  invalidPackage.manifest.blockVariants.hero.default = "invented-stage";

  const result = validateThemePackage(invalidPackage);

  assert.equal(result.ok, false);
  assert.match(result.issues.map((issue) => issue.path).join("\n"), /blockVariants\.hero\.default/);
});

test("shared runtime parses CSS colors in both palettes", () => {
  for (const value of ["#abcdef", "red", "rgb(12 34 56 / 50%)", "hsl(200 50% 30%)", "oklch(60% 0.1 120)", "color-mix(in srgb, red 40%, blue)"]) {
    const candidate = structuredClone(themePackage);
    candidate.manifest.tokens.colors.background = value;
    assert.equal(validateThemePackage(candidate).ok, true, value);
  }
  for (const palette of ["colors", "darkColors"]) {
    for (const value of ["this-is-not-a-color", "#zzzzzz", "rgb(nope)", "url(https://example.com/image.png)", "red; background: blue"]) {
      const candidate = structuredClone(themePackage);
      candidate.manifest.tokens[palette].background = value;
      const result = validateThemePackage(candidate);
      assert.equal(result.ok, false, value);
      assert.ok(result.issues.some((issue) => issue.path === `manifest.tokens.${palette}.background`));
    }
  }
});

test("shared runtime rejects dark base mode, partial palettes, and unknown color tokens", () => {
  for (const mutate of [
    (manifest) => { manifest.mode = "dark"; },
    (manifest) => { delete manifest.tokens.darkColors.primary; },
    (manifest) => { manifest.tokens.colors.invented = "red"; },
  ]) {
    const candidate = structuredClone(themePackage);
    mutate(candidate.manifest);
    assert.equal(validateThemePackage(candidate).ok, false);
  }
});

test("portable envelope and brand kit errors retain paths", () => {
  for (const [mutate, path] of [
    [(value) => { value.kind = "cedros-theme"; }, "kind"],
    [(value) => { value.schemaVersion = 2; }, "schemaVersion"],
    [(value) => { value.manifest = null; }, "manifest"],
    [(value) => { delete value.manifest.brandKit; }, "manifest.brandKit"],
    [(value) => { value.manifest.theme.id = "minimalist"; }, "manifest.theme.id"],
  ]) {
    const candidate = structuredClone(themePackage);
    mutate(candidate);
    assert.ok(validateThemePackage(candidate).issues.some((issue) => issue.path === path));
  }
});

test("shared compiler throws for invalid input instead of producing a partial theme", async () => {
  const { compileCedrosRoutineThemeManifest } = await import("@cedros/theme-runtime");
  const candidate = structuredClone(themePackage.manifest);
  candidate.tokens.colors.background = "this-is-not-a-color";
  assert.throws(() => compileCedrosRoutineThemeManifest(candidate), /tokens\.colors\.background/);
});

test("portable theme ids remain safe after editing the source", () => {
  for (const id of ["../../escape", "/tmp/escape", "a/b", "a\\\\b", "..", "", "X", "a".repeat(64)]) {
    const candidate = structuredClone(themePackage);
    candidate.manifest.theme.id = id;
    const result = validateThemePackage(candidate);
    assert.equal(result.ok, false, id);
    assert.ok(result.issues.some((issue) => issue.path === "manifest.theme.id"));
  }
});

test("shared preview exports render both manifest and compiled inputs through Node SSR", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { DocArticleTemplate, BlogPostTemplate } = await import("@cedros/theme-runtime/preview");
  const { createRequire } = await import("node:module");
  const { readFileSync } = await import("node:fs");
  const css = readFileSync(createRequire(import.meta.url).resolve("@cedros/theme-runtime/styles.css"), "utf8");
  assert.match(css, /cedros-dark/);
  const { compiled } = validateThemePackage(themePackage);
  for (const [component, surface] of [[DocArticleTemplate, "docsArticle"], [BlogPostTemplate, "blogPost"]]) {
    const props = { standalone: true, siteTitle: "Runtime acceptance", navigation: [{ key: "home", label: "Home", route: "/" }], title: "Runtime acceptance", bodyMarkdown: "## Shared preview\n\nBody text." };
    const render = (theme) => renderToStaticMarkup(createElement(component, { ...props, theme }));
    const html = render(themePackage.manifest);
    assert.match(html, new RegExp(`data-theme-surface="${surface}"`));
    assert.match(html, /Runtime acceptance/);
    assert.match(html, /--cedros-background-dark/);
    assert.equal(render(compiled), html);
  }
});
