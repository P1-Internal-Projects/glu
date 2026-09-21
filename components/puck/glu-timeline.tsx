"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ComponentConfig, RichText } from "@puckeditor/core";
import { Section } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { Eyebrow } from "../../design-system/components/typography";
import { colors, typography, spacing, radii } from "../../design-system/tokens";
import { richTextProps } from "./rich-text-props";
import { EYEBROW_AI } from "../../lib/ai-hints";

export type GLUTimelineProps = {
  eyebrow: string;
  heading: string;
  items: {
    year: string;
    title: string;
    description: RichText;
  }[];
};

type EntryProps = {
  item: { year: string; title: string; description: RichText };
  index: number;
  isLast: boolean;
};

function TimelineEntry({ item, index, isLast }: EntryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delay = `${index * 0.12}s`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        gap: spacing[8],
        alignItems: "stretch",
      }}
    >
      {/* Left column: badge + connecting line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Year badge */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: radii.full,
            backgroundColor: colors.crimson,
            color: colors.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: typography.fontHeading,
            fontSize: typography.sizeXs,
            fontWeight: typography.weightBold,
            letterSpacing: "0.03em",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
            boxShadow: `0 0 0 4px ${colors.offWhite}, 0 0 0 6px ${colors.crimson}`,
          }}
        >
          {item.year}
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div
            style={{
              width: 2,
              flexGrow: 1,
              background: `linear-gradient(to bottom, ${colors.crimson}, ${colors.crimson}33)`,
              marginTop: spacing[2],
              minHeight: 40,
            }}
          />
        )}
      </div>

      {/* Right column: animated content */}
      <div
        ref={ref}
        style={{
          paddingBottom: isLast ? 0 : spacing[12],
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(32px)",
          transition: `opacity 0.65s ease ${delay}, transform 0.65s ease ${delay}`,
        }}
      >
        {/* Horizontal rule from badge to content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing[4],
            marginBottom: spacing[3],
            marginTop: spacing[4],
          }}
        >
          <div style={{ height: 2, width: 32, backgroundColor: colors.gold, flexShrink: 0 }} />
          <h3
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.size2xl,
              fontWeight: typography.weightBold,
              color: colors.dark,
              margin: 0,
              lineHeight: typography.lineHeightTight,
            }}
          >
            {item.title}
          </h3>
        </div>
        <div
          style={{
            fontFamily: typography.fontBody,
            fontSize: typography.sizeBase,
            color: colors.muted,
            lineHeight: typography.lineHeightRelaxed,
            margin: 0,
            maxWidth: 560,
          }}
          {...richTextProps(item.description)}
        />
      </div>
    </div>
  );
}

export function GLUTimelineComponent({ eyebrow, heading, items }: GLUTimelineProps) {
  return (
    <Section background="white">
      <Container>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: spacing[16] }}>
          {eyebrow && <Eyebrow style={{ marginBottom: spacing[3] }}>{eyebrow}</Eyebrow>}
          <h2
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.size4xl,
              fontWeight: typography.weightBold,
              color: colors.dark,
              margin: 0,
              lineHeight: typography.lineHeightTight,
            }}
          >
            {heading}
          </h2>
        </div>

        {/* Timeline entries */}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {items.map((item, i) => (
            <TimelineEntry key={i} item={item} index={i} isLast={i === items.length - 1} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export const gluTimelineConfig = {
  label: "GLU Timeline",
  ai: {
    instructions: "Timeline — use for history, milestones, or multi-step processes. Each item needs a year, title, and description.",
  },
  fields: {
    eyebrow: { type: "text", label: "Eyebrow", contentEditable: true, ai: EYEBROW_AI } as any,
    heading: {
      type: "textarea",
      label: "Heading",
      contentEditable: true,
      ai: { required: true, instructions: "What the sequence tells, e.g. 'A Legacy of Excellence' or 'Your Path to Enrollment'." },
    } as any,
    items: {
      type: "array",
      label: "Timeline Items",
      ai: { instructions: "4–6 items in chronological order, earliest first." },
      arrayFields: {
        year: { type: "text", label: "Year", ai: { required: true, instructions: "A four-digit year, or a short date or step label such as 'Nov 1' or 'Step 1'." } },
        title: { type: "text", label: "Title", ai: { required: true, instructions: "2–5 words." } },
        description: { type: "richtext", label: "Description", ai: { instructions: "1–2 sentences on what happened or what to do." } },
      },
      getItemSummary: (item: { title?: string }, i?: number) => item?.title || `Item #${(i ?? 0) + 1}`,
    },
  },
  defaultProps: {
    eyebrow: "Our History",
    heading: "A Legacy of Excellence",
    items: [
      {
        year: "1887",
        title: "University Founded",
        description: "Grand Lakes University was established by the Michigan Legislature as the state's flagship public research institution, welcoming its first class of 212 students to the shores of the Great Lakes.",
      },
      {
        year: "1923",
        title: "Great Lakes Research Institute",
        description: "GLU founded the Great Lakes Research Institute, launching a century of landmark environmental science. The institute's early studies of lake ecology set federal water-quality standards still in use today.",
      },
      {
        year: "1957",
        title: "College of Engineering Opens",
        description: "Responding to the postwar technology boom, GLU opened its College of Engineering with support from Michigan's auto industry. Within a decade it ranked among the top ten public engineering programs nationally.",
      },
      {
        year: "1969",
        title: "Integration & Expansion",
        description: "Following a landmark diversity initiative, GLU's student body doubled in a decade. The university expanded its scholarship programs and opened five new residence halls to welcome students from across the country.",
      },
      {
        year: "2001",
        title: "$1 Billion Research Milestone",
        description: "GLU became the first Michigan university to surpass $1 billion in annual research expenditures, cementing its place among the top tier of American research institutions.",
      },
      {
        year: "2024",
        title: "Today",
        description: "With 15,000 undergraduates, 120+ degree programs, and $450M in annual research funding, Grand Lakes University continues to shape the future of science, business, and public service.",
      },
    ],
  },
  render: GLUTimelineComponent,
} as ComponentConfig<GLUTimelineProps>;
