"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { colors, typography, spacing } from "../../design-system/tokens";

export type GLUStatsBarProps = {
  heading: string;
  stats: { value: string; label: string }[];
  background: "navy" | "gold" | "white";
};

export function GLUStatsBarComponent({ heading, stats, background }: GLUStatsBarProps) {
  const isNavy = background === "navy";
  const isGold = background === "gold";

  const bgMap = { navy: "navy", gold: "white", white: "offWhite" } as const;
  const valuColor = isNavy ? colors.gold : isGold ? colors.crimson : colors.crimson;
  const labelColor = isNavy ? "rgba(255,255,255,0.8)" : colors.muted;
  const dividerColor = isNavy ? "rgba(255,255,255,0.15)" : colors.border;

  return (
    <Section background={bgMap[background]} paddingY={spacing[12]}>
      <Container>
        {heading && (
          <p
            style={{
              fontFamily: typography.fontBody,
              fontSize: typography.sizeSm,
              fontWeight: typography.weightSemibold,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: isNavy ? colors.white : colors.muted,
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
                borderRight: i < stats.length - 1 ? `1px solid ${dividerColor}` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.size4xl,
                  fontWeight: typography.weightBold,
                  color: valuColor,
                  backgroundColor: isNavy ? colors.crimson : isGold ? colors.white : colors.offWhite,
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
                  color: labelColor,
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
        { label: "Gold Accent", value: "gold" },
        { label: "White", value: "white" },
      ],
      ai: { instructions: "navy straight after a hero; white between light sections; gold sparingly." },
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
