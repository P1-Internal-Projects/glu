import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { buttonBlock } from "../components/puck/button-block";
import { GLUAccordionComponent, gluAccordionConfig } from "../components/puck/glu-accordion";
import { GLUCardGridComponent, gluCardGridConfig } from "../components/puck/glu-card-grid";
import { GLUEventHeader, gluEventHeaderConfig } from "../components/puck/glu-event-header";
import { GLUFactGridComponent, gluFactGridConfig } from "../components/puck/glu-fact-grid";
import { gluListing } from "../components/puck/glu-listing";
import { GLUPageHeroComponent, gluPageHeroConfig } from "../components/puck/glu-page-hero";
import { GLUPersonProfile, gluPersonProfileConfig } from "../components/puck/glu-person-profile";
import { GLUSlideshowComponent, gluSlideshowConfig } from "../components/puck/glu-slideshow";
import { GLUStatsBarComponent, gluStatsBarConfig } from "../components/puck/glu-stats-bar";
import {
  GLUTestimonialSliderComponent,
  gluTestimonialSliderConfig,
} from "../components/puck/glu-testimonial-slider";
import { GLUTimelineComponent, gluTimelineConfig } from "../components/puck/glu-timeline";
import { headingBlock } from "../components/puck/heading-block";
import { quoteBlock } from "../components/puck/quote-block";
import { imageBlock } from "../components/puck/image-block";

