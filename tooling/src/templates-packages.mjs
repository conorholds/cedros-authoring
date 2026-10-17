import { javascriptString, tomlString } from "./authoring-utils.mjs";
import { readFileSync } from "node:fs";

export function packageFiles(model) {
  return [
    textFile("packages/server/Cargo.toml", serverCargoToml(model)),
    textFile("packages/server/src/lib.rs", serverLibRs(model)),
    ...(model.server === "rust" ? [
      textFile("packages/server/Cargo.lock", readFileSync(new URL("../templates/authoring/server-Cargo.lock", import.meta.url), "utf8").replaceAll("__CEDROS_SERVER_PACKAGE__", model.serverPackageName).replaceAll("__CEDROS_EXTENSION_VERSION__", model.version)),
      textFile("packages/server/wit/route-only.wit", 'package cedros:extension@0.1.0;\n\nworld route-only {\n    import logging;\n    export routes;\n    export jobs;\n}\n'),
    ] : []),
    textFile("packages/react/package.json", reactPackageJson(model)),
    textFile("packages/react/src/admin/register.ts", reactAdminRegister(model)),
    textFile("packages/react/src/bootstrap.ts", reactBootstrap()),
    textFile("packages/react/src/cedros-admin-runtime.d.ts", runtimeTypes("react")),
    textFile("packages/react/src/manifest.ts", manifestTs()),
    textFile("packages/react/src/web/register.ts", reactWebRegister()),
    textFile("packages/react/tsconfig.json", tsconfig()),
    textFile("packages/react-native/package.json", nativePackageJson(model)),
    textFile("packages/react-native/src/bootstrap.ts", nativeBootstrap()),
    textFile("packages/react-native/src/cedros-admin-runtime.d.ts", runtimeTypes("react-native")),
    textFile("packages/react-native/src/manifest.ts", manifestTs()),
    textFile("packages/react-native/src/register.ts", nativeRegister()),
    textFile("packages/react-native/tsconfig.json", tsconfig()),
  ];
}

function textFile(path, content) {
  return { path, content };
}

function serverCargoToml(model) {
  return `[package]
name = ${tomlString(model.serverPackageName)}
version = ${tomlString(model.version)}
edition = "2021"
description = ${tomlString(`Cedros extension server package for ${model.displayName}`)}

[lib]
name = ${tomlString(model.serverLibName)}
path = "src/lib.rs"
${model.server === "rust" ? 'crate-type = ["cdylib", "rlib"]\n' : ""}
[dependencies]
serde_json = "1"
${model.server === "rust" ? 'wit-bindgen = "=0.57.0"\n' : ""}`;
}

function serverLibRs(model) {
  if (model.server === "rust") return readFileSync(new URL("../templates/authoring/server-component.rs", import.meta.url), "utf8");
  return `const MANIFEST_JSON: &str = include_str!("../../../cedros-extension.manifest.json");

pub fn register_extension_family() -> serde_json::Value {
    serde_json::from_str(MANIFEST_JSON).expect("extension manifest should stay valid")
}
`;
}

function reactPackageJson(model) {
  return json({
    name: model.reactPackageName,
    version: model.version,
    private: true,
    description: `Cedros extension React package for ${model.displayName}`,
    type: "module",
    files: ["dist"],
    exports: {
      "./admin/register": "./dist/admin/register.js",
      "./web/register": "./dist/web/register.js",
    },
    scripts: {
      build: "tsc -p tsconfig.json",
    },
    devDependencies: {
      typescript: "5.9.3",
    },
  });
}

function nativePackageJson(model) {
  return json({
    name: model.nativePackageName,
    version: model.version,
    private: true,
    description: `Cedros extension React Native package for ${model.displayName}`,
    type: "module",
    files: ["dist"],
    exports: {
      "./register": "./dist/register.js",
    },
    scripts: {
      build: "tsc -p tsconfig.json",
    },
    devDependencies: {
      typescript: "5.9.3",
    },
  });
}

function reactAdminRegister(model) {
  return `import type {
  AdminModule,
  CedrosExtensionBootstrap
} from "cedros:admin";

import { extensionBootstrap } from "../bootstrap";
import { extensionManifest } from "../manifest";

const overviewSectionId = ${javascriptString(model.overviewSectionId)};

const adminModule: AdminModule = {
  id: ${javascriptString(model.adminModuleId)},
  name: ${javascriptString(model.displayName)},
  version: extensionManifest.version,
  manifest: extensionManifest.adminModules?.[0],
  sections: [
    {
      id: overviewSectionId,
      label: "Overview",
      icon: null,
      group: "Extensions",
      order: 0
    }
  ],
  components: {
    [overviewSectionId]: ExtensionOverview
  },
  createPluginContext: (hostContext) => ({
    serverUrl: hostContext.cedrosLogin?.serverUrl ?? "",
    authenticated: hostContext.cedrosLogin?.authenticated,
    getAccessToken: hostContext.cedrosLogin?.getAccessToken ?? (() => null),
    hasPermission: (permission) =>
      hostContext.dashboardPermissions?.canAccess(permission) ?? false
  }),
  checkPermission: (permission, hostContext) =>
    hostContext.dashboardPermissions?.canAccess(permission) ?? false,
  cssNamespace: extensionManifest.extensionId
};

export function registerCedrosAdminSurface(): CedrosExtensionBootstrap {
  return {
    ...extensionBootstrap,
    modules: [adminModule]
  };
}

export default registerCedrosAdminSurface;

function ExtensionOverview() {
  return ${javascriptString(`${model.displayName} extension loaded from the ZIP-contained admin runtime.`)};
}
`;
}

function reactBootstrap() {
  return `import type { CedrosExtensionBootstrap } from "cedros:admin";

import { extensionManifest } from "./manifest";

export const extensionBootstrap: CedrosExtensionBootstrap = {
  manifest: extensionManifest
};
`;
}

function nativeBootstrap() {
  return reactBootstrap();
}

function manifestTs() {
  return `import type { CedrosExtensionManifest } from "cedros:admin";

import { generatedManifest } from "./generated-manifest";

export const extensionManifest: CedrosExtensionManifest = generatedManifest;
`;
}

function reactWebRegister() {
  return `import type { CedrosExtensionBootstrap } from "cedros:admin";

import { extensionBootstrap } from "../bootstrap";

export function registerCedrosWebSurface(): CedrosExtensionBootstrap {
  return extensionBootstrap;
}

export default registerCedrosWebSurface;
`;
}

function nativeRegister() {
  return `import type { CedrosExtensionBootstrap } from "cedros:admin";

import { extensionBootstrap } from "./bootstrap";

export function registerCedrosNativeSurface(): CedrosExtensionBootstrap {
  return extensionBootstrap;
}

export default registerCedrosNativeSurface;
`;
}

function runtimeTypes(member) {
  return readFileSync(new URL(`../templates/authoring/${member}-cedros-admin-runtime.d.ts`, import.meta.url), "utf8");
}

function tsconfig() {
  return json({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      strict: true,
      declaration: true,
      outDir: "./dist",
      rootDir: "./src",
      resolveJsonModule: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    include: ["src/**/*"],
  });
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
