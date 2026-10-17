export function manifestFor(model) {
  return {
    schemaVersion: 1,
    extensionId: model.extensionId,
    displayName: model.displayName,
    version: model.version,
    description: `Minimal Cedros extension scaffold for ${model.displayName}.`,
    platformApiVersion: "1",
    compatibility: {
      platformApiVersion: "1",
      minCedrosDataVersion: "0.1.98",
      witChecksum: "2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9",
    },
    packageFamily: {
      server: packageMember(model.serverPackageName, model.version),
      react: packageMember(model.reactPackageName, model.version),
      reactNative: packageMember(model.nativePackageName, model.version),
    },
    surfaces: {
      server: { packageRef: "server", required: true, ...(model.server === "rust" ? { routes: [`${model.extensionId}:status`] } : {}) },
      admin: {
        packageRef: "react",
        required: true,
        moduleIds: [model.adminModuleId],
      },
      web: { packageRef: "react", required: true },
      native: { packageRef: "reactNative", required: true },
    },
    registration: {
      server: {
        entrypoint: `${model.serverLibName}::register_extension_family`,
      },
      admin: {
        entrypoint: `${model.reactPackageName}/admin/register`,
      },
      web: {
        entrypoint: `${model.reactPackageName}/web/register`,
      },
      native: {
        entrypoint: `${model.nativePackageName}/register`,
      },
    },
    adminModules: [
      {
        moduleId: model.adminModuleId,
        extensionId: model.extensionId,
        displayName: model.displayName,
        version: model.version,
        packageName: model.reactPackageName,
        sectionIds: [model.overviewSectionId],
        sectionIcons: {
          [model.overviewSectionId]: "extensions",
        },
      },
    ],
  };
}

function packageMember(packageName, version) {
  return {
    packageName,
    version,
    required: true,
  };
}
