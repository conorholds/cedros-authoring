# Portable themes

A Cedros theme is a `cedros-theme` manifest inside a `cedros-theme-library-package` envelope. It changes presentation only: brand metadata, complete light/dark tokens, shell chrome, nine route surfaces, and sixteen core block variants.

Do not add React, routes, business logic, scripts, external stylesheets, or `customCss` to the routine-safe path. Use only catalogued block variant values because unregistered values have no kernel styling.

The scaffold uses private `@cedros/theme-runtime@0.1.0` for shared validation and compilation, plus its `/preview` DocArticle/BlogPost templates and `/styles.css`. This independent artifact supplements the unchanged 0.1.98 kits. `make install` verifies SHA-256 and lockfile integrity before installing; supply `THEME_RUNTIME_TARBALL=/path/to/cedros-theme-runtime-0.1.0.tgz` for an authorized local copy. The pinned export/checksum manifest is `contracts/theme-runtime.json`. Keep the artifact under ignored `.theme-runtime/`; do not embed, republish, or redistribute it or private host source. Retain third-party notices.

Validators return issue arrays; compilation throws on invalid manifests. The root validator needs no React runtime. Previews need React/React DOM 18 or 19; the scaffold pins 19. Use Node >=24.17.0 <25, whose SSR export selects the matching bundle automatically. Browser bundlers must externalize optional feature peers and their subpaths listed in the runtime manifest. Private `@cedros/data-react` remains unsupported as an external dependency.

Run `node scripts/cedros-authoring.mjs unpack-theme` to verify the immutable kit's archive, manifest, content-set, and file hashes and read its version-matched guide under `archive/cedros-authoring/cedros-theme-authoring-kit/docs/theme-authoring/`.

Keep `src/theme.mjs`, `brand-kit.md`, and `block-variant-map.md` aligned. Run shared validation, build the light/dark SSR previews, package, and test. Local package verification remains distinct from installed-site acceptance. Validate/import the `cedros-theme-library-package` JSON through Appearance without applying it, then preview real home/docs/blog/authored-page surfaces at responsive widths and in both color modes. Check relevant extension blocks and interactions. Apply only with explicit intent and retain the prior theme for rollback. Host validation remains authoritative.
