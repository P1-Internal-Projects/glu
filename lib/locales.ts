/**
 * The locales this site publishes, and the URL shape they take.
 *
 * P1 records a serving policy in site settings, but nothing acts on it at
 * request time — deciding which language a visitor receives is the
 * application's job. This module is that decision, in one place, so the
 * middleware, the switcher, the <head> alternates and the datasources cannot
 * drift from each other.
 *
 * The prefix is ours, not the platform's. A translation created without an
 * explicit path lands at `{canonicalPath}.{tag}`; these pages are created with
 * `/{prefix}/{path}` instead, which opts out of that convention. The trade is
 * deliberate: readable URLs, at the cost that a path can no longer be derived
 * from a page and a tag, so the variant list is the authority for what exists.
 */

export interface LocaleDefinition {
  /** BCP-47 tag, exactly as the site's markets are configured. */
  tag: string;
  /** First URL segment for this locale. Empty for the unprefixed default. */
  prefix: string;
  /** The language's own name for itself, which is what a switcher should show. */
  native: string;
  /** English name, for title attributes and screen-reader labels. */
  english: string;
  dir: "ltr" | "rtl";
}

export const DEFAULT_LOCALE = "en-US";

export const LOCALES: LocaleDefinition[] = [
  { tag: "en-US", prefix: "", native: "English", english: "English (United States)", dir: "ltr" },
  { tag: "es-US", prefix: "es", native: "Español", english: "Spanish (United States)", dir: "ltr" },
  { tag: "fr-FR", prefix: "fr", native: "Français", english: "French (France)", dir: "ltr" },
];

/** Prefix segment to locale tag, for reading a path. Excludes the default. */
export const LOCALE_PREFIXES: Record<string, string> = Object.fromEntries(
  LOCALES.filter((l) => l.prefix).map((l) => [l.prefix, l.tag]),
);

export function localeByTag(tag: string): LocaleDefinition | undefined {
  return LOCALES.find((l) => l.tag.toLowerCase() === tag.toLowerCase());
}

/** The locale a public path belongs to, and the path with its prefix removed. */
export function readLocaleFromPath(path: string): { locale: string; rest: string } {
  const clean = path.replace(/^\/+/, "");
  const [head, ...tail] = clean.split("/");
  const tag = head ? LOCALE_PREFIXES[head] : undefined;
  return tag ? { locale: tag, rest: tail.join("/") } : { locale: DEFAULT_LOCALE, rest: clean };
}

/**
 * The public path for `canonicalPath` in `tag`. Always returns a path with a
 * leading slash, and collapses the site root so the Spanish home page is `/es`
 * rather than `/es/`.
 */
export function localizedPath(canonicalPath: string, tag: string): string {
  const rest = canonicalPath.replace(/^\/+/, "");
  const prefix = localeByTag(tag)?.prefix ?? "";
  if (!prefix) return `/${rest}`;
  return rest ? `/${prefix}/${rest}` : `/${prefix}`;
}

/**
 * The document path a locale's page is stored at. Identical to the public path
 * without its leading slash, because these translations are created with an
 * explicit path rather than the platform's suffix default.
 */
export function documentPathFor(canonicalPath: string, tag: string): string {
  return localizedPath(canonicalPath, tag).replace(/^\/+/, "");
}
