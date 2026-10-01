import { NextResponse } from "next/server";
import { createP1Middleware } from "@pantheon-systems/p1-next-sdk/server";
import { DEFAULT_LOCALE, readLocaleFromPath } from "./lib/locales";
import { findLocalizedDocument, pageExists } from "./lib/locale-pages";

const p1Middleware = createP1Middleware({
  cssBaseUrl: process.env.NEXT_PUBLIC_CSS_BASE_URL,
  apiToken: process.env.CSS_API_KEY ?? "",
  siteId: process.env.NEXT_PUBLIC_CSS_SITE_ID ?? "",
});

/**
 * Paths that are the application rather than the site. The editor, its API and
 * the auth callbacks are never localized, and rewriting one would break a login.
 */
function isAppPath(pathname: string): boolean {
  return (
    pathname.startsWith("/p1") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/storybook") ||
    pathname.startsWith("/_next")
  );
}

export async function middleware(request: Request) {
  const p1Response = await p1Middleware(request);

  // P1's own middleware owns redirects and auth. Anything other than a pass
  // through is its decision to make, so it is returned untouched.
  if (p1Response.status !== 200 || p1Response.headers.get("x-middleware-rewrite")) {
    return p1Response;
  }

  const url = new URL(request.url);

  // The editor's API answers differ per user, workstream and moment, so no
  // shared cache may keep one. Without this, Pantheon's CDN cached the
  // datasource-context response: when the content API was cold and the
  // editor's 8-second fetch timed out, the empty result was served to every
  // later editor load until it expired, and GLU Listing showed "No items to
  // display" on and off while the published page rendered fine.
  if (url.pathname.startsWith("/p1/api/")) {
    p1Response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return p1Response;
  }

  if (isAppPath(url.pathname)) return p1Response;

  const { locale, rest } = readLocaleFromPath(url.pathname);

  // The site's policy is `fallback`: a visitor asking for a page that has no
  // version in their language gets the default one rather than a 404. The
  // platform records that policy but does not act on it, so it is applied here.
  if (locale !== DEFAULT_LOCALE) {
    const requested = url.pathname.replace(/^\/+/, "");
    if (!(await pageExists(requested))) {
      // Before falling back, look for the same page under the platform's own
      // translation path. The editor cannot send a path, so a translation
      // authored in the UI is stored at `{canonicalPath}.{tag}` rather than
      // under this site's prefix. Serving it here is what makes an
      // editor-authored page reachable at the prefix URL that the nav, the
      // switcher and the hreflang alternates all link to — without anyone
      // having to rename the document first.
      const stored = await findLocalizedDocument(rest, locale);

      // Rewriting to the default locale's path is also what gives the page its
      // language: the chrome reads the locale from the route that actually
      // rendered, so a fallback page reads as en-US rather than claiming
      // Spanish for English words. A suffix path keeps its own locale, because
      // `readLocaleFromPath` recognises that shape too.
      const target = new URL(`/${stored ?? rest}`, url);
      target.search = url.search;
      return NextResponse.rewrite(target);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
