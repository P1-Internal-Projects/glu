import { describe, expect, it } from "vitest";
import { navFor, footerFor } from "../lib/site-chrome";
import { DEFAULT_LOCALE, LOCALES } from "../lib/locales";

/**
 * The chrome is defined once and localized at render. What matters is that no
 * locale can drift from another in structure, and that a translated nav sends
 * visitors to translated pages — before this module existed, every translated
 * page's nav linked back to the English site.
 */

const TAGS = LOCALES.map((l) => l.tag);

/**
 * A locale with no chrome of its own does not fail loudly — `chromeLocale`
 * falls back to the default — so the header and footer would quietly render in
 * English on a page whose body was translated. This catches a market added to
 * LOCALES without wording to go with it.
 */
describe("every configured locale has its own chrome", () => {
  it.each(TAGS.filter((t) => t !== DEFAULT_LOCALE))("%s is not the English chrome", (tag) => {
    expect(navFor(tag).ctaLabel).not.toBe(navFor(DEFAULT_LOCALE).ctaLabel);
    expect(footerFor(tag).tagline).not.toBe(footerFor(DEFAULT_LOCALE).tagline);
  });
});

describe("navFor", () => {
  it.each(TAGS)("localizes every site href (%s)", (tag) => {
    const nav = navFor(tag);
    const prefix = LOCALES.find((l) => l.tag === tag)!.prefix;
    for (const link of nav.links) {
      expect(link.href.startsWith("/")).toBe(true);
      if (prefix) expect(link.href.startsWith(`/${prefix}/`)).toBe(true);
      else expect(link.href.startsWith("/es/")).toBe(false);
    }
    expect(nav.ctaHref.startsWith(prefix ? `/${prefix}/` : "/")).toBe(true);
  });

  it("gives every locale the same set of destinations", () => {
    const prefixes = LOCALES.map((l) => l.prefix).filter(Boolean);
    const strip = new RegExp(`^/(${prefixes.join("|")})(?=/)`);
    const canonical = (tag: string) =>
      navFor(tag).links.map((l) => l.href.replace(strip, ""));
    const base = canonical(DEFAULT_LOCALE);
    for (const tag of TAGS) expect(canonical(tag)).toEqual(base);
  });

  it("gives every locale the same number of links, so none can drift", () => {
    const counts = new Set(TAGS.map((t) => navFor(t).links.length));
    expect(counts.size).toBe(1);
  });

  // The wordmark is the most-clicked link in a header. Leaving it at "/" sent a
  // Spanish reader back to the English home page.
  it.each(TAGS)("points the wordmark at that locale's home page (%s)", (tag) => {
    const prefix = LOCALES.find((l) => l.tag === tag)!.prefix;
    expect(navFor(tag).homeHref).toBe(prefix ? `/${prefix}` : "/");
  });

  it("translates the labels rather than repeating English", () => {
    expect(navFor("es-US").links[0]?.label).toBe("Admisiones");
    expect(navFor("es-US").ctaLabel).toBe("Solicita tu admisión");
  });

  // An unconfigured or absent locale must still render a usable header.
  it.each([undefined, "", "de-DE"])("falls back to the default for %s", (tag) => {
    expect(navFor(tag as string | undefined).links).toEqual(navFor(DEFAULT_LOCALE).links);
  });
});

describe("footerFor", () => {
  it.each(TAGS)("localizes every column href (%s)", (tag) => {
    const prefix = LOCALES.find((l) => l.tag === tag)!.prefix;
    for (const column of footerFor(tag).columns) {
      for (const link of column.links) {
        if (prefix) expect(link.href.startsWith(`/${prefix}/`)).toBe(true);
        else expect(link.href).toMatch(/^\/(?!es\/|fr\/)/);
      }
    }
  });

  it("keeps the same shape in every locale", () => {
    const shape = (tag: string) =>
      footerFor(tag).columns.map((c) => c.links.length);
    for (const tag of TAGS) expect(shape(tag)).toEqual(shape(DEFAULT_LOCALE));
  });

  // Social destinations are not language-specific; a per-locale copy would be
  // three places to update one URL.
  it("shares social links across locales", () => {
    for (const tag of TAGS) {
      expect(footerFor(tag).socialLinks).toEqual(footerFor(DEFAULT_LOCALE).socialLinks);
    }
  });
});
