"use client";

import React from "react";
import Image from "next/image";
import type { ComponentConfig } from "@puckeditor/core";
import { Button } from "../../design-system/components/button";
import { colors, typography, spacing } from "../../design-system/tokens";
import { CAMPUS_BANNER_URL } from "../../lib/glu-assets";

export type GLUHeroLayout = "panel" | "fullOverlay" | "lowerBand";

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
  layout?: GLUHeroLayout;
};

const crimson = (a: number) => `rgba(139,0,21,${a})`;

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
  .glu-hero-overlay-inner { max-width: 620px; padding: ${spacing[12]} 8%; }
  .glu-hero-band-inner { padding: ${spacing[8]} 8%; }
  .glu-hero-band-row { display: flex; align-items: center; gap: ${spacing[6]}; }
  .glu-hero-eyebrow-group { display: flex; align-items: center; gap: ${spacing[4]}; align-self: stretch; }
  .glu-hero-eyebrow-tab { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; }
  .glu-hero-eyebrow-rule { width: 3px; align-self: stretch; background: ${colors.gold}; flex-shrink: 0; }
  .glu-hero-band-text { flex: 1; min-width: 0; }
  .glu-hero-band-actions { display: flex; flex-direction: column; gap: ${spacing[3]}; flex-shrink: 0; }
  @media (max-width: 640px) {
    .glu-hero-panel {
      position: relative;
      left: 0;
      width: 100%;
      min-height: 0;
    }
    .glu-hero-overlay-inner { max-width: 100%; padding: ${spacing[10]} 6%; }
    .glu-hero-band-inner { padding: ${spacing[6]} 6%; }
    .glu-hero-band-row { flex-direction: column; align-items: flex-start; gap: ${spacing[4]}; }
    .glu-hero-eyebrow-group { align-self: auto; }
    .glu-hero-eyebrow-tab { writing-mode: horizontal-tb; transform: none; }
    .glu-hero-eyebrow-rule { display: none; }
    .glu-hero-band-actions { flex-direction: row; width: 100%; }
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
  overlayOpacity = 0.72,
  layout = "panel",
}: GLUHeroProps) {
  // Shared content for the Side Panel + Full Overlay layouts.
  const goldBar = (
    <div style={{ width: 40, height: 3, backgroundColor: colors.gold, marginBottom: spacing[4] }} />
  );

  const eyebrowEl = eyebrow ? (
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
  ) : null;

  const headingEl = (
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
  );

  const subtextEl = (
    <p
      style={{
        fontFamily: typography.fontBody,
        fontSize: typography.sizeBase,
        color: "rgba(255,255,255,0.82)",
        lineHeight: typography.lineHeightRelaxed,
        margin: `0 0 ${spacing[8]}`,
        maxWidth: 720,
      }}
    >
      {subtext}
    </p>
  );

  const ctasColumn = (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: spacing[3], flexWrap: "wrap" as const }}>
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
  );

  const body = (
    <>
      {goldBar}
      {eyebrowEl}
      {headingEl}
      {subtextEl}
      {ctasColumn}
    </>
  );

  const bg = backgroundImageUrl ? (
    <Image
      src={backgroundImageUrl}
      alt=""
      fill
      priority
      style={{ objectFit: "cover", objectPosition: "center 30%" }}
      sizes="100vw"
    />
  ) : null;

  const sectionBase = {
    position: "relative" as const,
    minHeight: "min(85vh, 600px)",
    overflow: "hidden",
    display: "flex",
  };

  const styleTag = <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />;

  // ── Full overlay: crimson gradient + frosted blur across the whole image,
  //    fading left → right. The mask fades the blur out with the color.
  if (layout === "fullOverlay") {
    const fade = "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)";
    return (
      <>
        {styleTag}
        <section style={{ ...sectionBase, alignItems: "center" }}>
          {bg}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to right, ${crimson(overlayOpacity)} 0%, ${crimson(overlayOpacity * 0.85)} 35%, ${crimson(0)} 85%)`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              maskImage: fade,
              WebkitMaskImage: fade,
            }}
          />
          <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
            <div className="glu-hero-overlay-inner">{body}</div>
          </div>
        </section>
      </>
    );
  }

  // ── Lower band: compact, full-width solid crimson bar in the lower portion.
  //    Vertical eyebrow "tab" on the left, text in the middle, CTAs stacked right.
  if (layout === "lowerBand") {
    return (
      <>
        {styleTag}
        <section style={{ ...sectionBase, alignItems: "flex-end" }}>
          {bg}
          <div
            className="glu-hero-band-inner"
            style={{ position: "relative", zIndex: 1, width: "100%", background: crimson(1) }}
          >
            <div className="glu-hero-band-row">
              {eyebrow && (
                <div className="glu-hero-eyebrow-group">
                  <span
                    className="glu-hero-eyebrow-tab"
                    style={{
                      fontFamily: typography.fontBody,
                      fontSize: typography.sizeXs,
                      fontWeight: typography.weightBold,
                      color: colors.white,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {eyebrow}
                  </span>
                  <span className="glu-hero-eyebrow-rule" />
                </div>
              )}

              <div className="glu-hero-band-text">
                <h1
                  style={{
                    fontFamily: typography.fontHeading,
                    fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
                    fontWeight: typography.weightBold,
                    color: colors.white,
                    lineHeight: 1.14,
                    margin: `0 0 ${spacing[2]}`,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {heading}
                </h1>
                <p
                  style={{
                    fontFamily: typography.fontBody,
                    fontSize: typography.sizeBase,
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: typography.lineHeightRelaxed,
                    margin: 0,
                    maxWidth: 760,
                  }}
                >
                  {subtext}
                </p>
              </div>

              <div className="glu-hero-band-actions">
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

  // ── Side panel (default): full-height frosted crimson ribbon on the left.
  return (
    <>
      {styleTag}
      <section style={sectionBase}>
        {bg}
        <div className="glu-hero-panel">
          <div style={{ padding: `${spacing[12]} ${spacing[10]}`, width: "100%" }}>{body}</div>
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
    layout: {
      type: "select",
      label: "Layout",
      options: [
        { label: "Side Panel (default)", value: "panel" },
        { label: "Full Overlay", value: "fullOverlay" },
        { label: "Lower Band", value: "lowerBand" },
      ],
      ai: {
        instructions:
          "Hero layout. 'panel' = crimson ribbon on the left. 'fullOverlay' = crimson gradient blur across the whole image. 'lowerBand' = compact full-width solid crimson bar in the lower portion.",
      },
    },
    eyebrow: { type: "text", label: "Eyebrow Text", contentEditable: true, ai: { instructions: "Short label above the heading, e.g. 'Undergraduate Admissions'. 2-5 words." } },
    heading: { type: "textarea", label: "Heading", contentEditable: true, ai: { required: true, instructions: "Bold, inspiring headline for Grand Lakes University. Action-oriented, 6-10 words." } },
    subtext: { type: "textarea", label: "Subtext", contentEditable: true, ai: { instructions: "1-2 sentences expanding on the heading. Mention outcomes or a key differentiator." } },
    ctaLabel: { type: "text", label: "Primary CTA Label", contentEditable: true },
    ctaHref: { type: "text", label: "Primary CTA URL", ai: { stream: false } },
    secondaryCtaLabel: { type: "text", label: "Secondary CTA Label", contentEditable: true },
    secondaryCtaHref: { type: "text", label: "Secondary CTA URL", ai: { stream: false } },
    backgroundImageUrl: { type: "text", label: "Background Image URL", ai: { stream: false, instructions: "URL of a high-quality campus or program photo." } },
    overlayOpacity: { type: "number", label: "Overlay Opacity (0–1)", min: 0, max: 1, ai: { instructions: "Crimson overlay strength for the Full Overlay layout. (Side Panel and Lower Band use a fixed tint.)" } },
  },
  defaultProps: {
    layout: "panel",
    eyebrow: "Undergraduate Admissions",
    heading: "Find Your Place at Grand Lakes",
    subtext:
      "Join 15,000 students at Michigan's flagship research university. Explore 120+ majors, world-class faculty, and a campus that sits on the shores of the Great Lakes.",
    ctaLabel: "Start Your Application",
    ctaHref: "/apply",
    secondaryCtaLabel: "Explore Academics",
    secondaryCtaHref: "/academics",
    backgroundImageUrl:
      CAMPUS_BANNER_URL,
    overlayOpacity: 0.72,
  },
  render: GLUHeroComponent,
} as ComponentConfig<GLUHeroProps>;
