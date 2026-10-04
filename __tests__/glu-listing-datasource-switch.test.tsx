import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ResolvedItem } from "@pantheon-systems/puck-css/fields";
import { EventCards, gluListing } from "../components/puck/glu-listing";
import { GLUProgramCards } from "../components/puck/glu-program-cards";

/**
 * Switching a listing from one datasource to another used to rewire only
 * `items`: the view mode and the field mappings stayed behind, so counselors
 * were drawn through the program card and every mapping and eye toggle looked
 * dead. These pin the switch, the toggles, and the subtitle default.
 */

const resolve = (props: Record<string, unknown>, lastData: { props: Record<string, unknown> } | null) =>
  gluListing.resolveData({ props }, { changed: { datasourceId: true }, lastData });

const SHOW = { showTitle: true, showSubtitle: true, showTeaser: true, showImage: true, showIcon: false };

describe("switching the datasource", () => {
  it("brings the matching view mode and mappings with it", async () => {
    const { props } = await resolve(
      { datasourceId: "gluPeople", viewMode: "programCards", teaserField: "{{ item.summary }}" },
      { props: { datasourceId: "gluPrograms" } },
    );
    expect(props).toMatchObject({
      items: "{{ gluPeople.items }}",
      viewMode: "peopleCards",
      titleField: "{{ item.name }}",
      subtitleField: "{{ item.role }}",
      teaserField: "{{ item.focusArea }}",
      imageField: "{{ item.photoUrl }}",
    });
  });

  it("leaves an editor's mappings alone when the page first opens", async () => {
    // Puck has no earlier copy on a block's first resolve and reports every
    // prop as changed — that must not be read as a switch.
    const { props } = await resolve({ datasourceId: "gluPeople", subtitleField: "{{ item.email }}" }, null);
    expect(props).not.toHaveProperty("viewMode");
    expect(props).not.toHaveProperty("subtitleField");
  });

  it("leaves them alone when something else on the block changed", async () => {
    const { props } = await resolve({ datasourceId: "gluEvents" }, { props: { datasourceId: "gluEvents" } });
    expect(props).not.toHaveProperty("viewMode");
  });
});

describe("the eye toggles reach every mode", () => {
  const EVENT: ResolvedItem = {
    title: "Fall Open House", subtitle: "Open House", teaser: "", image: "", icon: "",
    _raw: { eventType: "Open House", startDate: "2026-10-17" },
  };
  const PROGRAM: ResolvedItem = {
    title: "B.A. History", subtitle: "B.A.", teaser: "", image: "", icon: "",
    _raw: { code: "HIST-BA", degreeType: "B.A.", college: "Arts & Sciences" },
  };

  it("event cards hide the subtitle pill when Subtitle is off", () => {
    const html = renderToStaticMarkup(<EventCards items={[EVENT]} {...SHOW} showSubtitle={false} />);
    expect(html).not.toContain(">Open House<");
    expect(html).toContain("Fall Open House");
  });

  it("event cards draw the mapped subtitle, not the raw event type", () => {
    const html = renderToStaticMarkup(<EventCards items={[{ ...EVENT, subtitle: "Main campus" }]} {...SHOW} />);
    expect(html).toContain(">Main campus<");
    expect(html).not.toContain(">Open House<");
  });

  it("program cards hide the title when Title is off", () => {
    const html = renderToStaticMarkup(<GLUProgramCards items={[PROGRAM]} {...SHOW} showTitle={false} />);
    expect(html).not.toContain("<h3");
  });

  it("program cards hide the degree pill when Subtitle is off", () => {
    const html = renderToStaticMarkup(<GLUProgramCards items={[PROGRAM]} {...SHOW} showSubtitle={false} />);
    expect(html).not.toContain(">B.A.<");
  });
});

describe("a block with no subtitle mapped", () => {
  it("shows the degree type in the program pill, not the guessed summary", () => {
    const html = renderToStaticMarkup(
      gluListing.render({
        datasourceId: "gluPrograms",
        viewMode: "programCards",
        titleField: "{{ item.title }}",
        showSubtitle: true,
        items: [{ code: "HIST-BA", title: "B.A. History", degreeType: "B.A.", summary: "A long paragraph.", college: "Arts" }],
      }),
    );
    expect(html).toContain(">B.A.<");
    expect(html).not.toMatch(/>A long paragraph\.</);
  });
});
