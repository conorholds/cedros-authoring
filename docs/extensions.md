# Build a custom extension

An extension adds functionality to a Cedros website. Use one for a booking process, a customer workflow, a business integration, or a feature you want to reuse across pages or sites.

Extensions can provide admin tools, website components, native components, and server behavior. They declare the capabilities they need so Cedros can manage access. For visual changes alone, start with a [theme](themes.md); for a one-page experience, consider a [custom page](pages.md).

## Create your project

From the Cedros Authoring repository:

```sh
npm run extension -- ../my-extension
cd ../my-extension
make install
```

The default project includes a working admin module. It needs Node.js, npm, `make`, and `unzip`.

If your feature needs server routes or scheduled work, use this creation command instead, from the Cedros Authoring repository:

```sh
npm run extension -- ../my-extension --server rust
```

That option includes a working status route and its tests. Install Rust stable and its `wasm32-wasip2` target before building:

```sh
rustup target add wasm32-wasip2
```

## Make it yours

| Path | Purpose |
| --- | --- |
| `cedros-extension.manifest.json` | Your extension's identity, version, and declared capabilities |
| `packages/react/src/` | Admin and website registration and UI |
| `packages/react-native/src/` | Native registration |
| `packages/server/src/` | Server implementation when you select the Rust backend |

Keep the manifest and package versions aligned. The generated README explains the build commands, registration files, and supported host imports.

## Build on existing Cedros functionality

For customer accounts, use the published [Cedros Login](https://github.com/conorholds/cedros-login) integration contracts. For checkout, subscriptions, or payment-linked access, use [Cedros Pay](https://github.com/conorholds/cedros-pay). For example, a membership extension can use Login for identity and Pay for subscription access while owning the member experience.

Start at [cedros.ai/skill.md](https://cedros.ai/skill.md), follow Extension Authoring, and find the official integration and composability guidance for the extensions you need. Use contracts that match your target site's version.

## Check and package

```sh
make test
make package
```

The result is `dist/my-extension-1.0.0.cedros-extension.zip`. Packaging builds the selected runtimes and runs Cedros's version-matched checks.

## Install and review

Upload the ZIP through your site's **Extensions** settings, review its capabilities, and verify the installed feature with the permissions and integrations it needs. Check the admin UI and any website or native surfaces you changed.

Test on a development site before installing on a live business site. A successful local build checks the package; the installed site confirms that the feature works with its real configuration.

[Back to Cedros Authoring](../README.md)
