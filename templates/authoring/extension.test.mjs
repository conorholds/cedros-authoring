import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const manifestPath = resolve(root, "cedros-extension.manifest.json");

test("canonical verifier accepts the generated manifest", () => {
  const result = verify(manifestPath);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(JSON.parse(result.stdout).status, "pass");
});

test("canonical verifier rejects unsupported schema versions and mismatched package versions", () => {
  const temp = mkdtempSync(resolve(tmpdir(), "cedros-extension-contract-"));
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const candidate of [
      { ...manifest, schemaVersion: 2 },
      { ...manifest, packageFamily: { ...manifest.packageFamily, react: { ...manifest.packageFamily.react, version: "999.0.0" } } },
    ]) {
      const path = resolve(temp, "manifest.json");
      writeFileSync(path, JSON.stringify(candidate));
      const result = verify(path);
      assert.equal(result.status, 1, result.stderr || result.stdout);
      assert.equal(JSON.parse(result.stdout).status, "fail");
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

function verify(path) {
  return spawnSync(process.execPath, [resolve(root, "scripts/cedros-authoring.mjs"), "validate-manifest", path, "--json"], { encoding: "utf8" });
}
