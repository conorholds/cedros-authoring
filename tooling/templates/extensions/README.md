# Custom extension starter

Use this starter to add functionality to a Cedros website, such as a booking workflow, a member area, or an integration.

From the Cedros Authoring repository, create an independent project:

```sh
npm run extension -- ../my-extension
```

For an executable Rust backend, add `--server rust` to that command. The generator creates the complete project, including its manifest, package files, UI registration, build commands, and tests.

| Folder | Starter files |
| --- | --- |
| `react/` | Web and admin runtime declarations |
| `react-native/` | Native runtime declarations |
| `server/` | Rust component source, locked dependencies, and host interfaces |
| `scripts/` | The Rust component build script |
| `tests/` | Generated extension checks |

Follow the generated project's README to make changes and prepare an installable ZIP. The [extension guide](https://github.com/conorholds/cedros-authoring/blob/main/docs/extensions.md) explains the full workflow.
