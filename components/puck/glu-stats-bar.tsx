"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { colors, typography, spacing } from "../../design-system/tokens";

export type GLUStatsBarProps = {
  heading: string;
  stats: { value: string; label: string }[];
  /**
   * Stored values predate the crimson palette and are kept because published
   * pages hold them: `navy` is crimson. `gold` rendered white and `white`
   * rendered the blush off-white until they were made to mean what they say.
   */
  background: "navy" | "crimsonDark" | "gold" | "white";
};

/** Section colour, number colour, label colour and divider per background. */
const THEMES: Record<GLUStatsBarProps["background"], { bg: string; value: string; label: string; heading: string; divider: string }> = {
  navy: { bg: colors.crimson, value: colors.gold, label: "rgba(255,255,255,0.8)", heading: colors.white, divider: "rgba(255,255,255,0.15)" },
  crimsonDark: { bg: colors.crimsonDark, value: colors.gold, label: "rgba(255,255,255,0.8)", heading: colors.white, divider: "rgba(255,255,255,0.15)" },
  // Dark text throughout: white on gold is about 2.6:1.
  gold: { bg: colors.gold, value: colors.crimsonDark, label: colors.dark, heading: colors.dark, divider: "rgba(26,5,5,0.2)" },
  white: { bg: colors.white, value: colors.crimson, label: colors.muted, heading: colors.muted, divider: colors.border },
};

export function GLUStatsBarComponent({ heading, stats, background }: GLUStatsBarProps) {
  const theme = THEMES[background] ?? THEMES.navy;

  return (
    <Section paddingY={spacing[12]} style={{ backgroundColor: theme.bg }}>
      <Container>
        {heading && (
          <p
            style={{
              fontFamily: typography.fontBody,
              fontSize: typography.sizeSm,
              fontWeight: typography.weightSemibold,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: theme.heading,
              textAlign: "center" as const,
              margin: `0 0 ${spacing[8]}`,
            }}
          >
            {heading}
          </p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
            gap: 0,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: "center" as const,
                padding: `${spacing[4]} ${spacing[6]}`,
                borderRight: i < stats.length - 1 ? `1px solid ${theme.divider}` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.size4xl,
                  fontWeight: typography.weightBold,
                  color: theme.value,
                  lineHeight: 1,
                  marginBottom: spacing[2],
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeSm,
                  color: theme.label,
                  lineHeight: typography.lineHeightNormal,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export const gluStatsBarConfig = {
  label: "GLU Stats Bar",
  ai: {
    instructions: "Stats bar — place after hero to highlight key metrics. Max 4 stats. Use navy background for emphasis.",
  },
  fields: {
    heading: {
      type: "text",
      label: "Section Heading (optional)",
      contentEditable: true,
      ai: { instructions: "Short framing line, e.g. 'Grand Lakes by the Numbers'. Leave blank directly under a hero." },
    } as any,
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "Crimson", value: "navy" },
        { label: "Deep Crimson", value: "crimsonDark" },
        { label: "Gold", value: "gold" },
        { label: "White", value: "white" },
      ],
      ai: { instructions: "navy (crimson) straight after a hero; crimsonDark next to another crimson section; white between light sections; gold sparingly." },
    },
    stats: {
      type: "array",
      label: "Stats",
      ai: { instructions: "Exactly 3 or 4 figures, only ones that are true of Grand Lakes." },
      arrayFields: {
        value: { type: "text", label: "Value (e.g. 15,000)", ai: { required: true, instructions: "The number as displayed, with its unit: '15,000', '42%', '$450M', '120+'." } },
        label: { type: "text", label: "Label (e.g. Students)", ai: { required: true, instructions: "2–3 word noun phrase, e.g. 'Enrolled Students'." } },
      },
      getItemSummary: (item: { label?: string }, i?: number) => item?.label || `Item #${(i ?? 0) + 1}`,
    },
  },
  defaultProps: {
    heading: "Grand Lakes by the Numbers",
    background: "navy",
    stats: [
      { value: "15,000", label: "Enrolled Students" },
      { value: "42%", label: "Acceptance Rate" },
      { value: "120+", label: "Degree Programs" },
      { value: "$450M", label: "Annual Research Funding" },
    ],
  },
  render: GLUStatsBarComponent,
} as ComponentConfig<GLUStatsBarProps>;
