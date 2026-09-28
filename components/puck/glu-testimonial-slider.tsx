"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { ComponentConfig } from "@puckeditor/core";
import { Eyebrow } from "../../design-system/components/typography";
import { Section } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { colors, typography, spacing, radii } from "../../design-system/tokens";
import { EYEBROW_AI, imageAi } from "../../lib/ai-hints";

export type GLUTestimonialSliderProps = {
  eyebrow: string;
  heading: string;
  testimonials: {
    quote: string;
    name: string;
    program: string;
    imageUrl: string;
  }[];
};

export function GLUTestimonialSliderComponent({ eyebrow, heading, testimonials }: GLUTestimonialSliderProps) {
  const [current, setCurrent] = useState(0);
  const count = testimonials.length;

  const prev = () => setCurrent((c) => (c - 1 + count) % count);
  const next = () => setCurrent((c) => (c + 1) % count);

  const t = testimonials[current];
  if (!t) return <div />;


  return (
    <Section background="crimson">
      <Container>
        <div style={{ textAlign: "center" as const, maxWidth: 720, margin: "0 auto" }}>
          {eyebrow && (
            <Eyebrow light style={{ marginBottom: spacing[4] }}>
              {eyebrow}
            </Eyebrow>
          )}
          <h2
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.size3xl,
              fontWeight: typography.weightBold,
              color: colors.white,
              lineHeight: typography.lineHeightTight,
              margin: `0 0 ${spacing[10]}`,
            }}
          >
            {heading}
          </h2>

          {/* Testimonial card */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: radii.xl,
              border: "1px solid rgba(255,255,255,0.12)",
              padding: spacing[10],
              marginBottom: spacing[8],
            }}
          >
            {t.imageUrl && (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: radii.full,
                  overflow: "hidden",
                  margin: `0 auto ${spacing[6]}`,
                  border: `3px solid ${colors.gold}`,
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={t.imageUrl}
                  alt={t.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="80px"
                />
              </div>
            )}
            <blockquote style={{ margin: 0 }}>
              <p
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.sizeXl,
                  color: colors.white,
                  lineHeight: typography.lineHeightRelaxed,
                  margin: `0 0 ${spacing[6]}`,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <p
                  style={{
                    fontFamily: typography.fontBody,
                    fontSize: typography.sizeSm,
                    fontWeight: typography.weightSemibold,
                    color: colors.white,
                    margin: 0,
                  }}
                >
                  {t.name}
                </p>
                <p
                  style={{
                    fontFamily: typography.fontBody,
                    fontSize: typography.sizeSm,
                    color: "rgba(255,255,255,0.78)",
                    margin: 0,
                  }}
                >
                  {t.program}
                </p>
              </footer>
            </blockquote>
          </div>

          {/* Controls */}
          {count > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: spacing[6] }}>
              <button
                aria-label="Previous testimonial"
                onClick={prev}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: colors.white,
                  width: 40,
                  height: 40,
                  borderRadius: radii.full,
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ‹
              </button>
              <div style={{ display: "flex", gap: spacing[2] }}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => setCurrent(i)}
                    style={{
                      width: i === current ? 24 : 8,
                      height: 8,
                      borderRadius: radii.full,
                      backgroundColor: i === current ? colors.gold : "rgba(255,255,255,0.3)",
                      border: "none",
                      cursor: "pointer",
                      transition: "width 0.3s, background-color 0.3s",
                      padding: "8px",
                      boxSizing: "content-box" as const,
                    }}
                  />
                ))}
              </div>
              <button
                aria-label="Next testimonial"
                onClick={next}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: colors.white,
                  width: 40,
                  height: 40,
                  borderRadius: radii.full,
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

export const gluTestimonialSliderConfig = {
  label: "GLU Testimonial Slider",
  ai: {
    instructions: "Testimonial carousel — place near bottom of page, above the CTA banner. Navy background. Each needs quote, name, program.",
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
      ai: { required: true, instructions: "E.g. 'Hear From Our Students' or 'Student Stories'." },
    } as any,
    testimonials: {
      type: "array",
      label: "Testimonials",
      ai: { instructions: "3–4 voices from different programs. Use real quotes when given; otherwise write plausible student voices and mark the page for review." },
      arrayFields: {
        quote: { type: "textarea", label: "Quote", ai: { required: true, instructions: "1–3 sentences in the student's own voice, with one specific detail. No quotation marks." } },
        name: { type: "text", label: "Name", ai: { required: true, instructions: "First and last name." } },
        program: { type: "text", label: "Program / Year", ai: { instructions: "'Program, Class of YYYY', e.g. 'Environmental Science, Class of 2025'." } },
        imageUrl: { type: "text", label: "Photo URL", ai: imageAi("Square headshot.") },
      },
      getItemSummary: (item: { name?: string }, i?: number) => item?.name || `Item #${(i ?? 0) + 1}`,
    },
  },
  defaultProps: {
    eyebrow: "Student Stories",
    heading: "Hear From Our Students",
    testimonials: [
      {
        quote: "The research opportunities here are unlike anything I expected. By my sophomore year I was co-authoring a paper on Great Lakes water quality with my faculty mentor.",
        name: "Maya Chen",
        program: "Environmental Science, Class of 2025",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      },
      {
        quote: "GLU's business program connected me with alumni across every industry. I had three internship offers before I even finished my junior year.",
        name: "James Okafor",
        program: "Business Administration, Class of 2024",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      },
      {
        quote: "I chose GLU for the financial aid package, but I stayed for the community. The campus is stunning and people genuinely look out for each other here.",
        name: "Sofia Reyes",
        program: "Public Health, Class of 2026",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
      },
    ],
  },
  render: GLUTestimonialSliderComponent,
} as ComponentConfig<GLUTestimonialSliderProps>;
