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
cedros-authoring init page ./my-page --route /my-page
cedros-authoring init theme ./my-theme --id my-theme
cedros-authoring init extension ./my-extension --server rust
```

Every generated workspace owns its validation and packaging loop. Read its `AGENTS.md`, edit the canonical source, and run the Make targets before handoff.

The package is useful offline against the pinned 0.1.98 baseline. Extensions use the bundled canonical verifier; themes use the separately acquired, checksum-pinned private @cedros/theme-runtime@0.1.0 validator/compiler and shared previews. Installed-site validation and acceptance still happen through Appearance. A target Cedros site's discovery endpoints remain authoritative for installed features, permissions, page guides, and operational schemas.
