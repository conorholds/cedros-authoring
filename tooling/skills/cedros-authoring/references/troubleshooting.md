# Troubleshooting

## Scaffold refuses the target

Use an empty directory or pass `--force` only after inspecting existing files. Filesystem roots are always rejected. Force overlays known scaffold files and does not delete unrelated files.

## Theme validation differs from a site

Check `contracts/theme-runtime.json`, the tarball SHA-256, and `package-lock.json` integrity. `make install THEME_RUNTIME_TARBALL=/path/to/cedros-theme-runtime-0.1.0.tgz` accepts an authorized local artifact if the private distribution endpoint fails; checksum mismatches must stop installation. Use Node >=24.17.0 <25. Do not substitute private @cedros/data-react source. The shared validator reports issue paths and compilation throws on invalid input. Verify the bundled guide with `node scripts/cedros-authoring.mjs unpack-theme`, then validate/import and preview through Appearance. Record local runtime version, exact package digest, and host reproduction separately; local package verification does not prove installed-site acceptance.

## Extension UI does not load

Run `make validate`, inspect compiled export paths inside the ZIP, and verify manifest identity/version/package registration equality. If a server surface is declared, ensure `cedros-extension.server.wasm` is present and implements matching WIT exports.

## Custom page is rejected

Run `make validate`. Check normalized route/title metadata, allowed imports, native primitives, exactly one Markdown H1, a 50–320 character lede, complete fallback content, and the 100,000-character limits.

## Live operation is unavailable

Refresh `/skill.md`, initialize `/mcp`, inspect `resources/list`, and confirm the caller's permissions and installed dependencies. Missing identity, permission, dependency, target, preview, or required confirmation is a blocker—not a reason to invent an endpoint or bypass validation.
