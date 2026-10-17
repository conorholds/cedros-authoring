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
    modules?: AdminModule[];
    [key: string]: unknown;
  }

  export interface HostContext {
    cedrosLogin?: {
      serverUrl?: string;
      authenticated?: boolean;
      getAccessToken?: () => string | null;
    };
    dashboardPermissions?: {
      canAccess: (permission: string) => boolean;
    };
  }

  export interface PluginContext {
    serverUrl: string;
    authenticated?: boolean;
    getAccessToken: () => string | null;
    hasPermission: (permission: string) => boolean;
  }

  export interface AdminSectionConfig extends AdminSectionNavigationManifest {
    icon: unknown;
  }

  export interface AdminModule {
    id: string;
    name: string;
    version: string;
    manifest?: AdminModuleManifest;
    sections: AdminSectionConfig[];
    components: Record<string, () => unknown>;
    createPluginContext: (hostContext: HostContext) => PluginContext;
    checkPermission: (permission: string, hostContext: HostContext) => boolean;
    cssNamespace: string;
  }

  export interface ToastAction {
    label: string;
    onClick: () => void;
  }

  export interface ToastOptions {
    action?: ToastAction;
    description?: string;
    duration?: number;
    id?: string;
  }

  export interface ToastApi {
    (message: string, options?: ToastOptions): string;
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
    warning: (message: string, options?: ToastOptions) => string;
    message: (message: string, options?: ToastOptions) => string;
    dismiss: (id?: string) => void;
  }

  export const toast: ToastApi;
}
