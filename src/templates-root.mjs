import { readFileSync } from "node:fs";
import { manifestFor } from "./templates-manifest.mjs";

export function rootFiles(model) {
  const manifest = manifestFor(model);
  return [
    textFile(".gitignore", gitignore()),
    textFile(".node-version", "24.17.0\n"),
    textFile("AGENTS.md", agents(model)),
    textFile("Makefile", makefile(model)),
    textFile("README.md", readme(model)),
    textFile("cedros-extension.bootstrap.json", json({ manifest })),
    textFile("cedros-extension.manifest.json", json(manifest)),
    textFile("extension-context.json", json(extensionContext())),
    textFile("package.json", packageJson(model)),
    textFile("package-lock.json", readFileSync(new URL("../templates/authoring/extension-package-lock.json", import.meta.url), "utf8")
      .replaceAll("__CEDROS_EXTENSION_ID__", model.extensionId)
      .replaceAll("__CEDROS_REACT_PACKAGE__", model.reactPackageName)
      .replaceAll("__CEDROS_NATIVE_PACKAGE__", model.nativePackageName)
      .replaceAll("__CEDROS_EXTENSION_VERSION__", model.version)),
    textFile("rust-toolchain.toml", rustToolchain()),
  ];
}

function textFile(path, content) {
  return { path, content };
}

function packageJson(model) {
  return json({
    name: `${model.extensionId}-extension-workspace`,
    private: true,
    type: "module",
    packageManager: "npm@11.13.0",
    engines: {
      node: ">=24.17.0 <25",
    },
    workspaces: ["packages/react", "packages/react-native"],
    scripts: {
      ...(model.server === "rust" ? { "build:server": "node scripts/build-server.mjs", "test:server": "cargo test --locked --manifest-path packages/server/Cargo.toml" } : {}),
      "sync:manifest": "node scripts/sync-generated-manifest.js",
      build: [
        "npm run sync:manifest",
        `npm --workspace ${model.reactPackageName} run build`,
        `npm --workspace ${model.nativePackageName} run build`,
        ...(model.server === "rust" ? ["npm run build:server"] : []),
      ].join(" && "),
      validate: "npm run build && node scripts/validate-extension.js && node scripts/cedros-authoring.mjs validate-manifest cedros-extension.manifest.json --json && node scripts/cedros-authoring.mjs check-runtime-alignment --repo . --json && node scripts/cedros-authoring.mjs validate-context extension-context.json --json",
      package: "npm run validate && node scripts/package-extension.js && node scripts/cedros-authoring.mjs validate --repo . --json",
      test: `npm run validate && node --test tests/*.test.mjs${model.server === "rust" ? " && npm run test:server" : ""}`,
    },
    dependencies: {
      fflate: "0.8.3",
    },
  });
}

function makefile(model) {
  return `.DEFAULT_GOAL := help
.PHONY: install sync build build-server validate package test clean help

install:
\tnpm ci --ignore-scripts --audit=false --fund=false

sync:
\tnpm run sync:manifest

build:
\tnpm run build

build-server:
${model.server === "rust" ? "\tnpm run build:server" : "\tcd packages/server && cargo check"}

validate:
\tnpm run validate

package:
\tnpm run package

test:
\tnpm run test

clean:
\trm -rf dist packages/react/dist packages/react-native/dist packages/server/target cedros-extension.server.wasm

help:
\t@echo "Cedros extension authoring commands:"
\t@echo "  make install      Install npm workspace dependencies"
\t@echo "  make validate     Build and validate manifest/package alignment"
\t@echo "  make build        Build generated runtimes and the selected backend"
\t@echo "  make package      Write dist/<id>-<version>.cedros-extension.zip"
\t@echo "  make test         Run the scaffold validation loop"
\t@echo "  make build-server ${model.server === "rust" ? "Build the Rust Wasm component" : "Check server family registration metadata"}"
`;
}

