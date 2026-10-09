import { describe, expect, it } from "vitest";

import { buildLinkAttrs, isInternal, normalizeHref, parseLinkAttrs } from "../components/rich-text/link";

describe("normalizeHref", () => {
  it.each([
    ["example.com", "https://example.com"],
    ["www.example.com/menu?x=1#top", "https://www.example.com/menu?x=1#top"],
    ["example.com:8080/path", "https://example.com:8080/path"],
    ["localhost:3000", "https://localhost:3000"],
    ["//cdn.example.com/a", "https://cdn.example.com/a"],
    ["  https://example.com  ", "https://example.com"],
    ["http://example.com", "http://example.com"],
    ["HTTPS://Example.com", "HTTPS://Example.com"],
    ["/about", "/about"],
    ["#hours", "#hours"],
    ["?page=2", "?page=2"],
    ["mailto:hi@example.com", "mailto:hi@example.com"],
    ["hi@example.com", "mailto:hi@example.com"],
    ["tel:+16055550100", "tel:+16055550100"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeHref(input)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "vbscript:msgbox",
    "file:///etc/passwd",
    "about us",
    "menu",
    "//",
  ])("refuses %j", (input) => {
    expect(normalizeHref(input)).toBeNull();
  });
});

describe("isInternal", () => {
  it("treats paths, anchors and queries as internal", () => {
    for (const href of ["/", "/about", "#top", "?q=1"]) expect(isInternal(href)).toBe(true);
  });

  it("treats other origins as external", () => {
    for (const href of ["https://example.com", "//example.com", "mailto:a@b.co"]) expect(isInternal(href)).toBe(false);
  });
});

describe("buildLinkAttrs", () => {
  const base = { href: "https://example.com", newTab: false, nofollow: false, sponsored: false, title: "" };

  it("adds no target, rel or title by default", () => {
    expect(buildLinkAttrs(base)).toEqual({ href: "https://example.com", target: null, rel: null, title: null });
  });

  it("gives a new-tab link noopener noreferrer", () => {
    expect(buildLinkAttrs({ ...base, newTab: true })).toMatchObject({ target: "_blank", rel: "noopener noreferrer" });
  });

  it("adds nofollow and sponsored only when chosen", () => {
    expect(buildLinkAttrs({ ...base, newTab: true, nofollow: true, sponsored: true }).rel).toBe(
      "noopener noreferrer nofollow sponsored",
    );
    expect(buildLinkAttrs({ ...base, sponsored: true }).rel).toBe("sponsored");
  });

  it("never opens an internal link in a new tab or marks it nofollow", () => {
    expect(buildLinkAttrs({ ...base, href: "/menu", newTab: true, nofollow: true })).toEqual({
      href: "/menu",
      target: null,
      rel: null,
      title: null,
    });
  });

  it("keeps a trimmed title", () => {
    expect(buildLinkAttrs({ ...base, title: "  Our menu " }).title).toBe("Our menu");
  });
});

describe("parseLinkAttrs", () => {
  it("reads an existing link back into the form", () => {
    expect(
      parseLinkAttrs({ href: "https://example.com", target: "_blank", rel: "noopener noreferrer nofollow", title: "Hi" }),
    ).toEqual({ href: "https://example.com", newTab: true, nofollow: true, sponsored: false, title: "Hi" });
  });

  it("tolerates missing attributes", () => {
    expect(parseLinkAttrs({})).toEqual({ href: "", newTab: false, nofollow: false, sponsored: false, title: "" });
  });
});
