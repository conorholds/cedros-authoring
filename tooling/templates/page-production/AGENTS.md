# Cedros Custom-Page Authoring Instructions

These instructions are for this generated page project. Start with `README.md` and `page.json`; the supported authoring baseline is Cedros 0.1.98. This file grants no permission to change a connected site.

- Prefer published shared-template bindings and registered blocks for ordinary or reusable page layouts. A starter copy is independent; a binding remains linked.
- These four files are a source handoff convention, not a portable host-ingested page package. The host does not read `page.json` automatically.
- Keep `page.json`, `page.tsx`, `page.native.tsx`, and `page.md` semantically aligned.
- Web code may import only `react`; native code may import only `react` and `react-native`.
- Keep each surface below 100,000 characters and self-contained.
- Use accessible controls, responsive layout, host theme variables, and no secrets, analytics beacons, `eval`, or undisclosed endpoints.
- Treat `page.md` as complete production content, not a stub.
- Read the target site's `/skill.md` and exact page guide before importing; use authenticated `/mcp` tools for live changes.
- Map TSX/native/Markdown into the registered Raw Code block's `reactCode`, `reactNativeCode`, and `markdownCode`. React edits require administrator authority. Use live apply-ops schemas and revision checks, then document validation, preview refresh, and release readiness before separate publication.
- Run `make validate`, `make package`, and `make test` before handoff.
