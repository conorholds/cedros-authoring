# Extensions

One Cedros extension is one stable `extensionId`, one canonical manifest, and one reviewed package family:

- Rust/Wasm server package and vendored WIT.
- React package for admin and public web registration.
- React Native package.
- Compiled runtime and canonical manifest/bootstrap files in the ZIP.

The default starter (`--server none`) is UI-only and executable without private SDK packages. Choose `--server rust` for a runnable, locked Rust/Wasm status-route component; the normal build/package loop compiles and includes it, and `make test` runs its route acceptance/rejection tests. The component imports no privileged host capability and uses the unmodified canonical WIT with a narrow route-only world. Add server routes, jobs, data access, settings, providers, AI capabilities, or other permissions only when the feature needs them. Manifest declarations do not create runtime behavior: declared ids must match compiled exports and installed host seams.

Keep identity, version, package names, registration exports, and admin module metadata aligned. Fail closed when authentication, permissions, providers, secrets, or host capabilities are unavailable. Never include credentials or unnecessary personal data in manifests, archives, logs, analytics, or starter content.

Read the target site's `/skill.md` before designing capabilities and use authenticated `/mcp` schemas as the exact operational contract. Run the generated install, validate, package, and test loop before upload.

The supported baseline is the immutable 0.1.98 kit, platform API 1, with source commit `66ae9f689dd09357e0b8e5ff211f885017a4cfa4`. Its WIT is `cedros:extension@0.1.0`, pinned by SHA-256 `2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9`; the package version alone does not distinguish WIT revisions. Current-WIT guests are not guaranteed to run on older hosts.

Use `node scripts/cedros-authoring.mjs resolve-path --repo . --mode <mode> --json` for the kit's task-specific reading path. Update the shared `extension-context.json` at task boundaries without discarding unresolved questions, conflicts, or evidence. New projects start with host acceptance marked not run.

Generated browser source imports shared types from `cedros:admin`. The exact frozen kit declarations include shared types and only the `toast` runtime value; other documented shim values require an ambient augmentation matching the published signatures. Emit browser ESM and externalize only documented host imports. No Cedros registry dependency is installed.

The generated wrapper verifies and extracts the complete kit, then runs its unmodified canonical verifier. `make validate` covers schema, context, and runtime alignment; `make package` also runs the aggregate verifier against the final ZIP. Local contract checks do not prove installed-host rendering, lifecycle behavior, or publication.
