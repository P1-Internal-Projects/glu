/**
 * Which pages exist, in which locales.
 *
 * P1 records a serving policy in site settings but does not act on it, so
 * "serve the default language when this one has no version" is enforced here.
 * Answering that needs the set of published paths, which is one request for the
 * whole site rather than one per page, so it is cached for a short window and
 * shared by the middleware and the <head> alternates.
 *
 * A failure returns an empty set and every caller treats that as "cannot say",
 * falling through to normal rendering. A backend blip should not start
 * rewriting every localized URL to English.
 */

import { P1ContentClient } from "@pantheon-systems/css-client";
import { DEFAULT_LOCALE, LOCALES, documentPathCandidates, readLocaleFromPath } from "./locales";

const TTL_MS = 60_000;

let cache: { paths: Set<string>; at: number } | null = null;
let inFlight: Promise<Set<string>> | null = null;

async function loadPaths(): Promise<Set<string>> {
  const baseUrl = process.env.NEXT_PUBLIC_CSS_BASE_URL;
  const siteId = process.env.NEXT_PUBLIC_CSS_SITE_ID;
  const apiToken = process.env.CSS_API_KEY;
  if (!baseUrl || !siteId || !apiToken) return new Set();

  const client = new P1ContentClient({
    baseUrl,
    siteId,
    apiToken,
    ...(process.env.NEXT_PUBLIC_CSS_BRANCH_ID
      ? { branchId: process.env.NEXT_PUBLIC_CSS_BRANCH_ID }
      : {}),
  });

  try {
    const { pages } = await client.getPagePaths();
    return new Set(pages.map((p) => p.path.replace(/^\/+/, "")));
  } catch {
    return new Set();
  }
}

export async function publishedPaths(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.paths;
  // One load at a time: a cold cache under concurrent requests would otherwise
  // fan out one identical request per in-flight page render.
  inFlight ??= loadPaths().then((paths) => {
    cache = { paths, at: Date.now() };
    inFlight = null;
    return paths;
  });
  return inFlight;
}

/** True when this exact path has a published document. */
export async function pageExists(path: string): Promise<boolean> {
  const paths = await publishedPaths();
  if (paths.size === 0) return true; // unknown, not absent
  return paths.has(path.replace(/^\/+/, ""));
}

/**
 * The locales `canonicalPath` actually has a published page in, default first.
 * Used for the `hreflang` alternates, which must not advertise a URL that 404s.
 */
export async function availableLocales(canonicalPath: string): Promise<string[]> {
  const paths = await publishedPaths();
  if (paths.size === 0) return [DEFAULT_LOCALE];
  return LOCALES.filter((l) =>
    documentPathCandidates(canonicalPath, l.tag).some((candidate) => paths.has(candidate)),
  ).map((l) => l.tag);
}

/**
 * The document path `canonicalPath` is actually published at in `tag`, or null.
 *
 * Two shapes are possible for the same page. This site creates translations
 * with an explicit prefixed path, but the editor cannot send a path at all, so
 * anything authored in the UI lands at the platform default
 * `{canonicalPath}.{tag}`. The middleware uses this to serve either one at the
 * prefix URL the rest of the site links to, so a page authored in the editor is
 * reachable without anyone renaming it first.
 *
 * Returns null when the path set is unavailable: callers must treat that as
 * "cannot say" and leave the request alone rather than rewriting it.
 */
export async function findLocalizedDocument(
  canonicalPath: string,
  tag: string,
): Promise<string | null> {
  const paths = await publishedPaths();
  if (paths.size === 0) return null;
  return documentPathCandidates(canonicalPath, tag).find((c) => paths.has(c)) ?? null;
}

export { readLocaleFromPath };
