import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

import { assertValidPageWorkspace } from "./validate-page.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
assertValidPageWorkspace(root);
const entries = Object.fromEntries(
  ["page.json", "page.tsx", "page.native.tsx", "page.md", "README.md"].map((path) => [path, new Uint8Array(readFileSync(resolve(root, path)))])
);
const bytes = Buffer.from(zipSync(entries, { level: 6 }));
const output = resolve(root, "dist", "__CEDROS_PAGE_ID__.cedros-page.zip");
mkdirSync(resolve(root, "dist"), { recursive: true });
writeFileSync(output, bytes);
console.log(`${output} (${Object.keys(entries).length} entries, sha256 ${createHash("sha256").update(bytes).digest("hex")})`);
