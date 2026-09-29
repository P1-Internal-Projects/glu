import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GLUFeatureSectionComponent } from "../components/puck/glu-feature-section";

const base = { eyebrow: "", heading: "H", body: "<p>B</p>", imageUrl: "https://media.p1.pantheon.io/image/x/assets/a/b.jpg", imageAlt: "A", background: "white" } as any;
// The image column is first in the markup; only "right" should flip the grid.
const flipped = (html: string) => /direction:\s*rtl/.test(html);

describe("GLUFeatureSection image position", () => {
  it("left keeps the natural order: image on the left", () => {
    expect(flipped(renderToStaticMarkup(<GLUFeatureSectionComponent {...base} imagePosition="left" />))).toBe(false);
  });
  it("right flips the grid: image on the right", () => {
    expect(flipped(renderToStaticMarkup(<GLUFeatureSectionComponent {...base} imagePosition="right" />))).toBe(true);
  });
});
