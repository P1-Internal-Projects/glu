import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ResolvedItem } from "@pantheon-systems/puck-css/fields";
import { GLUProgramCards } from "../components/puck/glu-program-cards";

/**
 * Server-rendered checks only: the vitest environment is node, so the expand
 * interaction and the row-insertion maths are not reachable here. Those are
 * verified in the browser — a card in row two opens its panel after the last
 * card of row two, and the panel closes when a filter hides its card.
 */

const item = (title: string, raw: Record<string, unknown>, teaser = "Teaser."): ResolvedItem => ({
  title,
  subtitle: "",
  teaser,
  // A datasource may well supply an image; this mode must ignore it.
  image: "https://example.test/should-not-render.jpg",
  icon: "",
  _raw: raw,
});

const ITEMS: ResolvedItem[] = [
  item("B.S. Environmental Science", {
    code: "ENVS-BS", college: "College of Environmental Science", degreeType: "B.S.",
    credits: 124, duration: "4 years", deliveryModes: ["On campus"], featured: true,
  }),
  item("M.Eng. Robotics", {
    code: "ROBO-MENG", college: "College of Engineering", degreeType: "M.Eng.",
    credits: 30, duration: "18 months", deliveryModes: ["On campus", "Hybrid"],
  }),
  item("B.S. Civil Engineering", {
    code: "CIVL-BS", college: "College of Engineering", degreeType: "B.S.", credits: 128,
  }),
];

const SHOW = { showTitle: true, showSubtitle: true, showTeaser: true, showImage: true, showIcon: false };

const html = (props: Partial<React.ComponentProps<typeof GLUProgramCards>> = {}) =>
  renderToStaticMarkup(<GLUProgramCards items={ITEMS} {...SHOW} {...props} />);

describe("text-only by design", () => {
  // The whole point of this mode: a degree has no photograph worth showing, and
  // stock imagery pushes the facts below the fold.
  it("renders no image even when the datasource supplies one", () => {
    const out = html();
    expect(out).not.toContain("<img");
    expect(out).not.toContain("should-not-render.jpg");
  });

  it("ignores showImage being on, because there is no image to position", () => {
    expect(html({ showImage: true })).not.toContain("<img");
  });
});

describe("the card", () => {
  it("leads with the degree type and the programme name", () => {
    const out = html();
    expect(out).toContain("B.S.");
    expect(out).toContain("B.S. Environmental Science");
  });

  it("shows the college, which is what the filter works on", () => {
    expect(html()).toContain("College of Environmental Science");
  });

  it("puts credits, duration and delivery in one meta line", () => {
    const out = html();
    expect(out).toContain("124 credits");
    expect(out).toContain("4 years");
    expect(out).toContain("On campus");
  });

  it("marks a featured programme", () => {
    expect(html()).toContain("Featured");
  });

  it("drops the teaser when the block turns it off", () => {
    expect(html({ showTeaser: false })).not.toContain("Teaser.");
  });

  // Screen readers need the button to say what it controls and whether it is open.
  it("exposes the expansion state on the trigger", () => {
    const out = html();
    expect(out).toContain('aria-expanded="false"');
    expect(out).toContain("aria-controls=");
  });
});

describe("the college filter", () => {
  it("offers each distinct college once, plus an all option", () => {
    const out = html();
    expect(out).toContain("All programs (3)");
    expect(out.match(/College of Engineering/g)?.length).toBeGreaterThanOrEqual(2);
    expect(out).toContain('aria-label="Filter programs by college"');
  });

  it("can be turned off for a page already scoped to one college", () => {
    expect(html({ showCollegeFilter: false })).not.toContain("All programs");
  });

  // One college means the control has nothing to choose between.
  it("hides itself when every programme is from the same college", () => {
    const single = [ITEMS[1], ITEMS[2]];
    const out = renderToStaticMarkup(<GLUProgramCards items={single} {...SHOW} />);
    expect(out).not.toContain("All programs");
  });
});

describe("empty state", () => {
  it("says so rather than rendering an empty grid", () => {
    const out = renderToStaticMarkup(<GLUProgramCards items={[]} {...SHOW} />);
    expect(out).toContain("No programs to show yet.");
  });
});
