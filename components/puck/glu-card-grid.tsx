"use client";

import React from "react";
import Image from "next/image";
import type { ComponentConfig } from "@puckeditor/core";
import { Card } from "../../design-system/components/card";
import { Eyebrow } from "../../design-system/components/typography";
import { Section } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { colors, typography, spacing } from "../../design-system/tokens";

export type GLUCardGridProps = {
  eyebrow: string;
  heading: string;
  subtext: string;
  columns: 3 | 4;
  background: "white" | "offWhite" | "lightBlue";
  cards: {
    title: string;
    description: string;
    imageUrl: string;
    linkHref: string;
    linkLabel: string;
  }[];
};

export function GLUCardGridComponent({ eyebrow, heading, subtext, columns, background, cards }: GLUCardGridProps) {
  return (
    <Section background={background}>
      <Container>
        {/* Header */}
        <div style={{ textAlign: "center" as const, maxWidth: 680, margin: `0 auto ${spacing[12]}` }}>
          {eyebrow && (
            <Eyebrow style={{ marginBottom: spacing[3] }}>{eyebrow}</Eyebrow>
          )}
          <h2
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.size4xl,
              fontWeight: typography.weightBold,
              color: colors.dark,
              lineHeight: typography.lineHeightTight,
              margin: `0 0 ${spacing[4]}`,
            }}
          >
            {heading}
          </h2>
          {subtext && (
            <p
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeLg,
                color: colors.muted,
                lineHeight: typography.lineHeightRelaxed,
                margin: 0,
              }}
            >
              {subtext}
            </p>
          )}
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: spacing[6],
          }}
        >
          {cards.map((card, i) => (
            <Card key={i}>
              {card.imageUrl && (
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                  <Image
                    src={card.imageUrl}
                    alt={card.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes={`(max-width: 768px) 100vw, ${Math.round(100 / columns)}vw`}
                  />
                </div>
              )}
              <div style={{ padding: spacing[6] }}>
                <h3
                  style={{
                    fontFamily: typography.fontHeading,
                    fontSize: typography.sizeXl,
                    fontWeight: typography.weightBold,
                    color: colors.dark,
                    lineHeight: typography.lineHeightSnug,
                    margin: `0 0 ${spacing[3]}`,
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: typography.fontBody,
                    fontSize: typography.sizeSm,
                    color: colors.muted,
                    lineHeight: typography.lineHeightRelaxed,
                    margin: `0 0 ${spacing[4]}`,
                  }}
                >
                  {card.description}
                </p>
                {card.linkLabel && (
                  <a
                    href={card.linkHref}
                    style={{
                      fontFamily: typography.fontBody,
                      fontSize: typography.sizeSm,
                      fontWeight: typography.weightSemibold,
                      color: colors.blue,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: spacing[1],
                    }}
                  >
                    {card.linkLabel} →
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export const gluCardGridConfig = {
  label: "GLU Card Grid",
  ai: {
    instructions: "Card grid for programs, departments, or news. Use 3 columns for feature cards, 4 for compact listings.",
  },
  fields: {
    eyebrow: {
      type: "text",
      label: "Eyebrow",
      contentEditable: true,
    } as any,
    heading: {
      type: "textarea",
      label: "Heading",
      contentEditable: true,
      ai: { required: true },
    } as any,
    subtext: {
      type: "textarea",
      label: "Subtext",
      contentEditable: true,
    } as any,
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "3 Columns", value: 3 },
        { label: "4 Columns", value: 4 },
      ],
    },
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "White", value: "white" },
        { label: "Off White", value: "offWhite" },
        { label: "Light Rose", value: "lightBlue" },
      ],
    },
    cards: {
      type: "array",
      label: "Cards",
      arrayFields: {
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        imageUrl: { type: "text", label: "Image URL" },
        linkHref: { type: "text", label: "Link URL" },
        linkLabel: { type: "text", label: "Link Label" },
      },
      getItemSummary: (item: { title?: string }, i?: number) => item?.title || `Item #${(i ?? 0) + 1}`,
    },
  },
  defaultProps: {
    eyebrow: "Academics",
    heading: "Find Your Program",
    subtext: "With 120+ degree programs across 8 colleges, Grand Lakes offers the breadth of a major research university with the feel of a close-knit community.",
    columns: 3,
    background: "offWhite",
    cards: [
      {
        title: "Environmental Science",
        description: "Study ecosystems, climate change, and sustainability with direct access to the Great Lakes watershed — one of the world's most unique natural laboratories.",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        linkHref: "/academics",
        linkLabel: "Explore the program",
      },
      {
        title: "Engineering",
        description: "From aerospace to biomedical, our ABET-accredited engineering programs combine rigorous coursework with hands-on research and industry partnerships.",
        imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
        linkHref: "/academics",
        linkLabel: "Explore the program",
      },
      {
        title: "Business Administration",
        description: "The GLU Business School prepares future leaders through experiential learning, global immersion programs, and a robust alumni network.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        linkHref: "/academics",
        linkLabel: "Explore the program",
      },
    ],
  },
  render: GLUCardGridComponent,
} as ComponentConfig<GLUCardGridProps>;
