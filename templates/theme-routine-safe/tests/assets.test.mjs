import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { copyThemeFonts } from "../scripts/theme-assets.mjs";

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), "cedros-theme-assets-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const output = resolve(root, "review");
  mkdirSync(resolve(root, "fonts"));
  mkdirSync(output);
  return { root, output };
}

const fonts = [{ id: "display", family: "Display", source: "./fonts/display.woff2", sources: [{ source: "./fonts/display.woff" }] }];

test("shared asset handling copies primary/fallback files into previews and removes deleted assets", (t) => {
  const { root, output } = fixture(t);
  for (const name of ["display.woff2", "display.woff"]) writeFileSync(resolve(root, "fonts", name), `asset fixture ${name}`);
  copyThemeFonts(root, output, { assets: { fonts } });
  assert.equal(readFileSync(resolve(output, "fonts/display.woff"), "utf8"), "asset fixture display.woff");
  assert.equal(readFileSync(resolve(output, "fonts/display.woff2"), "utf8"), "asset fixture display.woff2");
  rmSync(resolve(root, "fonts/display.woff"));
  copyThemeFonts(root, output, { assets: { fonts: [{ ...fonts[0], sources: [] }] } });
  assert.equal(existsSync(resolve(output, "fonts/display.woff")), false);
});

test("shared asset handling reports missing primary and fallback files with token paths", (t) => {
  const { root, output } = fixture(t);
  assert.throws(() => copyThemeFonts(root, output, { assets: { fonts } }), /assets\.fonts\.0\.source: referenced font is missing/);
  writeFileSync(resolve(root, "fonts/display.woff2"), "asset fixture");
  assert.throws(() => copyThemeFonts(root, output, { assets: { fonts } }), /assets\.fonts\.0\.sources\.0\.source: referenced font is missing/);
  assert.throws(() => copyThemeFonts(root, output, { assets: { fonts: [{ ...fonts[0], source: "./../outside.woff2" }] } }), /must point inside \.\/fonts/);
});

test("external and local-system font sources do not require bundled files", (t) => {
  const { root, output } = fixture(t);
  for (const source of ["https://example.com/display.woff2", "/media/display.woff2", 'local("Display")']) {
    copyThemeFonts(root, output, { assets: { fonts: [{ ...fonts[0], source, sources: [] }] } });
  }
});

test("shared asset handling refuses private runtime artifacts in font directories", (t) => {
  for (const name of ["runtime.tgz", ".theme-runtime", "node_modules"]) {
    const { root, output } = fixture(t);
    writeFileSync(resolve(root, "fonts", name), "private fixture");
    assert.throws(() => copyThemeFonts(root, output, {}), /cannot include runtime artifacts or installed dependencies/);
    assert.equal(existsSync(resolve(output, "fonts")), false);
  }
});
