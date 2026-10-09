import { describe, expect, it } from "vitest";
import { linkAttrs, normalizeHref, readLink, withLinkEditing } from "../components/puck/rich-text-link";

describe("normalizeHref", () => {
  it.each([
    ["example.com", "https://example.com"],
    ["www.example.co.uk/path?q=1", "https://www.example.co.uk/path?q=1"],
    ["example.com:8080/x", "https://example.com:8080/x"],
    ["https://example.com", "https://example.com"],
    ["  /apply  ", "/apply"],
    ["#section", "#section"],
    ["?tab=2", "?tab=2"],
    ["name@example.com", "mailto:name@example.com"],
    ["mailto:1234@example.com", "mailto:1234@example.com"],
    ["tel:6055550100", "tel:6055550100"],
    ["tel:+16055550100", "tel:+16055550100"],
  ])("accepts %s", (input, expected) => {
    expect(normalizeHref(input)).toBe(expected);
  });

  it.each(["", "   ", "javascript:alert(1)", "JavaScript:alert(1)", "data:text/html,x", "/\\evil.com", "not a url", "hello"])(
    "rejects %j",
    (input) => {
      expect(normalizeHref(input)).toBeNull();
    },
  );
});

describe("linkAttrs", () => {
  const base = { href: "https://example.com", newTab: false, rel: "", title: "" };

  it("leaves target, rel and title off a plain link", () => {
    expect(linkAttrs(base)).toEqual({ href: "https://example.com", target: null, rel: null, title: null });
  });

  it("adds noopener noreferrer to a new-tab link, internal ones included", () => {
    expect(linkAttrs({ ...base, href: "/files/menu.pdf", newTab: true })).toMatchObject({
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it("keeps the author's rel and drops noopener noreferrer when the new tab is turned off", () => {
    expect(linkAttrs({ ...base, rel: "noopener noreferrer nofollow ugc" }).rel).toBe("nofollow ugc");
  });

  it("trims the title and omits an empty one", () => {
    expect(linkAttrs({ ...base, title: "  Fall menu (PDF)  " }).title).toBe("Fall menu (PDF)");
    expect(linkAttrs({ ...base, title: "   " }).title).toBeNull();
  });

  it("round-trips through readLink", () => {
    const values = { href: "https://example.com", newTab: true, rel: "nofollow", title: "Example" };
    expect(readLink(linkAttrs(values))).toEqual({ ...values, rel: "nofollow noopener noreferrer" });
  });
});

describe("withLinkEditing", () => {
  const field = withLinkEditing({ type: "richtext", label: "Body", contentEditable: true, options: { heading: false } });

  it("adds both toolbars and keeps the field's own settings", () => {
    expect(field.renderMenu).toBeTypeOf("function");
    expect(field.renderInlineMenu).toBeTypeOf("function");
    expect(field).toMatchObject({ label: "Body", contentEditable: true, options: { heading: false } });
  });

  it("stops TipTap's defaults of following links and forcing target/rel", () => {
    expect(field.options?.link).toMatchObject({ openOnClick: false, HTMLAttributes: { target: null, rel: null } });
  });
});
