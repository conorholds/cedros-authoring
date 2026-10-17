# Custom pages

Start ordinary page work by discovering published shared templates and registered Page Builder blocks. Bind a reusable layout through `cedros.page_builder.templates.bind`; a starter is a one-time independent copy, whereas binding keeps each page linked to its shared design.

For bespoke site-owned Raw Code authoring, this scaffold provides four aligned source handoff files:

- `page.json`: normalized route, title, label, and declarative SEO intent.
- `page.tsx`: no-props React web component importing only `react`.
- `page.native.tsx`: matching React Native component importing only `react` and `react-native`.
- `page.md`: complete Markdown content for agents and non-executing clients.

Keep every surface under 100,000 characters. Do not use external packages, DOM elements in native code, secrets, ambient browser storage, analytics beacons, `eval`, or undisclosed endpoints. Make important content and calls to action available in all three representations.

Use normalized lowercase routes without parameters. SEO indexability is either `publication-controlled` or `never`; source files do not make a route public by themselves. Core owns canonical URLs, robots, hreflang, sitemap, and structured-data composition. The bundled Core schema-type snapshot is versioned and host validation remains authoritative.

Before handoff, run `make validate`, `make package`, and `make test`. The ZIP is a source archive, not a portable page package: the host does not ingest the folder or read `page.json` automatically. Use its route/title metadata when creating or opening the target page; map `page.tsx`, `page.native.tsx`, and `page.md` into the registered Raw Code block's `reactCode`, `reactNativeCode`, and `markdownCode`.

On the target site, load `/page-docs/index.json` and the narrowest relevant guide. Discover the live schemas before using Page Builder or `cedros.page_builder.document.apply_ops`, preserving revision checks and existing content. React Raw Code edits require administrator authority. Run `cedros.page_builder.document.validate`, `cedros.page_builder.preview.refresh`, and `cedros.page_builder.release.readiness`, then inspect the saved preview. Publication remains separate from a source handoff or draft update.
