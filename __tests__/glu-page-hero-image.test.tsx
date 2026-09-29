import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GLUPageHeroComponent, gluPageHeroConfig } from "../components/puck/glu-page-hero";

const base = { eyebrow: "Admissions", heading: "Apply", breadcrumbs: [{ label: "Home", href: "/" }] };
const URL = "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/a/b-hero.jpg";

describe("GLUPageHero background image", () => {
  it("renders a legacy plain URL string", () => {
    const html = renderToStaticMarkup(<GLUPageHeroComponent {...base} backgroundImageUrl={URL as any} />);
    expect(html).toContain("<img");
  });

  it("renders a media-library object (the value that crashed the editor)", () => {
    const html = renderToStaticMarkup(
      <GLUPageHeroComponent {...base} backgroundImageUrl={{ url: URL, alt: "Campus", assetId: "a", versionId: "b" } as any} />,
    );
    expect(html).toContain("<img");
    expect(html).not.toContain('src=""');
  });

  it("renders no image, and no empty src, when the image is blank", () => {
    for (const v of ["", null, undefined, {}]) {
      const html = renderToStaticMarkup(<GLUPageHeroComponent {...base} backgroundImageUrl={v as any} />);
      expect(html).not.toContain("<img");
    }
  });

  it("uses the media picker field", () => {
    expect((gluPageHeroConfig.fields as any).backgroundImageUrl.type).toBe("p1-media");
  });
});
