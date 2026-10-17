import { readFileSync } from "node:fs";

export function scriptFiles(model) {
  return [
    textFile("scripts/package-extension.js", packageExtensionScript()),
    ...(model.server === "rust" ? [textFile("scripts/build-server.mjs", readFileSync(new URL("../templates/extensions/scripts/build-server.mjs", import.meta.url), "utf8"))] : []),
    textFile("scripts/sync-generated-manifest.js", syncGeneratedManifestScript()),
    textFile("scripts/validate-extension.js", validateExtensionScript()),
  ];
}

function textFile(path, content) {
  return { path, content };
}

function syncGeneratedManifestScript() {
  return joinLines([
    'import { mkdirSync, readFileSync, writeFileSync } from "node:fs";',
    'import { dirname, resolve } from "node:path";',
    'import { fileURLToPath } from "node:url";',
    "",
    'const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");',
    'const manifest = JSON.parse(readFileSync(resolve(root, "cedros-extension.manifest.json"), "utf8"));',
    "const source = [",
    "  `export const generatedManifest = ${JSON.stringify(manifest, null, 2)};`,",
    '  ""',
    '].join("\\n");',
    "",
    'for (const packageDir of ["packages/react", "packages/react-native"]) {',
    '  const outputPath = resolve(root, packageDir, "src/generated-manifest.ts");',
    "  mkdirSync(dirname(outputPath), { recursive: true });",
    "  writeFileSync(outputPath, source);",
    "}",
    "",
    'const bootstrapPath = resolve(root, "cedros-extension.bootstrap.json");',
    "writeFileSync(bootstrapPath, `${JSON.stringify({ manifest }, null, 2)}\\n`);",
    "console.log(`synced generated manifests for ${manifest.extensionId}@${manifest.version}`);",
  ]);
}

function validateExtensionScript() {
  return joinLines([
    validateHeader(),
    validatePackageFamily(),
    validateRegistration(),
    validateAdminSurface(),
    validateRuntime(),
    validateHelpers(),
  ]);
}

function validateHeader() {
  return joinLines([
    'import { existsSync, readFileSync } from "node:fs";',
    'import { resolve } from "node:path";',
    'import { fileURLToPath } from "node:url";',
    "",
    'const root = resolve(fileURLToPath(new URL("..", import.meta.url)));',
    'const manifest = readJson("cedros-extension.manifest.json");',
    'const bootstrap = readJson("cedros-extension.bootstrap.json");',
    'const reactPackage = readJson("packages/react/package.json");',
    'const nativePackage = readJson("packages/react-native/package.json");',
    'const serverToml = readFile("packages/server/Cargo.toml");',
    "",
    'assertEqual(manifest.schemaVersion, 1, "schemaVersion");',
    'assertEqual(manifest.platformApiVersion, "1", "platformApiVersion");',
    'assertEqual(manifest.compatibility?.platformApiVersion, "1", "compatibility.platformApiVersion");',
    'assertEqual(bootstrap.manifest, manifest, "bootstrap manifest must match manifest");',
    "assertPackageFamily();",
    "assertRegistration();",
    "assertAdminSurface();",
    "assertRuntimeOutputs();",
    "assertServerRuntimeReady();",
    "",
    "console.log(`validated ${manifest.extensionId}@${manifest.version}`);",
  ]);
}

function validatePackageFamily() {
  return joinLines([
    "function assertPackageFamily() {",
    '  assertEqual(reactPackage.name, manifest.packageFamily.react.packageName, "react package name");',
    '  assertEqual(nativePackage.name, manifest.packageFamily.reactNative.packageName, "native package name");',
    '  assertEqual(reactPackage.version, manifest.version, "react package version");',
    '  assertEqual(nativePackage.version, manifest.version, "native package version");',
    '  assertEqual(reactPackage.exports?.["./admin/register"], "./dist/admin/register.js", "react admin export");',
    '  assertEqual(reactPackage.exports?.["./web/register"], "./dist/web/register.js", "react web export");',
    '  assertEqual(nativePackage.exports?.["./register"], "./dist/register.js", "native export");',
    '  assertIncludes(serverToml, `name = "${manifest.packageFamily.server.packageName}"`, "server package name");',
    '  assertIncludes(serverToml, `version = "${manifest.version}"`, "server package version");',
    "}",
  ]);
}

function validateRegistration() {
  return joinLines([
    "function assertRegistration() {",
    '  const serverLib = manifest.packageFamily.server.packageName.replace(/[^a-zA-Z0-9_]/g, "_");',
    "  assertEqual(",
    "    manifest.registration.server.entrypoint,",
    '    `${serverLib}::register_extension_family`,',
    '    "server entrypoint"',
    "  );",
    '  assertEqual(manifest.registration.admin.entrypoint, `${manifest.packageFamily.react.packageName}/admin/register`, "admin entrypoint");',
    '  assertEqual(manifest.registration.web.entrypoint, `${manifest.packageFamily.react.packageName}/web/register`, "web entrypoint");',
    '  assertEqual(manifest.registration.native.entrypoint, `${manifest.packageFamily.reactNative.packageName}/register`, "native entrypoint");',
    "}",
  ]);
}

