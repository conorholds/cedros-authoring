import { copyFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, "cedros-extension.manifest.json"), "utf8"));
const target = resolve(root, "packages/server/target");
execFileSync("cargo", ["build", "--locked", "--release", "--target", "wasm32-wasip2", "--target-dir", target, "--manifest-path", resolve(root, "packages/server/Cargo.toml")], { stdio: "inherit" });
const name = manifest.packageFamily.server.packageName.replace(/[^a-zA-Z0-9_]/g, "_");
const source = resolve(target, "wasm32-wasip2/release", `${name}.wasm`);
const bytes = readFileSync(source);
if (!bytes.subarray(0, 8).equals(Buffer.from([0, 97, 115, 109, 13, 0, 1, 0]))) throw new Error("Rust build did not produce a WebAssembly component.");
copyFileSync(source, resolve(root, "cedros-extension.server.wasm"));
console.log(`Built cedros-extension.server.wasm (${bytes.length} bytes).`);
