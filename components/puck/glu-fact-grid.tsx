"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Section, type LegacySectionBackground } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { Eyebrow } from "../../design-system/components/typography";
import { colors, typography, spacing } from "../../design-system/tokens";

/**
 * A labelled grid of facts about the thing the page is about.
 *
 * It exists for two reasons that a Heading plus a List could not meet.
 *
 * The first is alignment. Every GLU section draws itself inside `Section` and
 * `Container` — centred, capped at 1200px. The stock blocks use a flat 64px
 * side padding and no cap, so on a wide screen they start ~80px to the left of
 * every section around them. Mixing the two down one page reads as a layout
 * bug, which is what the program detail page looked like before this block.
 *
 * The second is that a route template cannot branch. A field absent from one
 * record but present on the next has to disappear on its own, so a row with no
 * value renders nothing rather than an empty term.
 *
 * `facts` is ordinarily bound whole — `{{ gluProgram.facts }}` — rather than
 * typed in. A prop whose entire value is a single token receives the real
 * array, so the datasource decides both the rows and their order.
 */

export type GLUFactGridProps = {
  eyebrow: string;
  heading: string;
  background: "white" | "offWhite" | "rose" | LegacySectionBackground;
  facts: { label: string; value: string }[];
};

export function GLUFactGridComponent({
  eyebrow,
  heading,
  background,
  facts,
}: GLUFactGridProps) {
  // A bound array arrives as whatever the datasource sent, so this cannot
  // assume it is an array of well-formed rows.
  const rows = (Array.isArray(facts) ? facts : []).filter(
    (f) => f && String(f.label ?? "").trim() && String(f.value ?? "").trim(),
  );

  if (rows.length === 0) return null;

  return (
    <Section background={background}>
      <Container>
        {(eyebrow || heading) && (
          <div style={{ marginBottom: spacing[8] }}>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {heading && (
              <h2
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.size4xl,
                  fontWeight: typography.weightBold,
                  color: colors.dark,
                  lineHeight: typography.lineHeightTight,
                  margin: `${spacing[2]} 0 0`,
                }}
              >
                {heading}
              </h2>
            )}
          </div>
        )}

        <dl
          style={{
            display: "grid",
            // Same auto-fit shape as the listing's expanded panel, so a fact
            // reads the same whether it is seen there or here.
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: spacing[8],
            margin: 0,
          }}
        >
          {rows.map((fact, i) => (
            <div key={`${fact.label}-${i}`}>
              <dt
                style={{
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeXs,
                  fontWeight: typography.weightSemibold,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: colors.muted,
                  marginBottom: spacing[2],
                }}
              >
                {fact.label}
              </dt>
              <dd
                style={{
                  margin: 0,
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeBase,
                  lineHeight: typography.lineHeightRelaxed,
                  color: colors.dark,
                }}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

export const gluFactGridConfig = {
  label: "GLU Fact Grid",
  ai: {
    instructions:
      "A labelled grid of facts — credits, accreditation, a code, a date. For the supporting detail on a detail page, under the main description. Bind Facts to a datasource array ({{ gluProgram.facts }}) on a route template; type rows in by hand only on a one-off page. A row with an empty label or value renders nothing, so the block is safe on a template where records differ.",
  },
  fields: {
    eyebrow: {
      type: "text",
      label: "Eyebrow",
      contentEditable: true,
      ai: { instructions: "Short kicker above the heading, 1-3 words. Optional." },
    } as any,
    heading: {
      type: "text",
      label: "Heading",
      contentEditable: true,
      ai: {
        instructions:
          "Names what the facts describe, e.g. 'Program details'. Leave empty for a bare grid.",
      },
    } as any,
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "White", value: "white" },
        { label: "Off White", value: "offWhite" },
        { label: "Light Rose", value: "rose" },
      ],
      ai: {
        instructions:
          "White unless the section above it is also white — alternate to separate them.",
      },
    } as any,
    facts: {
      type: "array",
      label: "Facts",
      arrayFields: {
        label: {
          type: "text",
          label: "Label (e.g. Accreditation)",
          ai: {
            required: true,
            instructions: "A short noun naming the fact, 1-3 words. Not a sentence and not a question.",
          },
        },
        value: {
          type: "text",
          label: "Value",
          ai: {
            required: true,
            instructions: "The fact itself, kept short — a figure, a name, a comma-separated list. A row with no value is dropped.",
          },
        },
      },
      getItemSummary: (item: { label?: string }, i?: number) =>
        item?.label || `Fact #${(i ?? 0) + 1}`,
      ai: {
        instructions:
          "Label/value rows. On a route template bind the whole field to a datasource array instead of listing rows: {{ gluProgram.facts }}. Labels are short nouns, not sentences.",
      },
    } as any,
  },
  defaultProps: {
    eyebrow: "",
    heading: "Program details",
    background: "offWhite",
    facts: [
      { label: "Degree", value: "Master's" },
      { label: "Accreditation", value: "ABET" },
      { label: "Program code", value: "AIST-MS" },
    ],
  },
  render: GLUFactGridComponent,
} as unknown as ComponentConfig<GLUFactGridProps>;
