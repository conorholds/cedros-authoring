# __CEDROS_PAGE_LABEL__

A custom page for your Cedros website. Add it through Page Builder and publish it when you're ready.

Use this project for a landing page, guide, comparison, or other experience with its own layout. Edit the page files below, check your changes, then add them through Page Builder.

Requires Node.js 24.17.x, npm 11.13.0, and `make`.

## Deliverables

- `page.json`: route, title, label, and declarative SEO intent.
- `page.tsx`: the page visitors see in a web browser.
- `page.native.tsx`: the matching React Native experience.
- `page.md`: a readable text version of the same content.

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

## Add the page to your site

Use Page Builder's existing blocks or shared layouts when they fit your design. For this custom page, create or open the destination page and add a **Raw Code** block, Cedros's block for custom page code.

The ZIP collects your source for handoff. Cedros does not automatically import this directory or ZIP, or read `page.json`.

| File | Destination |
|---|---|
| `page.json` | Route/title metadata for the person or agent performing the import |
| `page.tsx` | Registered Raw Code block's `reactCode` |
| `page.native.tsx` | Raw Code block's `reactNativeCode` |
| `page.md` | Raw Code block's `markdownCode` |

Updating the React code requires administrator access. Preview the page on desktop and mobile, check its links and actions, and review light and dark modes before publishing.

### Working with an assistant

An assistant can insert or update the registered `raw-code` block with `cedros.page_builder.document.apply_ops`, using the live schema and revision checks. Then run `cedros.page_builder.document.validate`, `cedros.page_builder.preview.refresh`, and `cedros.page_builder.release.readiness` and inspect the saved preview. Save a draft before a separately authorized publication.

Before authoring against a site, read `<site-origin>/skill.md`. Use `<site-origin>/page-docs/index.json` for the current page-builder guide and authenticated `<site-origin>/mcp` tools for exact live operations.
