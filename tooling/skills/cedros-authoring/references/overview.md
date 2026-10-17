# Cedros authoring overview

## Decision table

| Need | Surface | Boundary |
|---|---|---|
| Ordinary page or repeated page family | Page Builder/shared template | Discover registered blocks and published layouts before bespoke code |
| Bespoke Raw Code for one site-owned route | Page source scaffold | Four-file source handoff only |
| Site-wide visual system | Theme | Declarative presentation only |
| Reusable or installable behavior | Extension | Reviewed package family and explicit capabilities |

Do not use a theme for behavior, a page for reusable privileged integration, or an extension when ordinary authored content is sufficient.

## Stable workflow

```sh
npm run page -- ../my-page
npm run theme -- ../my-theme
npm run extension -- ../my-extension
```

Every generated workspace owns its validation and packaging loop. Read its `AGENTS.md`, edit the canonical source, and run the Make targets before handoff.

Run these commands from the kit checkout. Extensions default to UI-only; add `--server rust` when the feature needs a Rust/Wasm backend. An installed CLI also supports `cedros-authoring init <kind> <target>`.

After installing dependencies, local authoring and checks are available offline against the pinned 0.1.98 baseline. Extensions use the bundled canonical verifier; themes use the separately acquired, checksum-pinned private @cedros/theme-runtime@0.1.0 validator/compiler and shared previews. Review pages in Page Builder, themes in Appearance, and extensions through their installed site features. A target Cedros site's discovery endpoints remain authoritative for installed features, permissions, page guides, and operational schemas.
