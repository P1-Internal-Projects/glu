"use client";

import React from "react";
import Image from "next/image";
import type { ComponentConfig } from "@puckeditor/core";
import { Button } from "../../design-system/components/button";
import { colors, typography, spacing } from "../../design-system/tokens";

export type GLUHeroProps = {
  eyebrow: string;
  heading: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImageUrl: string;
  overlayOpacity: number;
};

const HERO_CSS = `
  .glu-hero-panel {
    position: absolute;
    left: 8%; top: 0; bottom: 0;
    width: 500px;
    margin-bottom: 30px;
    background: rgba(139,0,21,0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
  }
  @media (max-width: 640px) {
    .glu-hero-panel {
      position: relative;
      left: 0;
      width: 100%;
      min-height: 0;
    }
  }
`;

export function GLUHeroComponent({
  eyebrow,
  heading,
  subtext,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  backgroundImageUrl,
}: GLUHeroProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

      <section
        style={{
          position: "relative",
          minHeight: "min(85vh, 600px)",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {/* Background photo */}
        {backgroundImageUrl && (
          <Image
            src={backgroundImageUrl}
            alt=""
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
            sizes="100vw"
          />
        )}

        {/* Full-height frosted crimson ribbon */}
        <div className="glu-hero-panel">
          <div style={{ padding: `${spacing[12]} ${spacing[10]}`, width: "100%" }}>

            {/* Gold accent bar */}
            <div
              style={{
                width: 40,
                height: 3,
                backgroundColor: colors.gold,
                marginBottom: spacing[4],
              }}
            />

            {eyebrow && (
              <div
                style={{
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeXs,
                  fontWeight: typography.weightBold,
                  color: colors.white,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  marginBottom: spacing[3],
                }}
              >
                {eyebrow}
              </div>
            )}

            <h1
              style={{
                fontFamily: typography.fontHeading,
                fontSize: "clamp(1.9rem, 3.5vw, 3rem)",
                fontWeight: typography.weightBold,
                color: colors.white,
                lineHeight: 1.12,
                margin: `0 0 ${spacing[5]}`,
                letterSpacing: "-0.01em",
              }}
            >
              {heading}
            </h1>

            <p
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeBase,
                color: "rgba(255,255,255,0.82)",
                lineHeight: typography.lineHeightRelaxed,
                margin: `0 0 ${spacing[8]}`,
              }}
            >
              {subtext}
            </p>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: spacing[3] }}>
              <Button variant="primary" size="md" href={ctaHref}>
                {ctaLabel}
              </Button>
              {secondaryCtaLabel && (
                <Button
                  variant="outline"
                  size="md"
                  href={secondaryCtaHref}
                  style={{ borderColor: "rgba(255,255,255,0.5)", color: colors.white }}
                >
                  {secondaryCtaLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export const gluHeroConfig = {
  label: "GLU Hero",
  ai: {
    instructions: "Landing hero — place after GLUNav on home/program pages. Needs background image URL. Use GLUPageHero for interior pages.",
  },
  fields: {
    eyebrow: { type: "text", label: "Eyebrow Text", contentEditable: true, ai: { instructions: "Short label above the heading, e.g. 'Undergraduate Admissions'. 2-5 words." } } as any,
    heading: { type: "textarea", label: "Heading", contentEditable: true, ai: { required: true, instructions: "Bold, inspiring headline for Grand Lakes University. Action-oriented, 6-10 words." } } as any,
    subtext: { type: "textarea", label: "Subtext", contentEditable: true, ai: { instructions: "1-2 sentences expanding on the heading. Mention outcomes or a key differentiator." } } as any,
    ctaLabel: { type: "text", label: "Primary CTA Label", contentEditable: true } as any,
    ctaHref: { type: "text", label: "Primary CTA URL", ai: { stream: false } },
    secondaryCtaLabel: { type: "text", label: "Secondary CTA Label", contentEditable: true } as any,
    secondaryCtaHref: { type: "text", label: "Secondary CTA URL", ai: { stream: false } },
    backgroundImageUrl: { type: "text", label: "Background Image URL", ai: { stream: false, instructions: "URL of a high-quality campus or program photo." } },
    overlayOpacity: { type: "number", label: "Overlay Opacity (0–1)", min: 0, max: 1 },
  },
  defaultProps: {
    eyebrow: "Undergraduate Admissions",
    heading: "Find Your Place at Grand Lakes",
    subtext:
      "Join 15,000 students at Michigan's flagship research university. Explore 120+ majors, world-class faculty, and a campus that sits on the shores of the Great Lakes.",
    ctaLabel: "Start Your Application",
    ctaHref: "/apply",
    secondaryCtaLabel: "Explore Academics",
    secondaryCtaHref: "/academics",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80",
    overlayOpacity: 0.72,
  },
  render: GLUHeroComponent,
} as ComponentConfig<GLUHeroProps>;
