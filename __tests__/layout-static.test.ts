import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

/**
 * The root layout wraps every route, including the published catch-all, which
 * Next renders statically so pages can be cached at the edge.
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

const layout = code("app/layout.tsx");

const DYNAMIC_APIS = ["headers(", "cookies(", "draftMode(", "connection("];

describe("the root layout stays statically renderable", () => {
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

  // The language of the content is set by the chrome instead. If that moved
  // back to the layout it could only work by reading a request, so this pins
  // where the responsibility lives.
  it("leaves the page language to the site chrome", () => {
    const chrome = code("components/site-chrome.tsx");
    expect(chrome).toMatch(/lang=\{tag\}/);
  });
});