/**
 * Every field made contentEditable in this pass becomes a React element
 * (Puck's InlineTextField) instead of a plain string when the editor renders
 * it. These tests check two things per field: the config marks it
 * `contentEditable: true`, and the component still renders without throwing
 * — and shows the element's own text — when the field's value arrives as an
 * element rather than a string, exactly as it does inside the editor.
 *
 * Puck's own `ComponentConfig<Props>` types a field by its prop's declared
 * type, which is `string` throughout this codebase even for a contentEditable
 * field — the same simplification the source files themselves make. That
 * makes `field.arrayFields` and an editor-element prop value untypeable
 * without a cast, so both go through `asAny` below rather than fighting the
 * type checker over a shape Puck itself only enforces at runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asAny = (value: unknown): any => value;
const editable = (marker: string) => <span data-inline={marker}>{marker}</span>;

/** Builds `<Component {...props} />` with the editor's element-valued props, bypassing the string-only prop types. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderWith(Component: React.ComponentType<any>, props: Record<string, unknown>): string {
  return renderToStaticMarkup(React.createElement(Component, asAny(props)));
}

describe("button-block", () => {
  it("marks label contentEditable", () => {
    expect(buttonBlock.fields.label.contentEditable).toBe(true);
  });

  it("renders a string label", () => {
    const html = renderToStaticMarkup(buttonBlock.render({ label: "Learn more", href: "/a" }));
    expect(html).toContain("Learn more");
  });

  it("renders an inline-editable label element", () => {
    const html = renderToStaticMarkup(buttonBlock.render(asAny({ label: editable("edit-label"), href: "/a" })));
    expect(html).toContain("edit-label");
  });
});

describe("glu-accordion", () => {
  it("marks items.question contentEditable", () => {
    expect(asAny(gluAccordionConfig.fields.items).arrayFields.question.contentEditable).toBe(true);
  });

  const base = { eyebrow: "FAQ", heading: "Questions", background: "white" as const };

  it("renders string questions with an id derived from position, not text", () => {
    const html = renderWith(GLUAccordionComponent, {
      ...base,
      items: [{ question: "Is this long question text truncated safely?", answer: "Yes." }],
    });
    expect(html).toContain("Is this long question text truncated safely?");
    expect(html).toMatch(/id="accordion[^"]*-0"/);
  });

  it("renders an inline-editable question without throwing", () => {
    const html = renderWith(GLUAccordionComponent, {
      ...base,
      items: [{ question: editable("edit-question"), answer: "Yes." }],
    });
    expect(html).toContain("edit-question");
    expect(html).toMatch(/id="accordion[^"]*-0"/);
  });
});

describe("glu-card-grid", () => {
  it("marks cards.title and cards.linkLabel contentEditable", () => {
    const cardFields = asAny(gluCardGridConfig.fields.cards).arrayFields;
    expect(cardFields.title.contentEditable).toBe(true);
    expect(cardFields.linkLabel.contentEditable).toBe(true);
  });

  const base = { eyebrow: "E", heading: "H", subtext: "S", columns: 3 as const, background: "white" as const };
  const card = {
    description: "D",
    imageUrl: "https://example.com/x.jpg",
    linkHref: "/a",
  };

  it("renders string title and linkLabel, using the title as image alt text", () => {
    const html = renderWith(GLUCardGridComponent, {
      ...base,
      cards: [{ ...card, title: "Environmental Science", linkLabel: "Explore" }],
    });
    expect(html).toContain("Environmental Science");
    expect(html).toContain("Explore");
    expect(html).toContain('alt="Environmental Science"');
  });

  it("renders inline-editable title and linkLabel without throwing, falling back to empty alt text", () => {
    const html = renderWith(GLUCardGridComponent, {
      ...base,
      cards: [{ ...card, title: editable("edit-title"), linkLabel: editable("edit-link") }],
    });
    expect(html).toContain("edit-title");
    expect(html).toContain("edit-link");
    expect(html).toContain('alt=""');
  });
});

describe("glu-event-header", () => {
  it("marks title, summary, location and registrationLabel contentEditable, and leaves date/time fields plain", () => {
    const f = asAny(gluEventHeaderConfig.fields);
    expect(f.title.contentEditable).toBe(true);
    expect(f.summary.contentEditable).toBe(true);
    expect(f.location.contentEditable).toBe(true);
    expect(f.registrationLabel.contentEditable).toBe(true);
    expect(f.startDate.contentEditable).toBeUndefined();
    expect(f.startTime.contentEditable).toBeUndefined();
    expect(f.endTime.contentEditable).toBeUndefined();
  });

  const base = {
    eventType: "Open House",
    startDate: "2026-10-17",
    startTime: "9:00 AM",
    endTime: "3:00 PM",
    registrationUrl: "/register",
    imageUrl: "",
  };

  it("renders string title, summary, location and registrationLabel", () => {
    const html = renderWith(GLUEventHeader, {
      ...base,
      title: "Fall Open House",
      summary: "Come tour the campus.",
      location: "Visitor Center",
      registrationLabel: "Register now",
    });
    expect(html).toContain("Fall Open House");
    expect(html).toContain("Come tour the campus.");
    expect(html).toContain("Visitor Center");
    expect(html).toContain("Register now");
  });

  it("renders inline-editable title, summary, location and registrationLabel without throwing", () => {
    const html = renderWith(GLUEventHeader, {
      ...base,
      title: editable("edit-title"),
      summary: editable("edit-summary"),
      location: editable("edit-location"),
      registrationLabel: editable("edit-registration"),
    });
    expect(html).toContain("edit-title");
    expect(html).toContain("edit-summary");
    expect(html).toContain("edit-location");
    expect(html).toContain("edit-registration");
  });
});

describe("glu-fact-grid", () => {
  it("marks facts.label and facts.value contentEditable", () => {
    const factFields = asAny(gluFactGridConfig.fields.facts).arrayFields;
    expect(factFields.label.contentEditable).toBe(true);
    expect(factFields.value.contentEditable).toBe(true);
  });

  const base = { eyebrow: "", heading: "Program details", background: "white" as const };

  it("renders string label/value rows", () => {
    const html = renderWith(GLUFactGridComponent, { ...base, facts: [{ label: "Degree", value: "Master's" }] });
    expect(html).toContain("Degree");
    expect(html).toContain("Master&#x27;s");
  });

  it("keeps an inline-editable row rather than dropping it as empty", () => {
    const html = renderWith(GLUFactGridComponent, {
      ...base,
      facts: [{ label: editable("edit-label"), value: editable("edit-value") }],
    });
    expect(html).toContain("edit-label");
    expect(html).toContain("edit-value");
  });

  it("still drops a row with a genuinely blank string value", () => {
    const html = renderWith(GLUFactGridComponent, { ...base, facts: [{ label: "Degree", value: "  " }] });
    expect(html).toBe("");
  });
});

describe("glu-listing", () => {
  it("marks eyebrow and subtext contentEditable", () => {
    expect(asAny(gluListing.fields).eyebrow.contentEditable).toBe(true);
    expect(asAny(gluListing.fields).subtext.contentEditable).toBe(true);
  });

  it("renders string eyebrow and subtext", () => {
    const html = renderToStaticMarkup(
      gluListing.render({
        ...gluListing.defaultProps,
        eyebrow: "Meet the team",
        subtext: "Our counselors are here to help.",
      }),
    );
    expect(html).toContain("Meet the team");
    expect(html).toContain("Our counselors are here to help.");
  });

  it("renders inline-editable eyebrow and subtext without throwing", () => {
    const html = renderToStaticMarkup(
      gluListing.render({
        ...gluListing.defaultProps,
        eyebrow: editable("edit-eyebrow"),
        subtext: editable("edit-subtext"),
      }),
    );
    expect(html).toContain("edit-eyebrow");
    expect(html).toContain("edit-subtext");
  });
});

describe("glu-page-hero", () => {
  it("marks breadcrumbs.label contentEditable", () => {
    expect(asAny(gluPageHeroConfig.fields.breadcrumbs).arrayFields.label.contentEditable).toBe(true);
  });

  const base = { eyebrow: "E", heading: "H", backgroundImageUrl: "" };

  it("renders string breadcrumb labels", () => {
    const html = renderWith(GLUPageHeroComponent, { ...base, breadcrumbs: [{ label: "Home", href: "/" }] });
    expect(html).toContain("Home");
  });

  it("renders an inline-editable breadcrumb label without throwing", () => {
    const html = renderWith(GLUPageHeroComponent, {
      ...base,
      breadcrumbs: [{ label: editable("edit-crumb"), href: "/" }],
    });
    expect(html).toContain("edit-crumb");
  });
});

describe("glu-person-profile", () => {
  it("marks the display-text fields contentEditable and leaves link/contact fields plain", () => {
    const f = asAny(gluPersonProfileConfig.fields);
    for (const key of [
      "name",
      "pronouns",
      "role",
      "focusArea",
      "territory",
      "languages",
      "officeLocation",
      "officeHours",
      "bookingLabel",
      "bio",
    ]) {
      expect(f[key].contentEditable).toBe(true);
    }
    for (const key of ["email", "phone", "bookingUrl", "photoUrl"]) {
      expect(f[key].contentEditable).toBeUndefined();
    }
  });

  const base = {
    email: "",
    phone: "",
    // Non-empty so the booking button — and therefore bookingLabel — renders;
    // ContactCard hides the whole actions row when there is neither a
    // bookingUrl nor an email.
    bookingUrl: "/visit/open-house",
    photoUrl: "",
    layout: "split" as const,
    background: "white" as const,
    photoShape: "rounded" as const,
  };

  it("renders string fields, using the name as photo alt text only when a photo is set", () => {
    const html = renderWith(GLUPersonProfile, {
      ...base,
      name: "Marisol Vega",
      pronouns: "she/her",
      role: "Senior Admissions Counselor",
      focusArea: "Transfer applicants",
      territory: "Midwest",
      languages: "English, Spanish",
      officeLocation: "Visitor Center, Room 120",
      officeHours: "Wednesdays 1-4 PM",
      bookingLabel: "Schedule a conversation",
      bio: "Marisol has worked in admissions for a decade.",
    });
    expect(html).toContain("Marisol Vega");
    expect(html).toContain("she/her");
    expect(html).toContain("Senior Admissions Counselor");
    expect(html).toContain("Transfer applicants");
    expect(html).toContain("Midwest");
    expect(html).toContain("English, Spanish");
    expect(html).toContain("Visitor Center, Room 120");
    expect(html).toContain("Wednesdays 1-4 PM");
    expect(html).toContain("Schedule a conversation");
    expect(html).toContain("Marisol has worked in admissions for a decade.");
  });

  it("renders inline-editable fields without throwing", () => {
    const html = renderWith(GLUPersonProfile, {
      ...base,
      name: editable("edit-name"),
      pronouns: editable("edit-pronouns"),
      role: editable("edit-role"),
      focusArea: editable("edit-focus"),
      territory: editable("edit-territory"),
      languages: editable("edit-languages"),
      officeLocation: editable("edit-office"),
      officeHours: editable("edit-hours"),
      bookingLabel: editable("edit-booking"),
      bio: editable("edit-bio"),
    });
    for (const marker of [
      "edit-name",
      "edit-pronouns",
      "edit-role",
      "edit-focus",
      "edit-territory",
      "edit-languages",
      "edit-office",
      "edit-hours",
      "edit-booking",
      "edit-bio",
    ]) {
      expect(html).toContain(marker);
    }
  });
});

describe("glu-slideshow", () => {
  it("marks slides.heading and slides.subtext contentEditable", () => {
    const slideFields = asAny(gluSlideshowConfig.fields.slides).arrayFields;
    expect(slideFields.heading.contentEditable).toBe(true);
    expect(slideFields.subtext.contentEditable).toBe(true);
  });

  const base = { autoPlay: false, interval: 5, height: "lg" as const };
  const slide = { imageUrl: "https://example.com/slide.jpg" };

  it("renders string heading/subtext, using the heading as image alt text", () => {
    const html = renderWith(GLUSlideshowComponent, {
      ...base,
      slides: [{ ...slide, heading: "Campus", subtext: "A lakeside campus." }],
    });
    expect(html).toContain("Campus");
    expect(html).toContain("A lakeside campus.");
    expect(html).toContain('alt="Campus"');
  });

  it("renders inline-editable heading/subtext without throwing, falling back to empty alt text", () => {
    const html = renderWith(GLUSlideshowComponent, {
      ...base,
      slides: [{ ...slide, heading: editable("edit-heading"), subtext: editable("edit-subtext") }],
    });
    expect(html).toContain("edit-heading");
    expect(html).toContain("edit-subtext");
    expect(html).toContain('alt=""');
  });
});

describe("glu-stats-bar", () => {
  it("marks stats.value and stats.label contentEditable", () => {
    const statFields = asAny(gluStatsBarConfig.fields.stats).arrayFields;
    expect(statFields.value.contentEditable).toBe(true);
    expect(statFields.label.contentEditable).toBe(true);
  });

  const base = { heading: "By the numbers", background: "crimson" as const };

  it("renders string value/label", () => {
    const html = renderWith(GLUStatsBarComponent, { ...base, stats: [{ value: "15,000", label: "Students" }] });
    expect(html).toContain("15,000");
    expect(html).toContain("Students");
  });

  it("renders inline-editable value/label without throwing", () => {
    const html = renderWith(GLUStatsBarComponent, {
      ...base,
      stats: [{ value: editable("edit-value"), label: editable("edit-label") }],
    });
    expect(html).toContain("edit-value");
    expect(html).toContain("edit-label");
  });
});

describe("glu-testimonial-slider", () => {
  it("marks testimonials.quote, .name and .program contentEditable", () => {
    const f = asAny(gluTestimonialSliderConfig.fields.testimonials).arrayFields;
    expect(f.quote.contentEditable).toBe(true);
    expect(f.name.contentEditable).toBe(true);
    expect(f.program.contentEditable).toBe(true);
  });

  const base = { eyebrow: "Stories", heading: "Hear From Our Students" };
  const testimonial = { imageUrl: "https://example.com/headshot.jpg" };

  it("renders string quote/name/program, using the name as the photo alt text", () => {
    const html = renderWith(GLUTestimonialSliderComponent, {
      ...base,
      testimonials: [{ ...testimonial, quote: "It changed my life.", name: "Maya Chen", program: "Environmental Science" }],
    });
    expect(html).toContain("It changed my life.");
    expect(html).toContain("Maya Chen");
    expect(html).toContain("Environmental Science");
    expect(html).toContain('alt="Maya Chen"');
  });

  it("renders inline-editable quote/name/program without throwing, falling back to empty alt text", () => {
    const html = renderWith(GLUTestimonialSliderComponent, {
      ...base,
      testimonials: [
        { ...testimonial, quote: editable("edit-quote"), name: editable("edit-name"), program: editable("edit-program") },
      ],
    });
    expect(html).toContain("edit-quote");
    expect(html).toContain("edit-name");
    expect(html).toContain("edit-program");
    expect(html).toContain('alt=""');
  });
});

describe("glu-timeline", () => {
  it("marks items.year and items.title contentEditable", () => {
    const f = asAny(gluTimelineConfig.fields.items).arrayFields;
    expect(f.year.contentEditable).toBe(true);
    expect(f.title.contentEditable).toBe(true);
  });

  const base = { eyebrow: "History", heading: "A Legacy of Excellence" };

  it("renders string year/title", () => {
    const html = renderWith(GLUTimelineComponent, {
      ...base,
      items: [{ year: "1887", title: "University Founded", description: "Founded." }],
    });
    expect(html).toContain("1887");
    expect(html).toContain("University Founded");
  });

  it("renders inline-editable year/title without throwing", () => {
    const html = renderWith(GLUTimelineComponent, {
      ...base,
      items: [{ year: editable("edit-year"), title: editable("edit-title"), description: "Founded." }],
    });
    expect(html).toContain("edit-year");
    expect(html).toContain("edit-title");
  });
});

describe("heading-block", () => {
  it("marks title contentEditable", () => {
    expect(headingBlock.fields.title.contentEditable).toBe(true);
  });

  it("renders a string title, and hides itself when the string is blank", () => {
    expect(renderToStaticMarkup(headingBlock.render({ title: "A heading", level: "h2" }))).toContain("A heading");
    expect(headingBlock.render({ title: "   ", level: "h2" })).toBeNull();
  });

  it("renders an inline-editable title without throwing, and never hides it as blank", () => {
    const el = headingBlock.render(asAny({ title: editable("edit-heading"), level: "h2" }));
    expect(el).not.toBeNull();
    expect(renderToStaticMarkup(el)).toContain("edit-heading");
  });
});

describe("quote-block", () => {
  it("marks quote and attribution contentEditable", () => {
    expect(quoteBlock.fields.quote.contentEditable).toBe(true);
    expect(quoteBlock.fields.attribution.contentEditable).toBe(true);
  });

  it("renders string quote/attribution", () => {
    const html = renderToStaticMarkup(quoteBlock.render({ quote: "A short quote.", attribution: "Marisol Vega" }));
    expect(html).toContain("A short quote.");
    expect(html).toContain("Marisol Vega");
  });

  it("renders inline-editable quote/attribution without throwing", () => {
    const html = renderToStaticMarkup(
      quoteBlock.render(asAny({ quote: editable("edit-quote"), attribution: editable("edit-attribution") })),
    );
    expect(html).toContain("edit-quote");
    expect(html).toContain("edit-attribution");
  });
});

describe("image-block", () => {
  it("marks caption contentEditable", () => {
    expect(imageBlock.fields.caption.contentEditable).toBe(true);
  });

  it("renders a string caption", () => {
    const html = renderToStaticMarkup(
      imageBlock.render({ src: "https://example.com/x.jpg", alt: "A photo", caption: "A caption.", loading: "lazy" }),
    );
    expect(html).toContain("A caption.");
  });

  it("renders an inline-editable caption without throwing", () => {
    const html = renderToStaticMarkup(
      imageBlock.render(
        asAny({ src: "https://example.com/x.jpg", alt: "A photo", caption: editable("edit-caption"), loading: "lazy" }),
      ),
    );
    expect(html).toContain("edit-caption");
  });
});
