import { NextResponse } from "next/server";
import { createP1Middleware } from "@pantheon-systems/p1-next-sdk/server";
import { DEFAULT_LOCALE, readLocaleFromPath } from "./lib/locales";
import { pageExists } from "./lib/locale-pages";

const p1Middleware = createP1Middleware({
  cssBaseUrl: process.env.NEXT_PUBLIC_CSS_BASE_URL,
  apiToken: process.env.CSS_API_KEY ?? "",
  siteId: process.env.NEXT_PUBLIC_CSS_SITE_ID ?? "",
});

/** Header carrying the request's locale to the layout, which has no pathname. */
export const LOCALE_HEADER = "x-glu-locale";

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
  if (isAppPath(url.pathname)) return p1Response;

  const { locale, rest } = readLocaleFromPath(url.pathname);

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);

  // The site's policy is `fallback`: a visitor asking for a page that has no
  // version in their language gets the default one rather than a 404. The
  // platform records that policy but does not act on it, so it is applied here.
  if (locale !== DEFAULT_LOCALE) {
    const localizedPath = url.pathname.replace(/^\/+/, "");
    if (!(await pageExists(localizedPath))) {
      // The content served is the default locale's, so that is what the page is
      // written in — `lang` has to say so, or a screen reader announces English
      // prose in a Spanish voice.
      headers.set(LOCALE_HEADER, DEFAULT_LOCALE);
      const target = new URL(`/${rest}`, url);
      target.search = url.search;
      return NextResponse.rewrite(target, { request: { headers } });
    }
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
