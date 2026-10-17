# Compatibility and advanced options

The starters target **Cedros 0.1.98**, manifest schema **1**, and platform API **1**. Use the documentation and integration contracts that match the site where you will install your work.

## Build tools

| Tool | Version or requirement |
| --- | --- |
| Node.js | `>=24.17.0 <25` |
| npm | `11.13.0` |
| `make` | Generated-project build commands |
| `unzip` | Versioned theme and extension authoring kits |
| Rust stable with `wasm32-wasip2` | Extensions created with `--server rust` |

Run `npm run help` in this repository for all generator options. For example:

```sh
npm run theme -- ../studio-theme --display-name "Studio Theme" --with-fonts
npm run extension -- ../booking --server rust --npm-scope @my-business
```

Use a new directory for each project. `--force` overlays known starter files in an existing directory, so inspect the target before using it. Generated projects are independent of this repository after creation.

## Versioned authoring kits

Theme and extension projects include their immutable 0.1.98 kit under `authoring/`. Archive, manifest, and file checksums are verified before extraction. Both kits identify source commit `66ae9f689dd09357e0b8e5ff211f885017a4cfa4`.

In an extension project, the wrapper runs the kit's canonical verifier:

```sh
node scripts/cedros-authoring.mjs validate --repo . --json
```

`make package` runs this check automatically. Keep `extension-context.json` current as you record project decisions and test evidence. The initial file marks installed-site checks as not yet run.

In a theme project, extract the complete guide with:

```sh
node scripts/cedros-authoring.mjs unpack-theme
```

## Theme runtime

Themes use the separately versioned private `@cedros/theme-runtime@0.1.0` for validation, compilation, and shared article/blog previews. `make install` downloads it and verifies SHA-256 and lockfile integrity before installation.

If you have an authorized local copy, use:

```sh
make install THEME_RUNTIME_TARBALL=/path/to/cedros-theme-runtime-0.1.0.tgz
```

The pinned SHA-256 is:

```text
444054b02a3601a67d11abae15c15e20705d18a3cc8affbf04a1d1d2009511c6
```

The project's `contracts/theme-runtime.json` records the package exports and checksums. The tarball stays in ignored `.theme-runtime/`; do not commit, embed, republish, or redistribute it or private host source. Preserve its included third-party notices.

Validation needs neither React nor React DOM at runtime. Previews support React/React DOM 18 or 19; the starter pins 19. Node selects the SSR bundle automatically. Browser bundlers must handle the optional peers listed in the runtime manifest. The private `@cedros/data-react` package is not a supported external dependency.

## Extension runtime

The kit pins `cedros:extension@0.1.0` WIT by its SHA-256, because revisions can share the same package version:

```text
2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9
```

Use the kit's frozen `cedros:admin` declarations. They include shared types and the `toast` value; other documented shim values need ambient declarations matching the runtime reference. Browser output must use ESM and only documented host imports.

Current-WIT guests are not guaranteed to run on older hosts. Confirm the destination site's supported contracts before installation.

[Back to Cedros Authoring](../README.md)
