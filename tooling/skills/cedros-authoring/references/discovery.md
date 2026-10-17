# Live site discovery

Use site-relative URLs; replace `<site-origin>` with the target Cedros site's origin.

Recommended order:

1. `<site-origin>/skill.md` — canonical overview, rules, and published skills.
2. `<site-origin>/skill.json` — select the task mode and its ordered/conditional version-matched references before authoring.
3. `<site-origin>/skills/<skill-id>.md` — narrow capability documentation.
4. `<site-origin>/mcp` — authenticated MCP initialization and live tool schemas.
5. MCP `resources/list` — session-specific navigation and permission scope.
6. `<site-origin>/page-docs/index.json` — page-guide index; load one section and exact guide.
7. `<site-origin>/.well-known/mcp-lite.json` — compact unauthenticated tool orientation.
8. `<site-origin>/.well-known/ai-discovery.json` — discovery index.
9. `<site-origin>/openapi.json` — lower-level direct HTTP contracts.
10. `<site-origin>/llms.txt`, `/llms-full.txt`, `/llms-admin.txt`, and `/agent.md` — supporting agent context.

Read before write. Prefer drafts and previews. Publishing, sending, deletion, migration, domain changes, and extension execution require explicit intent plus the exact live confirmation contract. Never place API keys or tokens in authored files or command output.
