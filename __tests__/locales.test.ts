import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  documentPathFor,
  localeByTag,
  localizedPath,
  readLocaleFromPath,
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
      locale: "es-ES",
      rest: "visit/open-house",
    });
  });

  it("treats a bare prefix as that locale's home page", () => {
    expect(readLocaleFromPath("/fr")).toEqual({ locale: "fr-FR", rest: "" });
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
    expect(localizedPath("academics", "es-ES")).toBe("/es/academics");
  });

  // "/es/" would 404: the catch-all maps a URL to a document path, and no
  // document is stored with a trailing slash.
  it("collapses the locale home page to a bare prefix", () => {
    expect(localizedPath("", "fr-FR")).toBe("/fr");
    expect(localizedPath("", DEFAULT_LOCALE)).toBe("/");
  });
});

describe("documentPathFor", () => {
  it("drops the leading slash, since documents are stored without one", () => {
    expect(documentPathFor("visit/open-house", "es-ES")).toBe("es/visit/open-house");
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
    expect(localeByTag("es-es")?.tag).toBe("es-ES");
  });

  it("names every locale in its own language, for the switcher", () => {
    for (const l of LOCALES) {
      expect(l.native.length).toBeGreaterThan(0);
      expect(l.english.length).toBeGreaterThan(0);
    }
  });
});