function readme(model) {
  return `# ${model.displayName}

Cedros extension scaffold for \`${model.extensionId}\`.

Requires Node.js 24.17.x, npm 11.13.0, and \`make\`. ${model.server === "rust" ? "The Rust backend also requires Rust stable with the wasm32-wasip2 target; run rustup target add wasm32-wasip2 before building." : "The default UI-only build requires no Rust toolchain. Rust is needed only if you explicitly check the server family registration crate."}
The canonical verifier also requires \`unzip\`.

## Workflow

\`\`\`bash
make install
make build
make validate
make package
make test
\`\`\`

The validation, package, and test targets build the React and React Native
runtime exports. ${model.server === "rust" ? "They also build the locked Rust Wasm component. Use make build-server to build just that component, and npm run test:server to run the Rust route tests." : "Run make build-server separately to check the server family registration crate. The default package has no server routes or jobs."}

\`make package\` writes \`dist/${model.extensionId}-${model.version}.cedros-extension.zip\`.
Upload that archive through Cedros admin Extensions.

## Shape

- \`cedros-extension.manifest.json\` is the canonical manifest.
- \`packages/server\` owns server family registration and the pinned WIT.
- \`packages/react\` owns admin and public web registration exports.
- \`packages/react-native\` owns the native bootstrap export.

${model.server === "rust" ? `The Rust backend exports GET /extensions/${model.extensionId}/status, returning the manifest identity and version. It uses a route-only guest world with no privileged host imports, rejects unknown routes/methods/paths, declares no jobs, and packages the compiled component as cedros-extension.server.wasm. Run npm run test:server for the Rust route tests.` : "The default scaffold starts with one executable admin module and no server routes or jobs. Choose --server rust when creating a workspace to include the executable status-route Wasm backend."}

## Versioned contracts and evidence

The supported baseline is Cedros 0.1.98, platform API 1. The immutable kit
under \`authoring/\` is verified against its pinned archive, manifest,
content-set, and file checksums before its unmodified verifier executes.
Extracted references live under ignored \`archive/cedros-authoring/\`.

\`\`\`sh
node scripts/cedros-authoring.mjs resolve-path --repo . --mode create-extension --json
node scripts/cedros-authoring.mjs validate --repo . --json
\`\`\`

The aggregate validation command needs the final ZIP from \`make package\`.
It checks the artifact and documentation as well as manifest, context, and
runtime alignment. Maintain \`extension-context.json\` as decisions, questions,
and evidence change. Initial installed-host evidence is explicitly not run;
a local pass does not establish host acceptance or release readiness.

Browser source uses \`cedros:admin\` with the kit's frozen local declarations.
Those declarations expose shared types and only the \`toast\` value. Other
documented shim values require matching ambient declarations; follow the
runtime reference and externalize only documented host imports. Current-WIT
guests are not guaranteed to run on older hosts.

For current site-specific capabilities, read \`<site-origin>/skill.md\` before
adding surfaces and use the authenticated \`<site-origin>/mcp\` registry as the
exact operational contract. After installing the pinned build dependencies, local authoring and validation
remain available offline. Installed-host acceptance is a separate check.
`;
}

function agents(model) {
  return `# Cedros Extension Authoring Instructions

This workspace authors the \`${model.extensionId}\` Cedros extension package family.
These instructions apply to this generated project. Start with \`README.md\` and the canonical manifest; this file grants no permission to install or publish to a connected site.

${model.server === "rust" ? "The selected backend is Rust/Wasm. The normal build and package loop compiles the status-route component; npm run test:server checks its acceptance and rejection paths." : "This project starts UI-only, with no server routes or jobs. The server family registration crate is metadata, not an executable backend."}

- Keep \`cedros-extension.manifest.json\` canonical; run \`make validate\` after edits.
- Use the pinned 0.1.98 kit and \`node scripts/cedros-authoring.mjs resolve-path --repo . --mode <mode> --json\` for task routing. Preserve shared \`extension-context.json\` decisions, questions, and evidence.
- Use \`cedros:admin\` and the frozen kit declarations. Add ambient types for other documented values only; do not install a Cedros registry dependency.
- Do not invent manifest fields, SDK services, host routes, or permissions.
- Read the target site's \`/skill.md\` and relevant \`/skills/<skill-id>.md\` before adding capabilities.
- Use the authenticated \`/mcp\` tool schemas as the exact live contract.
- Declare only the capabilities actually required and fail closed when permissions or host dependencies are missing.
- Keep admin, web, native, and server identities and versions aligned.
- Run \`make package\` and inspect the resulting ZIP before handoff.
- Keep local static evidence distinct from installed-host behavior, visual review, and publication.
`;
}

function gitignore() {
  return `node_modules/
archive/cedros-authoring/
dist/
packages/react/dist/
packages/react-native/dist/
packages/server/target/
cedros-extension.server.wasm
.DS_Store
`;
}

function extensionContext() {
  return {
    schemaVersion: "1.0.0",
    lifecycleStatus: "inventory",
    taskMode: "create-extension",
    cedros: {
      skillVersion: "0.1.98",
      platformApiVersion: "1",
      manifestSchemaVersion: 1,
      witPackage: "cedros:extension",
      witVersion: "0.1.0",
      witSha256: "2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9",
      sourceCommit: "66ae9f689dd09357e0b8e5ff211f885017a4cfa4",
    },
    repository: { root: ".", inventoryCompleted: false, existingIntentPreserved: true, manifestPath: "cedros-extension.manifest.json" },
    decisions: [],
    surfaces: [],
    hostDependencies: [],
    evidence: [{ id: "installed-host", kind: "host", status: "not-run", source: "Target-site acceptance remains required." }],
    unresolvedQuestions: [],
    conflicts: [],
  };
}

function rustToolchain() {
  return `[toolchain]
channel = "stable"
targets = ["wasm32-wasip2"]
`;
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
