import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ResolvedItem } from "@pantheon-systems/puck-css/fields";
import {
  EventCards,
  GLUListingSection,
  PersonCards,
} from "../components/puck/glu-listing";

const SHOW = {
  showTitle: true,
  showSubtitle: true,
  showTeaser: true,
  showImage: true,
  showIcon: false,
};

const EVENT: ResolvedItem = {
  title: "Fall Open House",
  subtitle: "",
  teaser: "Tour the campus.",
  image: "https://example.com/open-house.jpg",
  icon: "",
  _raw: { eventType: "Open House", startDate: "2026-10-17", url: "/events/fall-open-house" },
};

const PERSON: ResolvedItem = {
  title: "Marisol Vega",
  subtitle: "Senior Admissions Counselor",
  teaser: "Great Lakes region.",
  image: "https://example.com/marisol.jpg",
  icon: "",
  _raw: { url: "/counselors/marisol-vega" },
};

/**
 * The factory renders its "Image position" control whenever an image field is
 * mapped and hands the choice to the mode. These modes lay out one way, so the
 * only meaningful choice is whether the image appears — and for a while they
 * ignored the prop entirely, which made "None" a control that did nothing.
 */
describe("image position", () => {
  it("shows the image on Top", () => {
    const html = renderToStaticMarkup(
      <EventCards items={[EVENT]} {...SHOW} imagePosition="top" />,
    );
    expect(html).toContain("open-house.jpg");
  });

  it("hides the image on None, for event cards", () => {
    const html = renderToStaticMarkup(
      <EventCards items={[EVENT]} {...SHOW} imagePosition="none" />,
    );
    expect(html).not.toContain("open-house.jpg");
  });

  it("hides the image on None, for people cards", () => {
    const html = renderToStaticMarkup(
      <PersonCards items={[PERSON]} {...SHOW} imagePosition="none" />,
    );
    expect(html).not.toContain("marisol.jpg");
  });

  // Dropping the image must not drop the record: an editor choosing None wants
  // a text card, not an empty one.
  it("keeps the card's text when the image is hidden", () => {
    const html = renderToStaticMarkup(
      <PersonCards items={[PERSON]} {...SHOW} imagePosition="none" />,
    );
    expect(html).toContain("Marisol Vega");
    expect(html).toContain("Senior Admissions Counselor");
  });

  // Omitting the prop is what the factory does before anyone touches the
  // control, so it has to mean "show", not "hide".
  it("shows the image when no position is given", () => {
    const html = renderToStaticMarkup(<EventCards items={[EVENT]} {...SHOW} />);
    expect(html).toContain("open-house.jpg");
  });

  it("still hides the image when the Image toggle itself is off", () => {
    const html = renderToStaticMarkup(
      <EventCards items={[EVENT]} {...SHOW} showImage={false} imagePosition="top" />,
    );
    expect(html).not.toContain("open-house.jpg");
  });
});

describe("the section shell", () => {
  it("draws the header when any of its fields is set", () => {
    const html = renderToStaticMarkup(
      <GLUListingSection eyebrow="Admissions" heading="Meet Your Counselors" subtext="Every applicant.">
        <div>grid</div>
      </GLUListingSection>,
    );
    expect(html).toContain("Admissions");
    expect(html).toContain("<h2");
    expect(html).toContain("Meet Your Counselors");
  });

  // A listing dropped under another block's heading should not carry the
  // header's bottom margin as dead space.
  it("omits the header entirely when every field is blank", () => {
    const html = renderToStaticMarkup(
      <GLUListingSection>
        <div>grid</div>
      </GLUListingSection>,
    );
    expect(html).not.toContain("<h2");
    expect(html).toContain("grid");
  });
});
