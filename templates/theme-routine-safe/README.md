# __CEDROS_THEME_DISPLAY_NAME__

Routine-safe, portable Cedros theme authoring workspace for `__CEDROS_THEME_ID__`.

Requires Node.js 24.17.x, npm 11.13.0, and `make`.

## Workflow

```sh
make install
make validate
make build
make package
make test
```

`make install` verifies the private `@cedros/theme-runtime@0.1.0` tarball before
`npm ci --ignore-scripts --omit=peer`. Its SHA-256 is
`444054b02a3601a67d11abae15c15e20705d18a3cc8affbf04a1d1d2009511c6`;
`contracts/theme-runtime.json` pins its export manifest and SHA-512 lockfile integrity.
It supplements the unchanged Cedros 0.1.98 documentation kits.

If the distribution endpoint is unavailable, supply your authorized artifact:

```sh
make install THEME_RUNTIME_TARBALL=/path/to/cedros-theme-runtime-0.1.0.tgz
```

The verified tarball is retained under ignored `.theme-runtime/` for repeat installs.
Keep `package-lock.json` committed. Do not embed, commit, republish, or redistribute
the private tarball, installed runtime, or private host source. Preserve included
third-party notices and their licenses.

`make validate` checks the package envelope and delegates the inner manifest to
`validateCedrosRoutineThemeManifest` and `compileCedrosRoutineThemeManifest` from
`@cedros/theme-runtime`. Validators return issue arrays with paths; compilation
throws on invalid input. Node color validation rejects invalid syntax offline.
The root validator requires neither React nor React DOM at runtime.

`make build` renders the shared `DocArticleTemplate` and `BlogPostTemplate` from
`@cedros/theme-runtime/preview` with its exported `styles.css`, writing docs
and blog reviews to `.theme-review/index.html` and `.theme-review/blog.html`.
Use the shared footer controls to select light, dark, or system appearance.
Bundled fonts are copied from `fonts/` into both review and ZIP outputs; missing
package-relative font sources fail with their token path.
Preview requires React/React DOM 18 or 19; this project pins 19. Node >=24.17.0 <25
selects the matching SSR bundle automatically. The shared color controls work
without hydration; React interactions still require installed-host acceptance.
For a browser-bundled preview,
externalize every optional feature peer listed in `contracts/theme-runtime.json`
(exact package name and subpaths); follow the artifact's consumption instructions.

Run `node scripts/cedros-authoring.mjs unpack-theme` to verify and extract the
pinned immutable kit from `authoring/` into ignored `archive/cedros-authoring/`.
Read its `docs/theme-authoring/12-validation-review-and-distribution.md`.

`make package` writes:

- `dist/__CEDROS_THEME_ID__-__CEDROS_THEME_VERSION__/manifest.json`
- `dist/__CEDROS_THEME_ID__-__CEDROS_THEME_VERSION__.zip`
- `dist/__CEDROS_THEME_ID__-__CEDROS_THEME_VERSION__.zip.sha256`

## Authoring Rules

- Edit `src/theme.mjs`.
- Keep `brand-kit.md` and `block-variant-map.md` aligned with it.
- Keep the theme declarative: tokens, shell, route surfaces, block variants,
  brand kit, and package-safe assets only.
- Do not add React components, custom CSS, scripts, or external stylesheets to
  the theme manifest.
- Use `make validate` after every change.
- Use `make review` to validate and refresh `.theme-review/index.html` directly;
  `make build` runs the named validation target before the same review step.
- Before installation, read the target site's `/skill.md`; use `/mcp` for live
  site operations and exact schemas.

Shared validation covers the routine-safe manifest. The starter also checks
portable brand metadata, reserved IDs, and styled block catalog values. Site
intake separately validates the portable envelope, brand kit, reserved identifiers,
and packaged assets against the current host. Local package verification does not establish
installed-site acceptance. Check real home/docs/blog/authored-page surfaces,
responsive widths, both color modes, interactions, and applicable extension blocks.
Importing into a library and applying the theme are separate actions; retain the
prior theme for rollback and apply only with explicit intent.

## Import

Upload `dist/__CEDROS_THEME_ID__-__CEDROS_THEME_VERSION__/manifest.json` to a
site owner theme library, or upload the ZIP to a Cedros Theme Manager
marketplace flow. JSON imports cannot carry font binaries: use system fonts,
site-uploaded fonts, or absolute/root-relative font URLs for Appearance. Bundled
`./fonts/…` sources require the ZIP installation path. Host intake separately
checks font binary signatures.
