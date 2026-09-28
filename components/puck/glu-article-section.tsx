"use client";

import React from "react";
import { DropZone } from "@puckeditor/core";
import type { ComponentConfig, Slot } from "@puckeditor/core";
import { Section, type LegacySectionBackground } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { Eyebrow } from "../../design-system/components/typography";
import { colors, spacing, typography } from "../../design-system/tokens";
import { EYEBROW_AI } from "../../lib/ai-hints";

/**
 * A band of long-form content that owns its own column.
 *
 * Every other GLU section draws `Section` + `Container` and is closed: the
 * blocks inside it are fixed by the component. The body blocks — Paragraph,
 * Heading, Media Figure, Quote — draw neither, and each picks its own width
 * (Paragraph at `max-w-prose`, Media Figure at `max-w-4xl`). Stacked straight
 * onto a page they do not line up with each other or with the sections above
 * and below, which is what makes an article built from them read as a pile of
 * widgets rather than a page.
 *
 * This section closes that gap by being the one thing that owns the measure.
 * Children are dropped into a slot and inherit the column, the background and
 * the rhythm; none of them has to know where it is. `allow` keeps the palette
 * to body blocks, so the "add" menu inside an article offers Paragraph and
 * Media Figure rather than another Hero.
 *
 * Text stays at a readable measure even when the section is wide — `wide`
 * widens the column for imagery, not for prose, because a 1000px line of body
 * copy is harder to read, not easier.
 */

export type GLUArticleSectionProps = {
  eyebrow: string;
  heading: string;
  background: "white" | "offWhite" | "rose" | LegacySectionBackground;
  width: "prose" | "wide";
  body: Slot;
};

/**
 * The column each width setting draws in, centred in the Container.
 *
 * "Reading" is 65ch — deliberately the same value as Tailwind's `max-w-prose`,
 * which ParagraphBlock carries. In a wide section the heading uses this measure
 * while the copy keeps its own, so any difference between the two shows up as
 * two left edges a few pixels apart. Keeping one number is what stops them
 * drifting.
 *
 * "Wide" is the full container, for a section carrying imagery rather than
 * prose. Both are centred: an off-centre column inside a centred container
 * reads as a mistake, which is exactly how the first version of this looked.
 */
const COLUMN = { prose: "65ch", wide: "100%" } as const;

/**
 * Blocks that belong inside an article.
 *
 * Deliberately excludes every GLU section: those draw their own `Section`, so
 * nesting one here would put a full-bleed band with its own background inside
 * this band's container. The editor enforces this list, so it is guidance an
 * author cannot accidentally ignore.
 */
const BODY_BLOCKS = [
  "HeadingBlock",
  "ParagraphBlock",
  "MediaFigureBlock",
  "ImageBlock",
  "QuoteBlock",
  "ListBlock",
  "ButtonBlock",
  "DividerBlock",
  "SpacerBlock",
];

/**
 * The slot, whichever shape reaches this render.
 *
 * Puck hands a slot prop down as a component. The P1 editor does not: its
 * `wrapConfigForEditorPreview` merges resolved preview props over the rendered
 * ones, and its guard — `if (isValidElement(props[key])) continue` — only
 * protects React *elements*. A slot component is a function, so the merge
 * replaces it with the raw array from stored data and rendering it throws
 * "Element type is invalid … got: array", taking the whole editor down.
 *
 * A slot is a DropZone with its zone preset (see Puck's `SlotComponent` type),
 * so naming the zone renders the same children. That is the fallback: the
 * public render takes the component Puck supplies, the editor falls back to
 * the zone, and neither surface can crash on the other's shape.
 */
function SlotBody({ slot, zone }: { slot: unknown; zone: string }) {
  if (typeof slot === "function") {
    const Body = slot as React.ComponentType;
    return <Body />;
  }
  return <DropZone zone={zone} />;
}