function validateAdminSurface() {
  return joinLines([
    "function assertAdminSurface() {",
    "  const adminModule = manifest.adminModules?.[0];",
    '  if (!adminModule) throw new Error("adminModules[0] missing");',
    '  assertEqual(manifest.surfaces.admin.moduleIds, [adminModule.moduleId], "admin module ids");',
    '  assertEqual(adminModule.extensionId, manifest.extensionId, "admin module extensionId");',
    '  assertEqual(adminModule.version, manifest.version, "admin module version");',
    '  assertEqual(adminModule.packageName, manifest.packageFamily.react.packageName, "admin package name");',
    "  for (const sectionId of adminModule.sectionIds ?? []) {",
    "    if (!adminModule.sectionIcons?.[sectionId]) {",
    "      throw new Error(`${sectionId} missing sectionIcons fallback`);",
    "    }",
    "  }",
    "}",
  ]);
}

function validateRuntime() {
  return joinLines([
    "function assertRuntimeOutputs() {",
    '  assertFileExists("packages/react/dist/admin/register.js", "compiled React admin runtime");',
    '  assertFileExists("packages/react/dist/web/register.js", "compiled React web runtime");',
    '  assertFileExists("packages/react-native/dist/register.js", "compiled React Native runtime");',
    "}",
    "",
    "function assertServerRuntimeReady() {",
    '  assertFileExists("packages/server/wit/cedros-extension.wit", "vendored Cedros extension WIT");',
    '  if (declaresServerRuntime() && !existsSync(resolve(root, "cedros-extension.server.wasm"))) {',
    '    throw new Error("declared server runtime surfaces require cedros-extension.server.wasm");',
    "  }",
    "}",
    "",
    "function declaresServerRuntime() {",
    "  const server = manifest.surfaces?.server ?? {};",
    '  const keys = ["routes", "jobs", "events", "migrations", "settingsSchemas", "contentModels"];',
    "  return keys.some((key) => Array.isArray(server[key]) && server[key].length > 0);",
    "}",
  ]);
}

function validateHelpers() {
  return joinLines([
    "function readJson(path) {",
    "  return JSON.parse(readFile(path));",
    "}",
    "",
    "function readFile(path) {",
    '  return readFileSync(resolve(root, path), "utf8");',
    "}",
    "",
    "function assertEqual(actual, expected, label) {",
    "  if (JSON.stringify(actual) !== JSON.stringify(expected)) {",
    "    throw new Error(`${label} mismatch`);",
    "  }",
    "}",
    "",
    "function assertIncludes(actual, expected, label) {",
    "  if (!actual.includes(expected)) throw new Error(`${label} missing`);",
    "}",
    "",
    "function assertFileExists(path, label) {",
    "  if (!existsSync(resolve(root, path))) throw new Error(`${label} missing`);",
    "}",
  ]);
}

function packageExtensionScript() {
  return joinLines([
    packageHeader(),
    packageEntries(),
    packageBody(),
    packageReadHelpers(),
    packageArchiveHelpers(),
  ]);
}

function packageHeader() {
  return joinLines([
    'import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";',
    'import { createHash } from "node:crypto";',
    'import { resolve } from "node:path";',
    'import { fileURLToPath } from "node:url";',
    'import { strToU8, zipSync } from "fflate";',
    "",
    'const root = resolve(fileURLToPath(new URL("..", import.meta.url)));',
    'const manifest = readJson("cedros-extension.manifest.json");',
    "const bootstrap = { manifest };",
    'const reactPackage = readJson("packages/react/package.json");',
  ]);
}

function packageEntries() {
  return joinLines([
    "const entries = {",
    '  "cedros-extension.manifest.json": encode(manifest),',
    '  "cedros-extension.bootstrap.json": encode(bootstrap),',
    '  "workspace/README.md": readBytes("README.md"),',
    '  "workspace/server/Cargo.toml": readBytes("packages/server/Cargo.toml"),',
    '  "workspace/server/src/lib.rs": readBytes("packages/server/src/lib.rs"),',
    '  "workspace/server/wit/cedros-extension.wit": readBytes("packages/server/wit/cedros-extension.wit"),',
    '  "workspace/react/package.json": readBytes("packages/react/package.json"),',
    '  "workspace/react/tsconfig.json": readBytes("packages/react/tsconfig.json"),',
    '  "workspace/react/src/generated-manifest.ts": readBytes("packages/react/src/generated-manifest.ts"),',
    '  "workspace/react/src/cedros-admin-runtime.d.ts": readBytes("packages/react/src/cedros-admin-runtime.d.ts"),',
    '  "workspace/react/src/manifest.ts": readBytes("packages/react/src/manifest.ts"),',
    '  "workspace/react/src/bootstrap.ts": readBytes("packages/react/src/bootstrap.ts"),',
    '  "workspace/react/src/admin/register.ts": readBytes("packages/react/src/admin/register.ts"),',
    '  "workspace/react/src/web/register.ts": readBytes("packages/react/src/web/register.ts"),',
    '  "workspace/react-native/package.json": readBytes("packages/react-native/package.json"),',
    '  "workspace/react-native/tsconfig.json": readBytes("packages/react-native/tsconfig.json"),',
    '  "workspace/react-native/src/generated-manifest.ts": readBytes("packages/react-native/src/generated-manifest.ts"),',
    '  "workspace/react-native/src/cedros-admin-runtime.d.ts": readBytes("packages/react-native/src/cedros-admin-runtime.d.ts"),',
    '  "workspace/react-native/src/manifest.ts": readBytes("packages/react-native/src/manifest.ts"),',
    '  "workspace/react-native/src/bootstrap.ts": readBytes("packages/react-native/src/bootstrap.ts"),',
    '  "workspace/react-native/src/register.ts": readBytes("packages/react-native/src/register.ts")',
    "};",
  ]);
}

