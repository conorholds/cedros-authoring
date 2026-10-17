import { scaffoldExtensionProject } from "./extension-scaffold.mjs";
import { scaffoldPageProject } from "./page-scaffold.mjs";
import { printReference } from "./references.mjs";
import { scaffoldThemeProject } from "./theme-scaffold.mjs";
import { packageVersion } from "./version.mjs";

const HELP = `Create a custom Cedros page, theme, or extension.

From a starter-kit checkout:
  npm run page -- ../my-page
  npm run theme -- ../my-theme
  npm run extension -- ../my-extension

Usage:
  cedros-authoring init theme <target-dir> [options]
  cedros-authoring init extension <target-dir> [options]
  cedros-authoring init page <target-dir> [options]
  cedros-authoring reference [list|overview|pages|themes|extensions|discovery|troubleshooting]
  cedros-authoring --help
  cedros-authoring --version

Theme options:
  --id <theme-id>              Stable lowercase kebab-case theme id.
  --display-name <name>        Operator-facing display name.
  --version <version>          Semver version. Default: 1.0.0.
  --with-fonts                 Include a fonts/ starter directory.
  --force                      Write scaffold files into an existing target.

Extension options:
  --id <extension-id>          Stable lowercase kebab-case extension id.
  --display-name <name>        Operator-facing display name.
  --version <version>          Semantic version. Default: 1.0.0.
  --npm-scope <scope>          Package scope. Default: @cedros-extensions.
  --server <kind>              Backend: none (default) or executable rust Wasm.
  --force                      Write scaffold files into an existing target.

Page options:
  --id <page-id>               Stable lowercase kebab-case page id.
  --route <route>              Normalized absolute route. Default: /<page-id>.
  --title <title>              Browser/SEO title. Default: <label> | Cedros.
  --label <label>              Human-readable page label.
  --indexability <mode>        publication-controlled (default) or never.
  --force                      Write scaffold files into an existing target.
`;

export async function runCli(argv) {
  if (argv.length === 1 && (argv[0] === "--version" || argv[0] === "-v")) {
    console.log(packageVersion());
    return;
  }
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP.trimEnd());
    return;
  }

  const [command, kind, targetDir, ...rest] = argv;
  if (command === "reference") {
    printReference(kind);
    return;
  }
  if (command !== "init") {
    throw new Error(`unknown command "${command}"; run cedros-authoring --help`);
  }
  if (!targetDir) {
    throw new Error(`missing target directory for ${kind ?? "authoring"} scaffold`);
  }

  const options = parseOptions(rest, kind);
  if (kind === "theme") {
    const result = scaffoldThemeProject({ ...options, targetDir });
    console.log(`Created Cedros theme authoring project at ${result.targetDir}`);
    console.log(`Theme: ${result.themeId} (${result.displayName})`);
    console.log("");
    console.log("Next:");
    console.log(`  cd ${shellQuote(result.targetDir)}`);
    console.log("  make install");
    console.log("  make validate");
    console.log("  make build");
    console.log("  make package");
    return;
  }
  if (kind === "extension") {
    const result = await scaffoldExtensionProject({ ...options, targetDir });
    console.log(`Created Cedros extension scaffold at ${result.targetDir}`);
    console.log(`Extension: ${result.extensionId}@${result.version}`);
    console.log("");
    console.log("Next:");
    console.log(`  cd ${shellQuote(result.targetDir)}`);
    console.log("  make install");
    console.log("  make validate");
    console.log("  make package");
    return;
  }
  if (kind === "page") {
    const result = scaffoldPageProject({ ...options, targetDir });
    console.log(`Created Cedros custom-page authoring project at ${result.targetDir}`);
    console.log(`Page: ${result.route} (${result.label})`);
    console.log("");
    console.log("Next:");
    console.log(`  cd ${shellQuote(result.targetDir)}`);
    console.log("  make install");
    console.log("  make validate");
    console.log("  make package");
    console.log("  make test");
    return;
  }
  throw new Error(`unsupported init target "${kind}"`);
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function parseOptions(args, kind) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (kind === "theme" && arg === "--with-fonts") {
      options.withFonts = true;
      continue;
    }
    if (!arg.startsWith("--")) {
      throw new Error(`unexpected argument "${arg}"`);
    }
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    const value = inlineValue ?? args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`missing value for ${arg}`);
    }
    if (inlineValue === undefined) index += 1;
    assignOption(options, kind, key, value);
  }
  return options;
}

function assignOption(options, kind, key, value) {
  if (kind === "theme") {
    assignThemeOption(options, key, value);
    return;
  }
  if (kind === "page") {
    assignPageOption(options, key, value);
    return;
  }
  if (kind !== "extension") {
    throw new Error(`unsupported init target "${kind}"`);
  }
  assignExtensionOption(options, key, value);
}

function assignPageOption(options, key, value) {
  switch (key) {
    case "id":
      options.id = value;
      break;
    case "route":
      options.route = value;
      break;
    case "title":
      options.title = value;
      break;
    case "label":
      options.label = value;
      break;
    case "indexability":
      options.indexability = value;
      break;
    default:
      throw new Error(`unknown option --${key}`);
  }
}

function assignThemeOption(options, key, value) {
  switch (key) {
    case "id":
      options.id = value;
      break;
    case "display-name":
      options.displayName = value;
      break;
    case "version":
      options.version = value;
      break;
    default:
      throw new Error(`unknown option --${key}`);
  }
}

function assignExtensionOption(options, key, value) {
  switch (key) {
    case "id":
      options.extensionId = value;
      break;
    case "display-name":
      options.displayName = value;
      break;
    case "version":
      options.version = value;
      break;
    case "npm-scope":
      options.npmScope = value;
      break;
    case "server":
      options.server = value;
      break;
    default:
      throw new Error(`unknown option --${key}`);
  }
}
