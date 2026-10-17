# Create a custom theme

A theme gives your Cedros website a consistent visual identity. Use one to set your brand colors, typography, navigation, and styling across content pages, articles, and other supported areas of the site.

Themes are for presentation. For a unique layout on one page, start with a [custom page](pages.md). For features such as bookings, accounts, or integrations, build an [extension](extensions.md).

## Create your project

From the Cedros Authoring repository:

```sh
npm run theme -- ../my-theme
cd ../my-theme
make install
```

Installation downloads and verifies the supported theme runtime and installs the project's locked dependencies. The runtime is a separate private Cedros artifact; its use and redistribution terms are described in [compatibility](compatibility.md#theme-runtime).

## Make it yours

Edit `src/theme.mjs` to change the theme's name, colors, typography, and supported layout choices. Both light and dark palettes should be complete and readable. Use `brand-kit.md` to record your brand choices and `block-variant-map.md` to see the available block styles.

Generate local previews:

```sh
make build
```

Open `.theme-review/index.html` for the article preview and `.theme-review/blog.html` for the blog preview. Use the appearance controls to compare light and dark modes. These previews use Cedros's shared templates; review the theme on your actual site before applying it.

## Check and package

```sh
make test
make package
```

Your outputs are in `dist/`:

- `my-theme-1.0.0/manifest.json` for your site's theme library.
- `my-theme-1.0.0.zip` for a Theme Manager installation workflow, including bundled assets.

To include fonts, create the starter with `--with-fonts` and follow `fonts/README.md`. A JSON import cannot carry font files; use system fonts or fonts available at URLs on your site for that path.

## Try it on your site

Open **Appearance** in your Cedros site and import the generated JSON into the theme library. Preview representative pages at desktop and mobile widths, check both color modes, and review navigation, text contrast, and any extension content your site uses.

Importing a theme and applying it are separate steps. Keep the current theme available, then apply your new theme when you're satisfied with the preview.

[Back to Cedros Authoring](../README.md)
