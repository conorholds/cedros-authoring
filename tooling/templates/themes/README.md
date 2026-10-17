# __CEDROS_THEME_DISPLAY_NAME__

A custom theme for your Cedros website. Use it to bring your colors, typography, navigation, and page styling together across the site.

Requires Node.js 24.17.x, npm 11.13.0, `make`, and `unzip`.

## Make it yours

| File | What to edit |
| --- | --- |
| `src/theme.mjs` | Theme name, colors, typography, and supported layout choices |
| `brand-kit.md` | The brand choices that should stay consistent with your theme |
| `block-variant-map.md` | A reference for available block styles |

Keep both light and dark palettes complete and readable. Themes control presentation; use a custom extension for new functionality or integrations.

## Preview your changes

```sh
make install
make build
```

Installation downloads and verifies the supported theme runtime and installs the locked dependencies. The build creates two local previews:

- `.theme-review/index.html`: an article page.
- `.theme-review/blog.html`: a blog post.

Open them in your browser and use the appearance controls to compare light and dark modes. Re-run `make build` after editing the theme. These previews use Cedros's shared templates; review your actual site before applying the theme.

## Check and package

```sh
make test
make package
```

The package includes:

- `dist/__CEDROS_THEME_ID__-__CEDROS_THEME_VERSION__/manifest.json`
- `dist/__CEDROS_THEME_ID__-__CEDROS_THEME_VERSION__.zip`
- `dist/__CEDROS_THEME_ID__-__CEDROS_THEME_VERSION__.zip.sha256`

Run `make validate` for a quick check after an edit, or `make review` to validate and refresh the previews.

## Add it to your site

In **Appearance**, import the generated JSON into your theme library. Preview representative pages at desktop and mobile widths, check navigation and text contrast, and review both color modes and any extension content your site uses.

Importing and applying are separate steps. Keep the current theme available for rollback, then apply your theme when you're satisfied with the previews.

The ZIP is for a Cedros Theme Manager installation workflow and can carry bundled fonts. JSON imports cannot carry font binaries: use system fonts, site-uploaded fonts, or absolute/root-relative font URLs for Appearance. Package-relative `./fonts/…` sources require ZIP installation. If you created this project with `--with-fonts`, follow `fonts/README.md` to add font files. Missing referenced files stop the build; site intake also checks font binary signatures.

## Runtime and compatibility

This project targets Cedros 0.1.98 and uses the independently versioned private `@cedros/theme-runtime@0.1.0`. The installer verifies its SHA-256 and committed lockfile integrity before running `npm ci --ignore-scripts --omit=peer`:

```text
444054b02a3601a67d11abae15c15e20705d18a3cc8affbf04a1d1d2009511c6
```

If you have an authorized local copy, install it with:

```sh
make install THEME_RUNTIME_TARBALL=/path/to/cedros-theme-runtime-0.1.0.tgz
```

Keep `package-lock.json` committed. The private tarball stays in ignored `.theme-runtime/`; do not embed, commit, republish, or redistribute it, the installed runtime, or private host source. Preserve included third-party notices.

`contracts/theme-runtime.json` pins the runtime's exports and integrity. Validation delegates the inner manifest to `validateCedrosRoutineThemeManifest` and `compileCedrosRoutineThemeManifest`; validators return issue arrays and compilation throws on invalid input. The starter also checks portable brand metadata, reserved IDs, and styled block choices. Themes stay declarative: supported tokens, shell, route surfaces, block variants, brand metadata, and assets. React components, custom CSS, scripts, and external stylesheets do not belong in the theme manifest.

Validation needs neither React nor React DOM at runtime. Shared previews use `DocArticleTemplate`, `BlogPostTemplate`, and `styles.css`; they support React/React DOM 18 or 19 and this project pins 19. Node `>=24.17.0 <25` selects the SSR bundle. Appearance controls work without hydration; other React interactions need site review. A browser bundler must externalize the optional feature peers and subpaths listed in the runtime manifest.

To read the complete versioned theme guide, run:

```sh
node scripts/cedros-authoring.mjs unpack-theme
```

The verified guide is extracted under ignored `archive/cedros-authoring/`; start with `docs/theme-authoring/12-validation-review-and-distribution.md`. Before using site tools, read the site's `/skill.md` and current authenticated `/mcp` schemas. Local checks validate your package; the destination site validates import and confirms how the theme works with its content and configuration.
