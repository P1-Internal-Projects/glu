import { describe, expect, it } from "vitest";
import { sanitizeRichtextHtml } from "../components/puck/sanitize-richtext";

describe("sanitizeRichtextHtml", () => {
  it("strips <script> tags", () => {
    const out = sanitizeRichtextHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("alert(1)");
    expect(out).toContain("<p>hi</p>");
  });

  it("drops javascript: hrefs but keeps the link text", () => {
    const out = sanitizeRichtextHtml('<a href="javascript:alert(1)">click</a>');
    expect(out.toLowerCase()).not.toContain("javascript:");
    expect(out).toContain("click");
  });

  it("drops data: hrefs", () => {
    const out = sanitizeRichtextHtml(
      '<a href="data:text/html,<script>alert(1)</script>">x</a>',
    );
    expect(out.toLowerCase()).not.toContain("data:");
    expect(out.toLowerCase()).not.toContain("<script");
  });

  it("removes <img> and its onerror handler entirely", () => {
    const out = sanitizeRichtextHtml('<img src="x" onerror="alert(1)">');
    expect(out.toLowerCase()).not.toContain("<img");
    expect(out.toLowerCase()).not.toContain("onerror");
  });

  it("strips inline event-handler attributes", () => {
    const out = sanitizeRichtextHtml('<p onclick="steal()">text</p>');
    expect(out.toLowerCase()).not.toContain("onclick");
    expect(out).toContain("text");
  });

  it("preserves safe formatting, lists, and https links", () => {
    const input =
      '<p><strong>bold</strong> and <em>italic</em></p>' +
      '<ul><li>one</li><li>two</li></ul>' +
      '<a href="https://example.com">safe link</a>';
    const out = sanitizeRichtextHtml(input);
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>italic</em>");
    expect(out).toContain("<li>one</li>");
    expect(out).toContain('href="https://example.com"');
  });

  /**
   * The toolbar emits all of these, and the allowlist used to drop them — which
   * only showed on the public page, because the editor renders richtext as
   * hydrated elements that never reach this function.
   */
  it.each([
    ["h2", "<h2>A section heading</h2>", "<h2>"],
    ["h3", "<h3>Sub heading</h3>", "<h3>"],
    ["h4", "<h4>Minor heading</h4>", "<h4>"],
    ["blockquote", "<blockquote><p>Quoted.</p></blockquote>", "<blockquote>"],
    ["code block", "<pre><code>const x = 1;</code></pre>", "<pre>"],
    ["horizontal rule", "<p>a</p><hr><p>b</p>", "<hr>"],
  ])("keeps %s, which the toolbar can produce", (_name, input, expected) => {
    expect(sanitizeRichtextHtml(input)).toContain(expected);
  });

  /** The hero is the page's h1; a second one in body copy is an outline error. */
  it("drops an h1 but keeps its text", () => {
    const out = sanitizeRichtextHtml("<h1>Second first-level heading</h1>");
    expect(out).not.toContain("<h1");
    expect(out).toContain("Second first-level heading");
  });

  it("keeps a text-align style, the one declaration style exists for", () => {
    const out = sanitizeRichtextHtml('<p style="text-align: center">Centred</p>');
    expect(out).toContain("text-align: center");
  });

  it.each([
    ["positioning", '<p style="position: fixed; top: 0">x</p>'],
    ["remote image", '<p style="background-image: url(https://evil.test/p.gif)">x</p>'],
    ["display", '<p style="display: none">x</p>'],
  ])("strips a %s style rather than passing it through", (_name, input) => {
    const out = sanitizeRichtextHtml(input);
    expect(out).not.toContain("style=");
    expect(out).toContain("x");
  });

  /** A declaration riding alongside the alignment must not survive with it. */
  it("keeps only the alignment when other declarations are present", () => {
    const out = sanitizeRichtextHtml(
      '<p style="text-align: right; position: absolute; z-index: 99">x</p>',
    );
    expect(out).toContain("text-align: right");
    expect(out).not.toContain("position");
    expect(out).not.toContain("z-index");
  });

  it("keeps relative and anchor hrefs", () => {
    expect(sanitizeRichtextHtml('<a href="/about">a</a>')).toContain(
      'href="/about"',
    );
    expect(sanitizeRichtextHtml('<a href="#section">a</a>')).toContain(
      'href="#section"',
    );
  });

  it("keeps a link's target, rel and title", () => {
    const out = sanitizeRichtextHtml(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow" title="Example">x</a>',
    );
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
    expect(out).toContain('title="Example"');
  });
});
