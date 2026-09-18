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
 *
 * Both shapes therefore have to be readable, because only one of them is ours
 * to choose. The editor cannot send a path at all, so anything a person
 * translates in the UI arrives in the platform's shape whatever this site
 * prefers — see `documentPathCandidates` and `readLocaleFromPath`.
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
];

/**
 * Adding a locale is a code change, not only a settings change.
 *
 * Configuring a market in site settings records the intent but does not make
 * the site serve it: the prefix, the switcher entry and the `hreflang`
 * alternates all read this list. A new language needs an entry here and a
 * deploy as well as its pages.
 */

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
  if (tag) return { locale: tag, rest: tail.join("/") };

  // A translation created in the editor carries no prefix — it is stored at
  // `{canonicalPath}.{tag}`. Reading that suffix is what stops such a page from
  // being drawn in English chrome and announced as `lang="en-US"`.
  const suffixed = readLocaleSuffix(clean);
  if (suffixed) return suffixed;

  return { locale: DEFAULT_LOCALE, rest: clean };
}

/** The locale a `{canonicalPath}.{tag}` path names, or null if it is not one. */
function readLocaleSuffix(clean: string): { locale: string; rest: string } | null {
  const dot = clean.lastIndexOf(".");
  if (dot < 0) return null;
  const tail = clean.slice(dot + 1).toLowerCase();
  // Only a configured, prefixed locale counts. Without that check any dotted
  // path ("privacy.policy") would be read as a translation.
  const found = LOCALES.find(
    (l) => l.prefix && suffixTagsFor(l.tag).some((t) => t.toLowerCase() === tail),
  );
  return found ? { locale: found.tag, rest: clean.slice(0, dot) } : null;
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

/**
 * Locale tags that may appear as a path suffix.
 *
 * Three things vary, so all of them are offered. The bare language counts as
 * well as the full tag, because the suffix is whatever the caller passed as
 * `locale` and the editor sends the configured market tag. And the case is
 * lower: the backend stores `test-basic-page.es-us` for locale `es-US`, so a
 * candidate built from the tag verbatim would not match the stored path.
 * Verified against the live API on 2026-09-18 by creating a pathless
 * translation — the schema documents the default as `{canonicalPath}.{locale}`
 * and does not mention the normalization.
 */
function suffixTagsFor(tag: string): string[] {
  const language = tag.split("-")[0] ?? tag;
  const forms = language !== tag ? [tag, language] : [tag];
  return [...new Set(forms.flatMap((t) => [t, t.toLowerCase()]))];
}

/**
 * The platform's own translation path shape, `{canonicalPath}.{tag}`.
 *
 * The editor cannot choose a path. puck-css's `createTranslation` accepts only
 * `{canonicalDocumentId, locale, mode}` and its provider sends no `path`, so
 * every translation created in the UI lands on the server's default here,
 * whatever this site's URL convention is. Knowing that shape is what keeps such
 * a page from being read as English and served as English.
 */
export function suffixDocumentPath(canonicalPath: string, tag: string): string {
  return `${canonicalPath.replace(/^\/+/, "") || "/"}.${tag}`;
}

/**
 * Every document path `canonicalPath` could be stored at in `tag`, in the order
 * this site prefers them: the prefix convention first, then the platform
 * defaults. Callers that need the one that exists must check against the
 * published path set — see `findLocalizedDocument`.
 */
export function documentPathCandidates(canonicalPath: string, tag: string): string[] {
  const prefixed = documentPathFor(canonicalPath, tag);
  if (tag === DEFAULT_LOCALE) return [prefixed];
  const candidates = [prefixed, ...suffixTagsFor(tag).map((t) => suffixDocumentPath(canonicalPath, t))];
  return [...new Set(candidates)];
}