function packageBody() {
  return joinLines([
    'if (existsSync(resolve(root, "packages/server/wit/route-only.wit"))) entries["workspace/server/wit/route-only.wit"] = readBytes("packages/server/wit/route-only.wit");',
    'if (existsSync(resolve(root, "packages/server/Cargo.lock"))) entries["workspace/server/Cargo.lock"] = readBytes("packages/server/Cargo.lock");',
    'addDirectoryEntries(entries, "workspace/react/dist", "packages/react/dist");',
    'addDirectoryEntries(entries, "workspace/react-native/dist", "packages/react-native/dist");',
    "if ((manifest.adminModules ?? []).length > 0) {",
    "  assertEntryExists(",
    "    entries,",
    '    packageExportArchivePath("workspace/react", reactPackage.exports?.["./admin/register"]),',
    '    "React admin runtime export"',
    "  );",
    "}",
    'if (existsSync(resolve(root, "cedros-extension.server.wasm"))) {',
    '  entries["cedros-extension.server.wasm"] = readBytes("cedros-extension.server.wasm");',
    "} else if (declaresServerRuntime()) {",
    '  throw new Error("declared server runtime surfaces require cedros-extension.server.wasm");',
    "}",
    "",
    'assertEqual(bootstrap.manifest, manifest, "bootstrap manifest");',
    "for (const entryName of Object.keys(entries)) validateArchivePath(entryName);",
    "",
    "const fileName = `${manifest.extensionId}-${manifest.version}.cedros-extension.zip`;",
    "const bytes = zipSync(Object.fromEntries(Object.entries(entries).sort()), { level: 6 });",
    'const checksum = createHash("sha256").update(bytes).digest("hex");',
    'mkdirSync(resolve(root, "dist"), { recursive: true });',
    "writeFileSync(resolve(root, \"dist\", fileName), bytes);",
    "console.log(`${fileName} (${Object.keys(entries).length} entries, sha256 ${checksum})`);",
  ]);
}

function packageReadHelpers() {
  return joinLines([
    "function readJson(path) {",
    '  return JSON.parse(readFileSync(resolve(root, path), "utf8"));',
    "}",
    "",
    "function readBytes(path) {",
    "  return new Uint8Array(readFileSync(resolve(root, path)));",
    "}",
    "",
    "function addDirectoryEntries(target, archiveDir, localDir) {",
    "  for (const entry of readdirSync(resolve(root, localDir), { withFileTypes: true })) {",
    "    const localPath = `${localDir}/${entry.name}`;",
    "    const archivePath = `${archiveDir}/${entry.name}`;",
    "    if (entry.isDirectory()) addDirectoryEntries(target, archivePath, localPath);",
    "    else if (entry.isFile()) target[archivePath] = readBytes(localPath);",
    "  }",
    "}",
  ]);
}

function packageArchiveHelpers() {
  return joinLines([
    "function encode(value) {",
    "  return strToU8(JSON.stringify(value, null, 2));",
    "}",
    "",
    "function assertEqual(actual, expected, label) {",
    "  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label} mismatch`);",
    "}",
    "",
    "function assertEntryExists(entries, archivePath, label) {",
    "  if (!entries[archivePath]) throw new Error(`${label} missing from archive at ${archivePath}`);",
    "}",
    "",
    "function packageExportArchivePath(packageRoot, exportPath) {",
    '  if (typeof exportPath !== "string" || !exportPath.startsWith("./")) {',
    "    throw new Error(`invalid package export path ${String(exportPath)}`);",
    "  }",
    "  return `${packageRoot}/${exportPath.slice(2)}`;",
    "}",
    "",
    "function validateArchivePath(path) {",
    '  if (path.startsWith("/") || path.includes("../") || path.includes("\\\\")) {',
    "    throw new Error(`archive contains unsafe path \"${path}\"`);",
    "  }",
    "}",
    "",
    "function declaresServerRuntime() {",
    "  const server = manifest.surfaces?.server ?? {};",
    '  const keys = ["routes", "jobs", "events", "migrations", "settingsSchemas", "contentModels"];',
    "  return keys.some((key) => Array.isArray(server[key]) && server[key].length > 0);",
    "}",
  ]);
}

function joinLines(lines) {
  return `${lines.filter((line) => line !== "").join("\n\n")}\n`;
}
