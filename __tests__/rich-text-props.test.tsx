import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { richTextProps } from "../components/puck/rich-text-props";
import { GLUCardGridComponent } from "../components/puck/glu-card-grid";
import { GLUAccordionComponent } from "../components/puck/glu-accordion";

/**
 * A richtext value reaches a block as either the raw HTML string or the element
 * tree Puck's field transform produces, depending on the surface. Rendering it
 * as a plain child is correct for one and escapes the other, which is how a
 * reader ends up looking at a literal <p><em> instead of italics.
 */
const card = (description: unknown) =>
  renderToStaticMarkup(
    React.createElement(GLUCardGridComponent as never, {
      heading: "H",
      columns: 3,
      cards: [{ title: "T", description, linkHref: "/x", linkLabel: "L" }],
    } as never),
  );

describe("richTextProps", () => {
  it("renders an HTML string as markup, not as visible tags", () => {
    const html = card("<p><em>Study</em> ecosystems</p>");
    expect(html).toContain("<em>Study</em>");
    expect(html).not.toContain("&lt;em&gt;");
  });

  it("passes through a value Puck already hydrated", () => {
    const html = card(React.createElement("p", null, React.createElement("em", null, "Study")));
    expect(html).toContain("<em>Study</em>");
  });

  it("leaves plain text alone", () => {
    expect(card("Just a sentence.")).toContain("Just a sentence.");
  });

  // Scoped to the description element: the surrounding markup legitimately
  // contains other text, so scanning the whole document proves nothing.
  const descriptionOf = (html: string) =>
    html.match(/<h3[^>]*>T<\/h3><div[^>]*>(.*?)<\/div>/)?.[1];

  it.each([undefined, null, ""])("renders an empty description for %s", (value) => {
    expect(descriptionOf(card(value))).toBe("");
  });

  // The value is document content: anyone who can edit the page controls it.
  it("strips script tags and event handlers", () => {
    const html = card('<p>ok</p><script>alert(1)</script><img src=x onerror="alert(1)">');
    expect(html).toContain("ok");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
  });

  it("strips javascript: hrefs but keeps real links", () => {
    expect(card('<p><a href="javascript:alert(1)">x</a></p>')).not.toContain("javascript:");
    expect(card('<p><a href="/apply">Apply</a></p>')).toContain('href="/apply"');
  });

  it("never returns both children and dangerouslySetInnerHTML", () => {
    for (const v of ["<p>x</p>", "plain", null, undefined, ""]) {
      const props = richTextProps(v as never) as Record<string, unknown>;
      expect("children" in props && "dangerouslySetInnerHTML" in props).toBe(false);
    }
  });

  it("applies to the accordion answer too", () => {
    const html = renderToStaticMarkup(
      React.createElement(GLUAccordionComponent as never, {
        heading: "FAQ",
        items: [{ question: "Q", answer: "<p><strong>A</strong></p>" }],
      } as never),
    );
    expect(html).toContain("<strong>A</strong>");
    expect(html).not.toContain("&lt;strong&gt;");
  });
});
