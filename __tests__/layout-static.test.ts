import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

/**
 * The root layouts (the site's and the editor's) and the HTML shell they share
 * wrap every route, including the published catch-all, which Next renders
 * statically so pages can be cached at the edge.
 *
 * Reading a dynamic API here makes that render throw DYNAMIC_SERVER_USAGE, and
 * the failure is invisible in development, where every route is dynamic anyway.
 * It cost a production outage on 2026-09-15: every localized URL returned 500
 * while `next dev` served them happily.
 *
 * A source-level check rather than a render test, because what matters is that
 * the call is not in the file at all — a dynamic read behind a condition would
 * still opt the whole tree out of static rendering.
 */

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Comments are stripped before matching. The file explains why these calls are
 * absent, and naming them in that explanation must not read as using them.
 */
function code(path: string): string {
  return readFileSync(resolve(appDir, path), "utf-8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const ROOT_LAYOUTS = [
  "app/[[...puckPath]]/layout.tsx",
  "app/p1/layout.tsx",
  "components/html-shell.tsx",
];

const DYNAMIC_APIS = ["headers(", "cookies(", "draftMode(", "connection("];

describe.each(ROOT_LAYOUTS)("%s stays statically renderable", (path) => {
  const layout = code(path);

  it.each(DYNAMIC_APIS)("does not call %s", (api) => {
    expect(layout).not.toContain(api.replace("(", "()"));
    // Catch the import too: importing it is the first half of using it.
    expect(layout).not.toMatch(
      new RegExp(`import\\s*\\{[^}]*\\b${api.replace("(", "")}\\b[^}]*\\}\\s*from\\s*["']next/headers["']`),
    );
  });

  it("imports nothing from next/headers", () => {
    expect(layout).not.toMatch(/from\s+["']next\/headers["']/);
  });
});

describe("page language", () => {
  // <html lang> comes from the document the route resolves to, read from the
  // route params rather than the request.
  it("the site layout takes <html lang> from the page's document", () => {
    expect(code("app/[[...puckPath]]/layout.tsx")).toMatch(/getDocumentLanguage\(\{ params \}\)/);
  });

  // The chrome also sets it on its own wrapper, which is what the editor canvas
  // (whose <html> is the editor's) relies on.
  it("the site chrome sets the content language", () => {
    const chrome = code("components/site-chrome.tsx");
    expect(chrome).toMatch(/lang=\{tag\}/);
  });
});
