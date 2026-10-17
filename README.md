# Cedros Authoring

**Make your Cedros website your own.**

[Explore Cedros](https://cedros.ai/) · [Custom pages](docs/pages.md) · [Custom themes](docs/themes.md) · [Custom extensions](docs/extensions.md) · [License](LICENSE.md)

## What is Cedros?

Cedros is an AI-native website platform that enables businesses, agencies, and developers to create, manage, and operate websites using artificial intelligence.

The platform brings together website creation, hosting, content management, and business functionality. Website owners can work with authorized AI agents to update content, change designs, and manage supported business operations through natural language.

Extensions add capabilities such as customer accounts, payments, stores, directories, and events. [Cedros Login](https://github.com/conorholds/cedros-login) provides the identity foundation, and [Cedros Pay](https://github.com/conorholds/cedros-pay) provides the commerce foundation.

**Websites that think, act, and work for you.**

## Where Cedros Authoring fits

Cedros includes visual editing, shared page layouts, themes, and extensions. When your business needs something more specific, this starter kit gives you a working project to customize in code, on your own or with an AI coding assistant.

| You want to… | Start with | Examples |
| --- | --- | --- |
| Create a distinctive experience on one page | [Custom page](docs/pages.md) | A campaign landing page, product comparison, or interactive guide |
| Give the whole website a consistent look | [Custom theme](docs/themes.md) | Your brand's colors, typography, navigation, and page styling |
| Add functionality your business needs | [Custom extension](docs/extensions.md) | A booking workflow, member area, integration, or reusable feature |

Use the built-in editor and existing layouts when they fit. Choose a custom page for a specific experience, a theme for presentation across the site, and an extension for new behavior or integrations.

## Get started

Install **Node.js 24.17.x** with **npm 11.13.0**, then clone this repository:

```sh
git clone https://github.com/conorholds/cedros-authoring.git
cd cedros-authoring
```

Choose one project to create:

```sh
npm run page -- ../my-page
npm run theme -- ../my-theme
npm run extension -- ../my-extension
```

Each command creates a separate project beside this repository and prints its next steps. You can run these commands immediately after cloning; dependency installation happens inside the project you create.

Open that project's README to see what to edit, how to check your changes, and how to add them to your Cedros site. The project workflows use `make`; themes and extensions also use `unzip`. Extensions with a Rust backend need the Rust toolchain described in the [extension guide](docs/extensions.md).

## Follow a guide

- [Build a custom page](docs/pages.md): choose a layout, edit the page, and add it to your site.
- [Create a custom theme](docs/themes.md): customize your brand, preview it, and import it through Appearance.
- [Build a custom extension](docs/extensions.md): add features and package them for installation.
- [Work with an AI assistant](docs/ai.md): give your assistant a clear brief and the right Cedros documentation.
- [Compatibility and advanced options](docs/compatibility.md): supported versions, build tools, and package contracts.

## Repository layout

| Path | What's inside |
| --- | --- |
| `docs/` | Guides for building and installing your customization |
| `tooling/templates/pages/` | Custom page starter files |
| `tooling/templates/themes/` | Custom theme starter files |
| `tooling/templates/extensions/` | Custom extension starter files |
| `tooling/assets/authoring/` | Shared, versioned Cedros authoring kits |
| `tooling/src/` | The project generator |
| `package.json` | The short commands shown above |

Your work goes in the generated project. You can return to this kit whenever you want to start another.

## License

The starter code, templates, and guides are licensed under [MIT-0 (MIT No Attribution)](LICENSE.md). Use, modify, sell, and distribute them as part of your own projects, with no attribution or license-notice requirement. You choose the license for the work you create.

Separate dependencies retain their own licenses. The private Cedros theme runtime keeps its [separate distribution terms](docs/compatibility.md#theme-runtime).
