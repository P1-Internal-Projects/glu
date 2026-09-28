"use client";

import React, { useState } from "react";
import type { ComponentConfig, RichText } from "@puckeditor/core";
import { Eyebrow } from "../../design-system/components/typography";
import { Section, type LegacySectionBackground } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { colors, typography, spacing, radii } from "../../design-system/tokens";
import { richTextProps } from "./rich-text-props";
import { BACKGROUND_AI, EYEBROW_AI } from "../../lib/ai-hints";

export type GLUAccordionProps = {
  eyebrow: string;
  heading: string;
  background: "white" | "offWhite" | "rose" | LegacySectionBackground;
  items: { question: string; answer: RichText }[];
};

function AccordionItem({ question, answer }: { question: string; answer: RichText }) {
  const [open, setOpen] = useState(false);
  const id = `accordion-${question.slice(0, 20).replace(/\s/g, "-")}`;

  return (
    <div
      style={{
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `${spacing[5]} 0`,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left" as const,
          gap: spacing[4],
        }}
      >
        <span
          style={{
            fontFamily: typography.fontBody,
            fontSize: typography.sizeLg,
            fontWeight: typography.weightSemibold,
            color: colors.dark,
            lineHeight: typography.lineHeightSnug,
          }}
        >
          {question}
        </span>
        <span
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: radii.full,
            backgroundColor: open ? colors.crimson : colors.rose,
            color: open ? colors.white : colors.crimson,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            transition: "background-color 0.2s",
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        id={id}
        role="region"
        aria-hidden={!open}
        style={{
          maxHeight: open ? "500px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div
          style={{
            fontFamily: typography.fontBody,
            fontSize: typography.sizeBase,
            color: colors.muted,
            lineHeight: typography.lineHeightRelaxed,
            margin: `0 0 ${spacing[5]}`,
            paddingRight: spacing[8],
          }}
          {...richTextProps(answer)}
        />
      </div>
    </div>
  );
}

export function GLUAccordionComponent({ eyebrow, heading, background, items }: GLUAccordionProps) {
  return (
    <Section background={background}>
      <Container>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {eyebrow && (
            <Eyebrow style={{ marginBottom: spacing[3] }}>{eyebrow}</Eyebrow>
          )}
          <h2
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.size3xl,
              fontWeight: typography.weightBold,
              color: colors.dark,
              lineHeight: typography.lineHeightTight,
              margin: `0 0 ${spacing[8]}`,
            }}
          >
            {heading}
          </h2>
          <div style={{ borderTop: `1px solid ${colors.border}` }}>
            {items.map((item, i) => (
              <AccordionItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export const gluAccordionConfig = {
  label: "GLU Accordion",
  ai: {
    instructions: "FAQ accordion — use for program details, admission requirements, or policies. Group related Q&A items together.",
  },
  fields: {
    eyebrow: {
      type: "text",
      label: "Eyebrow",
      contentEditable: true,
      ai: EYEBROW_AI,
    } as any,
    heading: {
      type: "textarea",
      label: "Heading",
      contentEditable: true,
      ai: { required: true, instructions: "Names what the questions are about, e.g. 'Frequently Asked Questions' or 'Questions I hear most often'." },
    } as any,
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "White", value: "white" },
        { label: "Off White", value: "offWhite" },
        { label: "Light Rose", value: "rose" },
      ],
      ai: BACKGROUND_AI,
    },
    items: {
      type: "array",
      label: "FAQ Items",
      ai: { instructions: "3–6 question/answer pairs, one topic each, most common question first." },
      arrayFields: {
        question: {
          type: "text",
          label: "Question",
          ai: { required: true, instructions: "A question a prospective student actually asks, in their words, ending with ?" },
        },
        answer: {
          type: "richtext",
          label: "Answer",
          ai: { required: true, instructions: "2–4 sentences with specifics — dates, numbers, the office to contact. Plain prose; no headings." },
        },
      },
      getItemSummary: (item: { question?: string }, i?: number) => item?.question || `Item #${(i ?? 0) + 1}`,
    },
  },
  defaultProps: {
    eyebrow: "Admissions FAQ",
    heading: "Frequently Asked Questions",
    background: "offWhite",
    items: [
      {
        question: "What GPA do I need to be admitted to Grand Lakes?",
        answer: "The middle 50% of admitted students have a GPA between 3.5 and 4.0 on a 4.0 scale. We review applications holistically, so a strong GPA is just one of many factors we consider.",
      },
      {
        question: "Is the SAT/ACT required?",
        answer: "Grand Lakes University has adopted a test-optional policy through Fall 2027. You may submit scores if you feel they strengthen your application, but they are not required.",
      },
      {
        question: "When will I receive my admissions decision?",
        answer: "Early Action applicants receive decisions by December 15. Regular Decision applicants receive decisions by March 1. Transfer applicants are notified on a rolling basis beginning in April.",
      },
      {
        question: "Can I apply to more than one college within the university?",
        answer: "Yes — you may apply to up to three colleges or programs. Your primary choice should reflect your strongest interest, as you will be considered for that college first.",
      },
    ],
  },
  render: GLUAccordionComponent,
} as ComponentConfig<GLUAccordionProps>;
