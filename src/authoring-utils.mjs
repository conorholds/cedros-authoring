import { existsSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, parse, relative, resolve, sep } from "node:path";

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/u;

export function resolveSafeTarget(targetDir) {
  if (typeof targetDir !== "string" || targetDir.trim() === "") {
    throw new Error("Target directory is required.");
  }
  const resolved = canonicalizePotentialPath(resolve(targetDir));
  if (resolved === parse(resolved).root) {
    throw new Error("refusing to scaffold into a filesystem root");
  }
  return resolved;
}

export function assertInsideTarget(targetDir, outputPath) {
  const canonicalTarget = canonicalizePotentialPath(targetDir);
  const canonicalOutput = canonicalizePotentialPath(outputPath);
  const rel = relative(canonicalTarget, canonicalOutput);
  if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`unsafe scaffold output path: ${outputPath}`);
  }
}

function canonicalizePotentialPath(path) {
  let existing = resolve(path);
  const missing = [];
  while (!existsSync(existing)) {
    const parent = dirname(existing);
    if (parent === existing) break;
    missing.unshift(basename(existing));
    existing = parent;
  }
  const canonicalBase = existsSync(existing) ? realpathSync(existing) : existing;
  return resolve(canonicalBase, ...missing);
}

export function readHumanText(value, fallback, { field, maxLength }) {
  const candidate = typeof value === "string" && value.trim() ? value.trim() : fallback;
  if (typeof candidate !== "string" || candidate.length === 0) {
    throw new Error(`${field} is required`);
  }
  if (CONTROL_CHARACTERS.test(candidate)) {
    throw new Error(`${field} must not contain control characters or line breaks`);
  }
  if (candidate.length > maxLength) {
    throw new Error(`${field} must be ${maxLength} characters or fewer`);
  }
  return candidate;
}

export function javascriptString(value) {
  return JSON.stringify(String(value));
}

export function tomlString(value) {
  return JSON.stringify(String(value));
}

export function renderTemplate(source, replacements) {
  let output = source;
  for (const [key, value] of replacements) {
    output = output.split(key).join(String(value));
  }
  const unresolved = output.match(/__CEDROS_[A-Z0-9_]+__/gu);
  if (unresolved) {
    throw new Error(`unresolved template markers: ${[...new Set(unresolved)].join(", ")}`);
  }
  return output;
}
