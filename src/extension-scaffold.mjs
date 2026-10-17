import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { assertInsideTarget } from "./authoring-utils.mjs";
import { buildExtensionFiles } from "./extension-files.mjs";
import { normalizeExtensionScaffoldOptions } from "./naming.mjs";

export async function scaffoldExtensionProject(rawOptions) {
  const options = normalizeExtensionScaffoldOptions(rawOptions);
  if (rawOptions.force && options.server === "none") {
    try {
      const cargo = await readFile(resolve(options.targetDir, "packages/server/Cargo.toml"), "utf8");
      if (cargo.includes("wit-bindgen")) throw new Error("Cannot overlay a Wasm backend with a UI-only scaffold. Use --server rust or choose a fresh target.");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  await prepareTarget(options.targetDir, Boolean(rawOptions.force));

  const files = await buildExtensionFiles(options);
  for (const file of files) {
    const outputPath = resolve(options.targetDir, file.path);
    assertInsideTarget(options.targetDir, outputPath);
    await mkdir(dirname(outputPath), { recursive: true });
    if (file.path === "extension-context.json") {
      try {
        await writeFile(outputPath, file.content, { flag: "wx" });
      } catch (error) {
        if (error?.code !== "EEXIST") throw error;
        // Forced scaffold overlays preserve the existing task's decisions and evidence.
      }
    } else {
      await writeFile(outputPath, file.content);
    }
  }

  return {
    targetDir: options.targetDir,
    extensionId: options.extensionId,
    version: options.version,
  };
}

async function prepareTarget(targetDir, force) {
  const entries = await readDirectory(targetDir);
  if (entries.length === 0) {
    await mkdir(targetDir, { recursive: true });
    return;
  }
  if (!force) {
    throw new Error(`${targetDir} is not empty; pass --force to write scaffold files there`);
  }
}

async function readDirectory(targetDir) {
  try {
    return await readdir(targetDir);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}
