/**
 * Resolve hook that sends `fast-json-patch` to its built ESM entry.
 *
 * The package ships a stray `index.ts` next to `index.js`/`index.mjs`, and tsx
 * prefers the .ts — which then fails on `./src/core`, a path that was never
 * published. Any tsx script that loads css-client or puck-css hits this. The
 * hook is a targeted redirect rather than a rename in node_modules, which a
 * reinstall would undo.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const ENTRY = pathToFileURL(
  path.join(path.dirname(require.resolve("fast-json-patch/package.json")), "index.mjs"),
).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "fast-json-patch") {
    return { url: ENTRY, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
