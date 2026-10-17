# __CEDROS_PAGE_LABEL__

Cedros Raw Code source handoff for `__CEDROS_PAGE_ID__`, aligned with the 0.1.98 page-authoring convention.

Requires Node.js 24.17.x, npm 11.13.0, and `make`.

## Deliverables

- `page.json`: route, title, label, and declarative SEO intent.
- `page.tsx`: dependency-contained React web surface.
- `page.native.tsx`: React Native surface using native primitives.
- `page.md`: complete Markdown and agent fallback.

## Workflow

```sh
make install
make validate
make build
make package
make test
```

`make validate` checks metadata, source restrictions, and fallback content.
`make build` also type-checks the web and native components. `make package`
repeats the build gate and writes
`dist/__CEDROS_PAGE_ID__.cedros-page.zip`; the archive contains the four root
deliverables plus this README.

## Host handoff

For ordinary page work, discover published shared templates and registered blocks first. Bind a suitable layout with `cedros.page_builder.templates.bind`; a one-time starter copy does not preserve that shared relationship. Use this source scaffold for bespoke Raw Code work.

The ZIP is a convenient source archive. The host does not ingest this directory or ZIP as a portable page package and does not automatically read `page.json`.

| File | Destination |
|---|---|
| `page.json` | Route/title metadata for the person or agent performing the import |
| `page.tsx` | Registered Raw Code block's `reactCode` |
| `page.native.tsx` | Raw Code block's `reactNativeCode` |
| `page.md` | Raw Code block's `markdownCode` |

Create or open a page, then insert/update its registered `raw-code` block through Page Builder or `cedros.page_builder.document.apply_ops` using the live schema and revision checks. React Raw Code changes require administrator authority. Run `cedros.page_builder.document.validate`, `cedros.page_builder.preview.refresh`, and `cedros.page_builder.release.readiness`; inspect the saved preview on desktop/mobile and in light/dark modes. Publication is a separate authorized action.

Before authoring against a site, read `<site-origin>/skill.md`. Use `<site-origin>/page-docs/index.json` for the current page-builder guide and authenticated `<site-origin>/mcp` tools for exact live operations.
