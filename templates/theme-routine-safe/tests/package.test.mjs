import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { unzipSync } from "fflate";
import { themePackage } from "../src/theme-package.mjs";

const script = resolve(import.meta.dirname, "../scripts/package-theme.mjs");
const { id, version } = themePackage.manifest.theme;

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), "cedros-theme-package-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const staging = resolve(root, "dist", `${id}-${version}`);
  const archive = `${staging}.zip`;
  const run = () => execFileSync(process.execPath, [script], { cwd: root, stdio: "pipe" });
  return { root, staging, archive, run };
}

test("theme packaging excludes deleted assets and stale staging content on rebuild", (t) => {
  const f = fixture(t);
  mkdirSync(resolve(f.root, "fonts"));
  writeFileSync(resolve(f.root, "fonts/example.woff2"), "font fixture");
  f.run();
  let entries = unzipSync(readFileSync(f.archive));
  assert.deepEqual(Object.keys(entries).sort(), ["fonts/example.woff2", "manifest.json"]);
  assert.deepEqual(JSON.parse(Buffer.from(entries["manifest.json"]).toString()), themePackage);
  writeFileSync(resolve(f.staging, "private-runtime.tgz"), "must not survive staging rebuild");
  rmSync(resolve(f.root, "fonts/example.woff2"));
  f.run();
  const bytes = readFileSync(f.archive);
  entries = unzipSync(bytes);
  assert.deepEqual(Object.keys(entries), ["manifest.json"]);
  assert.match(readFileSync(`${f.archive}.sha256`, "utf8"), new RegExp(`^${createHash("sha256").update(bytes).digest("hex")}  `));
});

test("theme packaging refuses output symlinks and preserves their targets", (t) => {
  for (const kind of ["dist", "staging", "archive", "checksum"]) {
    const f = fixture(t);
    const outside = resolve(f.root, "outside");
    mkdirSync(outside);
    const marker = resolve(outside, "keep.txt");
    writeFileSync(marker, "keep");
    mkdirSync(resolve(f.root, "dist"));
    const path = { dist: resolve(f.root, "dist"), staging: f.staging, archive: f.archive, checksum: `${f.archive}.sha256` }[kind];
    if (kind === "dist") rmSync(path, { recursive: true });
    symlinkSync(kind === "dist" || kind === "staging" ? outside : marker, path);
    assert.throws(f.run, /theme package output cannot be a symlink/);
    assert.equal(readFileSync(marker, "utf8"), "keep");
  }
});

test("theme packaging rejects source font symlinks", (t) => {
  const f = fixture(t);
  const outside = resolve(f.root, "outside");
  mkdirSync(outside);
  writeFileSync(resolve(outside, "private.txt"), "keep");
  symlinkSync(outside, resolve(f.root, "fonts"));
  assert.throws(f.run, /theme packages cannot include symlinks/);
  assert.equal(existsSync(f.archive), false);
  assert.equal(readFileSync(resolve(outside, "private.txt"), "utf8"), "keep");
});
