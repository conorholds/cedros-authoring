import { basename, resolve } from "node:path";

import { readHumanText, resolveSafeTarget } from "./authoring-utils.mjs";

const RESERVED_EXTENSION_IDS = new Set([
  "cedros-alpha-feedback",
  "cedros-domains",
  "cedros-fleet",
  "cedros-managed-services",
  "cedros-providers",
]);

export function normalizeExtensionScaffoldOptions(options) {
  const targetDir = resolveSafeTarget(options.targetDir);
  const extensionId = readExtensionId(options.extensionId, targetDir);
  const version = readVersion(options.version);
  const npmScope = readNpmScope(options.npmScope);
  const displayName = readHumanText(options.displayName, titleFromId(extensionId), {
    field: "display name",
    maxLength: 120,
  });
  const server = nonEmpty(options.server) || "none";
  if (!["none", "rust"].includes(server)) {
    throw new Error(`unsupported --server value "${server}"; use "none" or "rust"`);
  }

  const serverPackageName = `${extensionId}-server`;
  const reactPackageName = `${npmScope}/${extensionId}`;
  const nativePackageName = `${npmScope}/${extensionId}-native`;

  return {
    targetDir,
    extensionId,
    displayName,
    version,
    npmScope,
    server,
    serverPackageName,
    serverLibName: toRustIdentifier(serverPackageName),
    reactPackageName,
    nativePackageName,
    adminModuleId: `${extensionId}:admin`,
    overviewSectionId: `${extensionId}:overview`,
  };
}

export function toRustIdentifier(value) {
  return value.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^([0-9])/, "_$1");
}

function readExtensionId(input, targetDir) {
  const candidate = nonEmpty(input) || basename(targetDir);
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(candidate)) {
    throw new Error(
      `invalid extension id "${candidate}"; use lowercase kebab-case starting with a letter`,
    );
  }
  if (RESERVED_EXTENSION_IDS.has(candidate)) {
    throw new Error(`${candidate} is reserved by Cedros managed extensions`);
  }
  return candidate;
}

function readVersion(input) {
  const version = nonEmpty(input) || "1.0.0";
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(version)) {
    throw new Error(`invalid version "${version}"; use semantic versioning like 1.0.0`);
  }
  return version;
}

function readNpmScope(input) {
  const scope = nonEmpty(input) || "@cedros-extensions";
  if (!/^@[a-z0-9][a-z0-9._-]*$/u.test(scope)) {
    throw new Error(`invalid npm scope "${scope}"`);
  }
  return scope;
}

function titleFromId(extensionId) {
  return extensionId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
