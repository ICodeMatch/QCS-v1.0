// Adaptación del API de tar 7 al CLI 6. Se mantiene tar actualizado.
import { readFileSync, writeFileSync } from "node:fs";
const path = new URL(
  "../node_modules/@capacitor/cli/dist/util/template.js",
  import.meta.url,
);
const source = readFileSync(path, "utf8");
if (source.includes("tar_1.default.extract("))
  writeFileSync(
    path,
    source
      .replaceAll("tar_1.default.extract(", "tar_1.extract(")
      .replace('tslib_1.__importDefault(require("tar"))', 'require("tar")'),
  );
else if (!source.includes("tar_1.extract("))
  throw new Error(
    "El API del CLI cambió: revisar la adaptación antes de generar Android.",
  );
