declare module "cedros:admin" {
  export interface AdminSectionNavigationManifest {
    id: string;
    label: string;
    group: string;
    order: number;
  }

  export interface AdminModuleManifest {
    moduleId: string;
    extensionId: string;
    displayName: string;
    version: string;
    packageName: string;
    navigation?: {
      sections: AdminSectionNavigationManifest[];
      groups?: Array<{ id: string; label: string; order: number }>;
    };
    [key: string]: unknown;
  }

  export interface CedrosExtensionManifest {
    schemaVersion: number;
    extensionId: string;
    displayName: string;
    version: string;
    packageFamily: {
      react: { packageName: string };
      reactNative: { packageName: string };
      server: { packageName: string };
    };
    adminModules?: AdminModuleManifest[];
    [key: string]: unknown;
  }

  export interface CedrosExtensionBootstrap {
    manifest: CedrosExtensionManifest;
    [key: string]: unknown;
  }
}
