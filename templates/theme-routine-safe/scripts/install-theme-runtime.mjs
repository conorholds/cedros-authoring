import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

export async function prepareThemeRuntime(projectRoot = root, tarballPath = "") {
  const pin = JSON.parse(readFileSync(resolve(projectRoot, "contracts/theme-runtime.json"), "utf8"));
  const spec = `file:.theme-runtime/${pin.fileName}`;
  const manifest = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8"));
  const lock = JSON.parse(readFileSync(resolve(projectRoot, "package-lock.json"), "utf8"));
  const locked = lock.packages?.[`node_modules/${pin.packageName}`];
  if (manifest.dependencies?.[pin.packageName] !== spec || lock.packages?.[""]?.dependencies?.[pin.packageName] !== spec || locked?.version !== pin.version || locked?.resolved !== spec || locked?.integrity !== pin.integrity) {
    throw new Error("Theme runtime dependency and lockfile must match contracts/theme-runtime.json.");
  }
  const directory = resolve(projectRoot, ".theme-runtime");
  if (lstatSync(directory, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error("Theme runtime directory must not be a symlink.");
  const target = resolve(directory, pin.fileName);
  if (lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error("Theme runtime tarball must not be a symlink.");
  let bytes;
  if (tarballPath) bytes = readFileSync(resolve(tarballPath));
  else if (lstatSync(target, { throwIfNoEntry: false })) bytes = readFileSync(target);
  else {
    let response;
    try {
      response = await fetch(new URL("package.tgz", pin.canonicalBase), { signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      throw new Error("Theme runtime download could not be completed. Supply the authorized tarball with make install THEME_RUNTIME_TARBALL=/path/to/package.tgz.", { cause: error });
    }
    if (!response.ok) throw new Error(`Theme runtime download failed: HTTP ${response.status}. Supply the authorized tarball with make install THEME_RUNTIME_TARBALL=/path/to/package.tgz.`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (createHash("sha256").update(bytes).digest("hex") !== pin.sha256 || `sha512-${createHash("sha512").update(bytes).digest("base64")}` !== pin.integrity) {
    throw new Error("Theme runtime tarball checksum does not match the pinned private artifact.");
  }
  mkdirSync(directory, { recursive: true });
  writeFileSync(target, bytes);
  console.log(`Verified ${pin.packageName}@${pin.version}; private tarball retained under ignored .theme-runtime/.`);
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  prepareThemeRuntime(root, process.argv[2]).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
