# Troubleshooting

## Check your tools

The kit supports Node.js `>=24.17.0 <25` and npm `11.13.0`. Check the versions in the terminal you're using:

```sh
node --version
npm --version
```

If a command fails before showing the Cedros help or next steps, confirm you're using a supported Node version. After changing Node or npm, run `make install` inside your generated project again.

The project workflows also need `make`. Theme and extension projects use `unzip` for their bundled authoring kits. If your shell reports either command is missing, install that tool for your operating system and confirm it is available in the same terminal.

## npm reports a missing script

Run `npm run page`, `npm run theme`, and `npm run extension` from the Cedros Authoring repository root. Run `make install`, `make test`, and `make package` inside the project you created. The creation command prints the directory to enter next.

## The destination already exists

Choose a new project directory when starting another project. To keep working on an existing project, open its README and edit its source files directly.

Use `--force` only for an intentional overlay after reviewing the destination: it replaces known starter files. A Rust extension cannot be overlaid with the UI-only starter. Preserve its backend selection or create a fresh project.

## Theme installation cannot download the runtime

`make install` downloads the supported runtime and checks its integrity before installing it. If the endpoint is unavailable and you have an authorized local copy, use:

```sh
make install THEME_RUNTIME_TARBALL=/path/to/cedros-theme-runtime-0.1.0.tgz
```

A checksum error means the file differs from the supported artifact. Obtain the correct version and retry; keep the checksums and lockfile pinned. See [theme runtime compatibility](compatibility.md#theme-runtime) for the version, checksum, and distribution terms.

## Theme validation or font packaging fails

Validation errors identify the field to fix in `src/theme.mjs`. Complete both color palettes and use the block styles listed in `block-variant-map.md`, then run `make validate` again.

Missing-font errors identify the referenced source. Match its filename and case to a file under the project's `fonts/` folder. JSON imports through Appearance need system fonts or fonts available at site URLs; bundled font files travel through the ZIP installation workflow. See [the theme guide](themes.md).

## Where do I preview my work?

| Project | Preview |
| --- | --- |
| Page | Add the source to a page in Cedros Page Builder and preview the saved page |
| Theme | Run `make build`, open `.theme-review/index.html` and `.theme-review/blog.html`, then review the imported theme in Appearance |
| Extension | Install the ZIP on a development site and exercise the admin, website, or native features you changed |

A local check confirms the files and package are valid. Review the result on your destination site with its actual content, permissions, and integrations before publishing or applying it.

## A Rust extension will not build

The Rust backend needs Rust stable and the `wasm32-wasip2` target. With Rust and rustup installed, add that target:

```sh
rustup target add wasm32-wasip2
```

Run `make build-server` inside the extension project to check the backend separately. The default UI-only extension can be built without Rust.

## The site rejects a package or change

Run `make package` again and use the resulting file from `dist/`. Confirm that your site supports the [documented compatibility baseline](compatibility.md), that you're using the right import workflow, and that your account has the required permissions.

- Page ZIPs collect source files for Page Builder; they are not installable extensions.
- Theme JSON belongs in the Appearance theme library; theme ZIPs use a Theme Manager workflow.
- Extension ZIPs belong in Extensions settings and require their declared capabilities and integrations.

Record the exact error, project version, site version, and steps that reproduce the problem when asking for help. Keep credentials out of project files and support requests.

[Back to the guides](README.md)
