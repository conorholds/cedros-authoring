import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { validatePageSources, validatePageWorkspace } from "../scripts/validate-page.mjs";

const root = resolve(import.meta.dirname, "..");

test("custom-page workspace validates", () => {
  assert.deepEqual(validatePageWorkspace(root), { ok: true, errors: [] });
});

test("custom-page validation rejects native DOM and unsupported web imports", () => {
  const manifest = JSON.parse(readFileSync(resolve(root, "page.json"), "utf8"));
  const markdown = readFileSync(resolve(root, "page.md"), "utf8");
  const result = validatePageSources({
    manifest,
    markdown,
    web: 'import x from "unpublished-package"; export default function Page(){ return <main />; }',
    native: 'import React from "react"; export default function Page(){ return <div />; }',
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /unsupported module unpublished-package/);
  assert.match(result.errors.join("\n"), /React Native primitives/);
});
