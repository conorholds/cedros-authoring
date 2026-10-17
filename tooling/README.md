# Project tools

This folder supplies the tools behind the starter kit. Start with the [main README](../README.md) or a [project guide](../docs/README.md), then create your project from the repository root:

```sh
npm run page -- ../my-page
npm run theme -- ../my-theme
npm run extension -- ../my-extension
```

Choose one command. It creates an independent project with its own source files, README, and build commands. Make your changes in that project.

## What's here

| Folder | Purpose |
| --- | --- |
| [templates/](templates/) | The three starters: [pages](templates/pages/), [themes](templates/themes/), and [extensions](templates/extensions/) |
| [assets/authoring/](assets/authoring/) | Versioned Cedros authoring kits, their checksums, and the verifier wrapper |
| [bin/](bin/) | The command-line entry point used by the root npm commands |
| [src/](src/) | The generator that applies your project name and options and assembles the starter files |
| [skills/cedros-authoring/](skills/cedros-authoring/) | Optional guidance and references for an AI coding assistant |

The starter files and generator work together: page and theme files have values filled in when you create a project, while extension manifests and registration files are assembled for the capabilities you select. Shared authoring kits provide version-matched documentation and checks.

You can return to this repository to create another project at any time. Each generated project keeps the files it needs for its own checks and packaging.

## Next steps

- [Build a custom page](../docs/pages.md)
- [Create a custom theme](../docs/themes.md)
- [Build a custom extension](../docs/extensions.md)
- [Work with an AI assistant](../docs/ai.md)
- [Troubleshoot setup or packaging](../docs/troubleshooting.md)
