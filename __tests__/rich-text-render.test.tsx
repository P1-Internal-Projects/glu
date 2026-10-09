import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { sanitizeRichtextHtml } from "@pantheon-systems/puck-css/sanitize-richtext";

import { buildLinkAttrs } from "../components/rich-text/link";
import { RichText, sanitizeRichText } from "../components/rich-text/render";

const LINK =
  '<p>See <a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow" title="Our menu">the menu</a>.</p>';
const SANITIZED = '<p>See <a href="https://example.com" title="Our menu">the menu</a>.</p>';

describe("rich text sanitizing", () => {
  it("keeps the link's href and the title the link form writes", () => {
    expect(sanitizeRichText(LINK)).toContain('<a href="https://example.com"');
    expect(sanitizeRichText(LINK)).toContain('title="Our menu"');
  });

  it("needs the title addition: the sanitizer's defaults drop it", () => {
    expect(sanitizeRichtextHtml(LINK)).not.toContain("title=");
  });

  // KNOWN BUG in puck-css 0.18.2 (README "Sanitizer alignment"): target and rel
  // are allowlisted, but the custom ALLOWED_URI_REGEXP is also applied to their
  // values, which never look like URLs, so DOMPurify drops them. When this test
  // fails, puck-css is fixed: flip it to expect `target` and `rel` to survive.
  it("drops target and rel (puck-css bug), whatever buildLinkAttrs produced", () => {
    const { href, target, rel, title } = buildLinkAttrs({
      href: "https://example.com",
      newTab: true,
      nofollow: false,
      sponsored: true,
      title: "Sponsor",
    });
    const html = `<p><a href="${href}" target="${target}" rel="${rel}" title="${title}">x</a></p>`;
    expect(sanitizeRichText(html)).toBe('<p><a href="https://example.com" title="Sponsor">x</a></p>');
  });

  it("keeps every block a preset can produce", () => {
    const html =
      "<h2>A</h2><h3>B</h3><p><strong>b</strong> <em>i</em></p><ul><li><p>u</p></li></ul><ol><li><p>o</p></li></ol><blockquote><p>q</p></blockquote>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("still strips unsafe links and handlers", () => {
    const out = sanitizeRichText('<p><a href="javascript:alert(1)" onclick="x()">x</a></p>');
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("onclick");
  });
});

describe("RichText", () => {
  it("renders stored HTML, sanitized, in a prose wrapper", () => {
    const html = renderToStaticMarkup(<RichText value={`${LINK}<script>alert(1)</script>`} className="body" />);
    expect(html).toBe(`<div class="rich-text-prose body">${SANITIZED}</div>`);
  });

  it("wraps a plain-text default in a paragraph, escaped", () => {
    expect(renderToStaticMarkup(<RichText value="Fish & chips" />)).toBe(
      '<div class="rich-text-prose"><p>Fish &amp; chips</p></div>',
    );
  });

  it("renders an element as-is", () => {
    expect(renderToStaticMarkup(<RichText value={<p>Editing</p>} />)).toBe(
      '<div class="rich-text-prose"><p>Editing</p></div>',
    );
  });

  it("renders nothing for an empty value", () => {
    expect(renderToStaticMarkup(<RichText value="" />)).toBe("");
    expect(renderToStaticMarkup(<RichText value={null} />)).toBe("");
  });
});
