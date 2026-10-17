# Cedros Authoring

Versioned scaffolds and progressive agent guidance for Cedros Raw Code page source handoffs, portable themes, and package-family extensions. The supported authoring baseline is Cedros **0.1.98**, platform API **1**.

## Requirements

- Node.js 24.17.x (the supported range is `>=24.17.0 <25`)
- npm 11.13.0
- `make`
- `unzip` for the pinned authoring kits and canonical extension verifier
- Rust stable with the `wasm32-wasip2` target for extensions created with `--server rust`

## Start a workspace from source

Run the CLI directly from a repository checkout:

```sh
git clone https://github.com/conorholds/cedros-authoring.git
cd cedros-authoring

node ./bin/cedros-authoring.mjs init page ./my-page --route /my-page

node ./bin/cedros-authoring.mjs init theme ./my-theme \
  --id my-theme --display-name "My Theme"

node ./bin/cedros-authoring.mjs init extension ./my-extension

# Optional executable Rust/Wasm backend with a status route:
node ./bin/cedros-authoring.mjs init extension ./my-backend --server rust
```

If the package is already installed in another project, use
`npm exec -- cedros-authoring` in place of `node ./bin/cedros-authoring.mjs`.

Every generated project is independently usable. Run `make help` inside it for
the exact commands; the common workflow is:

```sh
make install
make validate
make build
make package
make test
```

`make build` type-checks pages, renders a theme review, or compiles extension UI
packages, depending on the scaffold. Extension workspaces also provide
`make build-server` to build the selected Rust backend separately. The default
`--server none` path is UI-only. With `--server rust`, the normal build/package
loop also compiles a locked Wasm component exporting a status route; `make test`
runs its Rust happy-path and rejection tests. The component uses the exact
canonical WIT plus a narrow route-only world, with no privileged host imports.

Use `--force` only to overlay an inspected non-empty target. Filesystem roots are always rejected and unrelated files are preserved.

## Choose the right surface

| Goal | Scaffold |
|---|---|
| Bespoke Raw Code source for one site-owned route, with web/native/Markdown parity | `init page` |
| Site-wide presentation, tokens, chrome, route surfaces, and block variants | `init theme` |
| Installable behavior, data, routes, jobs, admin UI, blocks, or integrations | `init extension` |

For ordinary pages, inspect published shared templates and registered Page Builder blocks first. A starter is a one-time copy; a shared-template binding keeps pages linked to a reusable layout. The page scaffold and its ZIP are a source handoff convention, not a host-ingested portable page package.

Themes use the independently versioned private `@cedros/theme-runtime@0.1.0` for shared validation, compilation, and DocArticle/BlogPost previews. This supplements the unchanged 0.1.98 kits. `make install` verifies the downloaded tarball against `contracts/theme-runtime.json` and the committed lockfile before `npm ci`. To use an authorized local artifact:

```sh
make install THEME_RUNTIME_TARBALL=/path/to/cedros-theme-runtime-0.1.0.tgz
```

The pinned SHA-256 is `444054b02a3601a67d11abae15c15e20705d18a3cc8affbf04a1d1d2009511c6`. The private tarball stays under ignored `.theme-runtime/`; do not commit, embed, republish, or redistribute it or private host source. Retain its third-party notices. Validation needs no React at runtime; the generated previews pin React/React DOM 19 and require Node >=24.17.0 <25. Local package verification remains separate from installed-site acceptance: validate/import the portable JSON through Appearance and review real host previews before release.

Generated extension and theme workspaces include their exact immutable 0.1.98 kit ZIP and checksum metadata under `authoring/`. Both kits identify source commit `66ae9f689dd09357e0b8e5ff211f885017a4cfa4`. Their archive, `AUTHORING-KIT.json`, and extracted-file hashes are checked before use. Extraction goes under ignored `archive/cedros-authoring/`.

Inside an extension workspace:

```sh
node scripts/cedros-authoring.mjs resolve-path --repo . --mode create-extension --json
node scripts/cedros-authoring.mjs validate --repo . --json
```

The wrapper runs the kit's unmodified canonical verifier. `make validate` checks the schema, context, and runtime alignment; `make package` also validates the final ZIP and documentation. Maintain `extension-context.json` as decisions and evidence change. Its initial host evidence is explicitly unverified. Browser runtimes use ESM and documented host imports such as `cedros:admin`; the frozen declarations expose shared types and only the `toast` value. Other documented values need ambient augmentation. Current-WIT guests are not guaranteed to run on older hosts.

Inside a theme workspace, `node scripts/cedros-authoring.mjs unpack-theme` verifies and extracts the complete guide. The starter kit distributes only the private runtime reference, export manifest, checksums, and lockfile; acquiring the runtime is a separate authorized installation.

## Authoring guidance

The kit includes an optional `cedros-authoring` skill tailored to these scaffolds
at `skills/cedros-authoring/SKILL.md`, plus project-specific `AGENTS.md`
instructions in generated workspaces. Both follow the CLI and `make` workflows
documented here. Read the references directly:

```sh
node ./bin/cedros-authoring.mjs reference list
node ./bin/cedros-authoring.mjs reference overview
node ./bin/cedros-authoring.mjs reference discovery
```

When a target site is known, start with `<site-origin>/skill.md`, then use its authenticated `/mcp` registry for current permissions and exact operational schemas. Bundled references remain available offline.

## License

Cedros Authoring is source-available, not open source: its redistribution restrictions do not meet the Open Source Definition.

Licensed under PILL-1.0.0 — the Personal and Internal Limited License. Free for personal and internal business use. Private modifications and limited repository forks are permitted. Redistribution, resale and offering the software as a service require separate permission. See [LICENSE.md](LICENSE.md).

For SPDX-style source-file headers, use `SPDX-License-Identifier: LicenseRef-PILL-1.0.0`. The `LicenseRef-` prefix identifies a custom license rather than claiming an official SPDX-listed identifier.
