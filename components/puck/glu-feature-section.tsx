"use client";

import React from "react";
import Image from "next/image";
import type { ComponentConfig, RichText } from "@puckeditor/core";
import { Button } from "../../design-system/components/button";
import { Eyebrow } from "../../design-system/components/typography";
import { Section } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { colors, typography, spacing, radii, shadows } from "../../design-system/tokens";
import { richTextProps } from "./rich-text-props";
import { resolveMediaImage, type MediaImageValue } from "../../lib/media-image";
import { BACKGROUND_AI, EYEBROW_AI, buttonLabelAi, imageAi, linkAi } from "../../lib/ai-hints";

export type GLUFeatureSectionProps = {
  eyebrow: string;
  heading: string;
  body: RichText;
  ctaLabel: string;
  ctaHref: string;
  /**
   * A media-library value, or a bare URL from before this field was rich.
   * See lib/media-image.ts for why both shapes have to keep working.
   */
  imageUrl: MediaImageValue;
  imageAlt: string;
  imagePosition: "left" | "right";
  background: "white" | "offWhite" | "lightBlue";
};

export function GLUFeatureSectionComponent({
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  imageUrl,
  imageAlt,
  imagePosition,
  background,
}: GLUFeatureSectionProps) {
  const reversed = imagePosition === "left";

  /**
   * The frame is a 4:3 box drawn with `object-fit: cover`, so a height is
   * offered for the ratio. Whether it reaches the CDN is `resolveMediaImage`'s
   * call: a smart crop needs it, and a rectangle drawn in the crop dialog
   * already is the framing, so the height is dropped there rather than
   * shrinking it. 1200 wide covers the column (~520px inside a 1200px
   * container, split two ways) on a retina screen.
   *
   * Alt comes from the field when an author has written one, and from the
   * library asset otherwise, so a picture chosen with alt text already on it
   * does not arrive here unlabelled.
   */
  const image = resolveMediaImage(imageUrl, { width: 1200, height: 900 });
  const alt = imageAlt?.trim() || image.alt;

  return (
    <Section background={background}>
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: spacing[16],
            alignItems: "center",
            direction: reversed ? "rtl" : "ltr",
          }}
        >
          {/* Image */}
          <div style={{ direction: "ltr", position: "relative", borderRadius: radii.xl, overflow: "hidden", boxShadow: shadows.lg, aspectRatio: "4/3" }}>
            {image.src && (
              <Image
                src={image.src}
                alt={alt}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>

          {/* Text */}
          <div style={{ direction: "ltr" }}>
            {eyebrow && (
              <Eyebrow style={{ marginBottom: spacing[4] }}>{eyebrow}</Eyebrow>
            )}
            <h2
              style={{
                fontFamily: typography.fontHeading,
                fontSize: typography.size4xl,
                fontWeight: typography.weightBold,
                color: colors.dark,
                lineHeight: typography.lineHeightTight,
                margin: `0 0 ${spacing[6]}`,
              }}
            >
              {heading}
            </h2>
            <div
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeLg,
                color: colors.muted,
                lineHeight: typography.lineHeightRelaxed,
                margin: `0 0 ${spacing[8]}`,
                whiteSpace: "pre-line",
              }}
              {...richTextProps(body)}
            />
            {ctaLabel && (
              <Button variant="secondary" size="md" href={ctaHref}>
                {ctaLabel}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export const gluFeatureSectionConfig = {
  label: "GLU Feature Section",
  ai: {
    instructions: "Two-column text+image section. Alternate imagePosition left/right across multiple instances for visual rhythm.",
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
      ai: { required: true, instructions: "Section headline highlighting a program strength or key feature." },
    } as any,
    body: {
      type: "richtext",
      label: "Body Text",
      contentEditable: true,
      ai: { instructions: "2-3 sentences expanding on the heading. Focus on student outcomes or differentiators." },
    } as any,
    ctaLabel: {
      type: "text",
      label: "CTA Label",
      contentEditable: true,
      ai: buttonLabelAi("Explore Research", { optional: true }),
    } as any,
    ctaHref: { type: "text", label: "CTA URL", ai: linkAi("Where the button goes.", { optional: true }) },
    // The rich media field, not a URL box: it stores the asset, its alt text
    // and the crop, which is what puts "Custom…" and the crop dialog in front
    // of an editor. The name stays `imageUrl` so sections already published
    // keep their images — see lib/media-image.ts.
    //
    // `as any` because the plugin registers this field type at runtime, so it
    // is not in Puck's built-in Field union.
    imageUrl: {
      type: "p1-media",
      label: "Image",
      ai: imageAi("Photo for the image column. Crop it to 4:3 — the frame is a 4:3 box."),
    } as any,
    imageAlt: {
      type: "text",
      label: "Image Alt Text",
      ai: {
        instructions:
          "Describe the photo in one sentence. Leave blank to use the alt text stored on the library asset; fill it in to override that for this section.",
      },
    },
    imagePosition: {
      type: "select",
      label: "Image Position",
      options: [
        { label: "Right", value: "right" },
        { label: "Left", value: "left" },
      ],
      ai: { instructions: "Alternate right/left across consecutive feature sections." },
    },
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "White", value: "white" },
        { label: "Off White", value: "offWhite" },
        { label: "Light Rose", value: "lightBlue" },
      ],
      ai: BACKGROUND_AI,
    },
  },
  defaultProps: {
    eyebrow: "Research & Discovery",
    heading: "Pushing the Boundaries of Human Knowledge",
    body: "Grand Lakes University is home to 42 research centers and institutes, with particular strengths in environmental science, engineering innovation, and public health. Our students work alongside leading faculty on research that matters.",
    ctaLabel: "Explore Research",
    ctaHref: "/academics",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900&q=80",
    imageAlt: "Students working in a research laboratory",
    imagePosition: "right",
    background: "white",
  },
  render: GLUFeatureSectionComponent,
} as ComponentConfig<GLUFeatureSectionProps>;