export function GLUArticleSectionComponent({
  eyebrow,
  heading,
  background = "white",
  width = "prose",
  body,
}: Omit<GLUArticleSectionProps, "body"> & { body: unknown }) {
  const onDark = false; // The palette here is light-only; crimson is for CTAs.
  const hasHeader = Boolean(eyebrow || heading);

  return (
    <Section background={background}>
      <Container>
        {/*
          The header is always on the reading measure, never the wide column.
          It is type, and in a wide section it would otherwise stretch across
          the full container while the copy beneath it sat in a narrow centred
          block — two different left edges in the same section.
        */}
        {hasHeader && (
          <div style={{ maxWidth: COLUMN.prose, margin: `0 auto ${spacing[8]}` }}>
            {eyebrow && <Eyebrow light={onDark} style={{ marginBottom: spacing[3] }}>{eyebrow}</Eyebrow>}
            {heading && (
              <h2
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.size4xl,
                  fontWeight: typography.weightBold,
                  color: colors.dark,
                  lineHeight: typography.lineHeightTight,
                  margin: 0,
                }}
              >
                {heading}
              </h2>
            )}
          </div>
        )}

        {/*
          `glu-block-pad` is the marker every body block carries (see
          block-padding.ts). The Container already owns the horizontal inset, so
          the children's own `px-16` is cancelled here rather than each block
          being taught about its parent.
        */}
        {/*
          Three overrides, all saying the same thing: inside this section, the
          section decides the width. The children were each built to stand alone
          on a bare page, so they carry their own insets and measures —
          `glu-block-pad`'s px-16, Paragraph's `max-w-prose` (~65ch) and Media
          Figure's `max-w-4xl` (896px). Left alone they disagree with the column
          and with each other, and the text and images end up on visibly
          different widths. Cancelled here rather than removed from the blocks,
          which still have to work outside a section.
        */}
        <div
          className={
            width === "prose"
              ? // The column is already the measure, so the children defer to it.
                "[&_.glu-block-pad]:px-0 [&_.max-w-prose]:max-w-none [&_.max-w-4xl]:max-w-none"
              : // Wide widens the column for imagery, NOT for prose: a 960px line
                // of body copy is harder to read, not easier. So the text keeps
                // its own measure and is centred in the wider column, while media
                // is released to fill it.
                "[&_.glu-block-pad]:px-0 [&_.max-w-prose]:mx-auto [&_.max-w-4xl]:max-w-none"
          }
          style={{ maxWidth: COLUMN[width], marginLeft: "auto", marginRight: "auto" }}
        >
          <SlotBody slot={body} zone="body" />
        </div>
      </Container>
    </Section>
  );
}

export const gluArticleSectionConfig = {
  label: "GLU Article Section",
  ai: {
    instructions:
      "A band of long-form content. Use for body copy on basic pages and blog posts, instead of stacking Paragraph and Media Figure blocks straight onto the page — this owns the reading column so they line up. Add Paragraph, Heading, Media Figure and Quote blocks inside it. Alternate background with neighbouring sections.",
  },
  fields: {
    eyebrow: {
      type: "text",
      label: "Eyebrow",
      contentEditable: true,
      ai: EYEBROW_AI,
    },
    heading: {
      type: "textarea",
      label: "Heading",
      contentEditable: true,
      ai: { instructions: "The section's topic, 3–6 words. Leave blank to run body copy on with no header." },
    },
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "White", value: "white" },
        { label: "Off White", value: "offWhite" },
        { label: "Light Rose", value: "rose" },
      ],
      ai: { instructions: "Alternate with the neighbouring sections so no two adjacent sections share a background." },
    },
    width: {
      type: "radio",
      label: "Column",
      options: [
        { label: "Reading", value: "prose" },
        { label: "Wide", value: "wide" },
      ],
      ai: { instructions: "prose for body copy. wide only for a section carrying full-width imagery." },
    },
    body: {
      type: "slot",
      allow: BODY_BLOCKS,
    },
  },
  defaultProps: {
    eyebrow: "",
    heading: "",
    background: "white",
    width: "prose",
    // Starts empty on purpose. It used to hold one starter ParagraphBlock, but
    // puck-css 0.16's live drawer thumbnails render defaultProps with an id on
    // the top-level block only, so that child had no id and every editor load
    // logged React's "unique key" warning from Puck's SlotRenderInternal. A
    // fixed id is not the answer: Puck keeps existing ids when inserting, so
    // every new section would share it. Restore the starter paragraph once
    // LiveThumbnail populates nested slot ids the way Puck's insert does.
    body: [],
  },
  render: GLUArticleSectionComponent,
} as unknown as ComponentConfig<GLUArticleSectionProps>;
