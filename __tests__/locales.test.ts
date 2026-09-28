import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  documentPathCandidates,
  documentPathFor,
  localeByTag,
  localizedPath,
  readLocaleFromPath,
  suffixDocumentPath,
} from "../lib/locales";

/**
 * The locale map is the one place the URL shape is decided, and four things
 * read it: the middleware, the switcher, the hreflang alternates and the
 * collection datasources. A disagreement between any two of them shows up as a
 * 404 or a wrong-language page, so the round trip is what these tests pin.
 */

describe("readLocaleFromPath", () => {
  it("reads the default locale for an unprefixed path", () => {
    expect(readLocaleFromPath("/academics")).toEqual({
      locale: DEFAULT_LOCALE,
      rest: "academics",
    });
  });

  it("reads a prefixed path and strips the prefix", () => {
    expect(readLocaleFromPath("/es/visit/open-house")).toEqual({
      locale: "es-US",
      rest: "visit/open-house",
    });
  });

  it("treats a bare prefix as that locale's home page", () => {
    expect(readLocaleFromPath("/es")).toEqual({ locale: "es-US", rest: "" });
  });

  // "esports" starts with "es" but is not the Spanish prefix. Matching on the
  // segment rather than the string is what keeps that a normal English page.
  it("matches on whole segments, not string prefixes", () => {
    expect(readLocaleFromPath("/esports").locale).toBe(DEFAULT_LOCALE);
    expect(readLocaleFromPath("/esports").rest).toBe("esports");
  });

  it("reads the site root as the default locale", () => {
    expect(readLocaleFromPath("/")).toEqual({ locale: DEFAULT_LOCALE, rest: "" });
  });
});

describe("localizedPath", () => {
  it("leaves the default locale unprefixed", () => {
    expect(localizedPath("academics", DEFAULT_LOCALE)).toBe("/academics");
  });

  it("prefixes a translated locale", () => {
    expect(localizedPath("academics", "es-US")).toBe("/es/academics");
  });

  // "/es/" would 404: the catch-all maps a URL to a document path, and no
  // document is stored with a trailing slash.
  it("collapses the locale home page to a bare prefix", () => {
    expect(localizedPath("", "es-US")).toBe("/es");
    expect(localizedPath("", DEFAULT_LOCALE)).toBe("/");
  });
});

describe("documentPathFor", () => {
  it("drops the leading slash, since documents are stored without one", () => {
    expect(documentPathFor("visit/open-house", "es-US")).toBe("es/visit/open-house");
    expect(documentPathFor("visit/open-house", DEFAULT_LOCALE)).toBe("visit/open-house");
  });
});

describe("round trip", () => {
  it.each(LOCALES.map((l) => l.tag))("survives building then reading back (%s)", (tag) => {
    const built = localizedPath("school-of-ai/programs", tag);
    expect(readLocaleFromPath(built)).toEqual({
      locale: tag,
      rest: "school-of-ai/programs",
    });
  });
});

describe("locale table", () => {
  it("has exactly one unprefixed locale, and it is the default", () => {
    const unprefixed = LOCALES.filter((l) => !l.prefix);
    expect(unprefixed).toHaveLength(1);
    expect(unprefixed[0]?.tag).toBe(DEFAULT_LOCALE);
  });

  it("resolves a tag case-insensitively, since stored tags are canonicalized", () => {
    expect(localeByTag("es-us")?.tag).toBe("es-US");
  });

  it("names every locale in its own language, for the switcher", () => {
    for (const l of LOCALES) {
      expect(l.native.length).toBeGreaterThan(0);
      expect(l.english.length).toBeGreaterThan(0);
    }
  });
});

/**
 * The platform's own translation path shape.
 *
 * The editor cannot send a path — puck-css's `createTranslation` takes only
 * `{canonicalDocumentId, locale, mode}` — so anything a person creates in the
 * UI is stored at the server's default rather than under this site's prefix.
 * Reading that shape, and looking for it, is what keeps an editor-authored
 * translation from being served as English with English chrome.
 */
describe("the editor's translation paths", () => {
  // The exact path the live API produced for locale es-US on 2026-09-18. It is
  // LOWERCASE, which the schema's "{canonicalPath}.{locale}" does not say.
  const OBSERVED = "test-basic-page.es-us";

  it("reads the locale off the path the backend actually creates", () => {
    expect(readLocaleFromPath(`/${OBSERVED}`)).toEqual({
      locale: "es-US",
      rest: "test-basic-page",
    });
  });

  it("offers that exact path as a candidate", () => {
    expect(documentPathCandidates("test-basic-page", "es-US")).toContain(OBSERVED);
  });

  it("reads the tag in its declared case too, in case the backend stops lowercasing", () => {
    expect(readLocaleFromPath("/academics.es-US").locale).toBe("es-US");
  });

  it("reads a bare language suffix, for a translation made by hand", () => {
    expect(readLocaleFromPath("/academics.es")).toEqual({
      locale: "es-US",
      rest: "academics",
    });
  });

  // Without checking the suffix against the configured locales, every dotted
  // path would be read as a translation of something.
  it("leaves a dotted path that is not a locale alone", () => {
    expect(readLocaleFromPath("/articles/privacy.policy").locale).toBe(DEFAULT_LOCALE);
    expect(readLocaleFromPath("/articles/privacy.policy").rest).toBe("articles/privacy.policy");
  });

  it("prefers this site's prefix, so a page existing in both shapes uses the pretty URL", () => {
    expect(documentPathCandidates("academics", "es-US")[0]).toBe("es/academics");
  });

  it("has nothing but the plain path to offer for the default locale", () => {
    expect(documentPathCandidates("academics", DEFAULT_LOCALE)).toEqual(["academics"]);
  });

  it("builds the suffix path without a leading slash, as documents are stored", () => {
    expect(suffixDocumentPath("/academics", "es-US")).toBe("academics.es-US");
    // The home page: P1 stores a pathless translation of `/` at `.fr-ca`.
    expect(suffixDocumentPath("/", "fr-CA")).toBe(".fr-CA");
    expect(suffixDocumentPath("", "fr-CA")).toBe(".fr-CA");
    expect(documentPathCandidates("/", "fr-CA")).toContain(".fr-ca");
  });
});
