import { describe, expect, it } from "vitest";
import { createSeoRootFields } from "@pantheon-systems/puck-css/seo";
import { puckRoot } from "../components/puck/root";

/**
 * The root config composes the page-metadata fields rather than declaring them.
 *
 * The field set and its placeholder chains are tested in puck-css, which owns
 * the `root.props._meta` shape they write. What matters here is that this
 * template keeps composing them — and that title, description and the render
 * wrapper stay the site's own, so branding remains forkable.
 */

type Fields = Record<string, unknown>;

const fields = puckRoot.fields as Fields;
const resolved = (props: Record<string, unknown>) =>
  (puckRoot.resolveFields as (data: { props: Record<string, unknown> }) => Fields)({
    props,
  });

describe("puckRoot", () => {
  // GLU labels these and gives the title AI guidance; the field types are the
  // template's. pccContentId is GLU's own root field for Content Publisher pages.
  it("keeps the site's own title, description and pccContentId fields", () => {
    expect(fields.title).toMatchObject({ type: "text", label: "Page Title" });
    expect(fields.description).toMatchObject({ type: "textarea", label: "Page Description" });
    expect(fields.pccContentId).toMatchObject({ type: "text" });
  });

  /**
   * The shape has to stay the package's, but GLU decorates it with `ai`
   * instructions on the way through (see withSeoAi in components/puck/root.tsx).
   * So this compares the field set with those annotations stripped: a new
   * metadata field arriving from puck-css still has to show up here, while
   * adding guidance for an author does not fail the test.
   */
  it("takes the metadata field set from puck-css, bar the AI guidance", () => {
    const withoutAi = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(withoutAi);
      if (!value || typeof value !== "object") return value;
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .filter(([key]) => key !== "ai")
          .map(([key, v]) => [key, withoutAi(v)]),
      );
    };

    expect(withoutAi(fields._meta)).toEqual(withoutAi(createSeoRootFields()._meta));
  });

  /**
   * The audit in scripts/audit-ai-hints.ts only walks a component's top-level
   * fields, so nothing else would notice a new metadata field arriving from
   * puck-css with no guidance attached. A field may opt out with
   * `exclude: true` — ogLocale does — but it has to say so rather than be
   * silently unannotated.
   */
  it("carries AI guidance on every metadata field, or an explicit opt-out", () => {
    const meta = fields._meta as {
      ai?: { instructions?: string };
      objectFields: Record<string, { ai?: { instructions?: string; exclude?: boolean } }>;
    };
    expect(meta.ai?.instructions).toBeTruthy();
    for (const [name, field] of Object.entries(meta.objectFields)) {
      const annotated = Boolean(field.ai?.instructions) || field.ai?.exclude === true;
      expect(annotated, `${name} has neither AI instructions nor exclude`).toBe(true);
    }
  });

  it("passes the live root props through, so placeholders track edits", () => {
    const meta = resolved({ title: "Q3 Launch Recap" })._meta as {
      objectFields: Record<string, { placeholder?: string }>;
    };

    expect(meta.objectFields.ogTitle?.placeholder).toBe("Q3 Launch Recap");
  });

  it("resolves the same field set it declares statically", () => {
    expect(Object.keys(resolved({ title: "x" })).sort()).toEqual(
      Object.keys(fields).sort(),
    );
  });

  it("adds no _meta default, so no page is seeded with boilerplate metadata", () => {
    // Empty-means-inherit: an unset field falls back at render time. A default
    // here would freeze a value into every new page's snapshot.
    expect(puckRoot.defaultProps).not.toHaveProperty("_meta");
  });
});
