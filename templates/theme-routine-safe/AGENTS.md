# Cedros Theme Authoring Instructions

This workspace authors the routine-safe portable theme `__CEDROS_THEME_ID__`.
These instructions apply to this generated project. Start with `README.md` and `src/theme.mjs`; this file grants no permission to apply or publish a theme on a connected site.

- Edit `src/theme.mjs`; keep the theme declarative and presentation-only.
- Do not add React components, custom CSS, scripts, external stylesheets, routes, or behavior.
- Keep the light and dark palettes complete and maintain accessible contrast.
- Use only the catalogued block variants documented in `block-variant-map.md`.
- Keep `brand-kit.md` and the manifest `brandKit` mutually consistent.
- Run `make validate`, `make build`, `make package`, and `make test` before handoff.
- Use the pinned private @cedros/theme-runtime@0.1.0 validator/compiler and shared docs/blog previews with styles.css. Local package verification remains separate from installed-site acceptance.
- Read the pinned 0.1.98 guide with `node scripts/cedros-authoring.mjs unpack-theme`. The independently versioned runtime supplements these unchanged kits. Verify the tarball before installation; keep its lockfile integrity pinned and the artifact ignored under .theme-runtime/. Never embed, republish, or redistribute the private runtime or host source.
- Validate/import through Appearance without applying; review real pages at responsive widths and in both color modes before a separately authorized apply action.
- Read the target site's `/skill.md` for current capabilities and use its authenticated `/mcp` registry for operational actions.
