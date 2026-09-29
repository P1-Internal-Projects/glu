import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GLUPersonProfile, gluPersonProfileConfig } from "../components/puck/glu-person-profile";
import { COUNSELOR_SILHOUETTE_URL } from "../lib/glu-assets";

const base = { name: "Marisol Vega", role: "Admissions Counselor" } as any;
const URL = "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/a/b-headshot.jpg";

describe("GLUPersonProfile headshot", () => {
  it("renders an older plain URL string", () => {
    const html = renderToStaticMarkup(<GLUPersonProfile {...base} photoUrl={URL} />);
    expect(html).toContain("b-headshot.jpg");
    expect(html).toContain('alt="Marisol Vega"');
  });

  it("renders a media-library object, using its alt text", () => {
    const html = renderToStaticMarkup(
      <GLUPersonProfile {...base} photoUrl={{ url: URL, alt: "Marisol smiling", assetId: "a", versionId: "b" } as any} />,
    );
    expect(html).toContain("b-headshot.jpg");
    expect(html).toContain('alt="Marisol smiling"');
  });

  it("falls back to the silhouette, with an empty alt, when blank", () => {
    for (const v of ["", null, undefined]) {
      const html = renderToStaticMarkup(<GLUPersonProfile {...base} photoUrl={v as any} />);
      expect(html).toContain(COUNSELOR_SILHOUETTE_URL.split("?")[0]);
      expect(html).toContain('alt=""');
    }
  });

  it("uses the media picker and sits right under the name", () => {
    const fields = gluPersonProfileConfig.fields as any;
    expect(fields.photoUrl.type).toBe("p1-media");
    expect(Object.keys(fields).slice(0, 2)).toEqual(["name", "photoUrl"]);
  });
});
