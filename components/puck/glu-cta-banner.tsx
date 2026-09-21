"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Button } from "../../design-system/components/button";
import { Section } from "../../design-system/components/section";
import { Container } from "../../design-system/components/container";
import { colors, typography, spacing } from "../../design-system/tokens";
import { buttonLabelAi, linkAi } from "../../lib/ai-hints";

export type GLUCtaBannerProps = {
  heading: string;
  subtext: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  background: "navy" | "gold" | "lightBlue";
};

export function GLUCtaBannerComponent({
  heading,
  subtext,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  background,
}: GLUCtaBannerProps) {
  const isNavy = background === "navy";
  const isGold = background === "gold";

  const sectionBg = isNavy ? "navy" : isGold ? "white" : "lightBlue";
  const headingColor = isNavy ? colors.white : colors.dark;
  const subtextColor = isNavy ? "rgba(255,255,255,0.8)" : colors.muted;

  return (
    <Section background={sectionBg} paddingY={spacing[16]}>
      <Container>
        <div
          style={{
            textAlign: "center" as const,
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.size4xl,
              fontWeight: typography.weightBold,
              color: headingColor,
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
                color: subtextColor,
                lineHeight: typography.lineHeightRelaxed,
                margin: `0 0 ${spacing[8]}`,
              }}
            >
              {subtext}
            </p>
          )}
          <div style={{ display: "flex", gap: spacing[4], justifyContent: "center", flexWrap: "wrap" as const }}>
            {primaryCtaLabel && (
              <Button variant="primary" size="lg" href={primaryCtaHref}>
                {primaryCtaLabel}
              </Button>
            )}
            {secondaryCtaLabel && (
              <Button
                variant="outline"
                size="lg"
                href={secondaryCtaHref}
                style={isNavy ? { borderColor: colors.white, color: colors.white } : {}}
              >
                {secondaryCtaLabel}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export const gluCtaBannerConfig = {
  label: "GLU CTA Banner",
  ai: {
    instructions: "CTA banner — near page bottom to drive action. Use navy or gold background. Primary CTA required, secondary optional.",
  },
  fields: {
    heading: {
      type: "textarea",
      label: "Heading",
      contentEditable: true,
      ai: { required: true, instructions: "Urgent call-to-action headline. E.g. 'Ready to Start Your Grand Lakes Journey?'." },
    } as any,
    subtext: {
      type: "textarea",
      label: "Subtext",
      contentEditable: true,
      ai: { instructions: "1–2 sentences. Include the deadline or date when there is one." },
    } as any,
    primaryCtaLabel: {
      type: "text",
      label: "Primary CTA Label",
      contentEditable: true,
      ai: { required: true, ...buttonLabelAi("Start Your Application") },
    } as any,
    primaryCtaHref: { type: "text", label: "Primary CTA URL", ai: linkAi("Where the primary button goes.") },
    secondaryCtaLabel: {
      type: "text",
      label: "Secondary CTA Label",
      contentEditable: true,
      ai: buttonLabelAi("Request Information", { optional: true }),
    } as any,
    secondaryCtaHref: { type: "text", label: "Secondary CTA URL", ai: linkAi("Where the secondary button goes.", { optional: true }) },
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "Crimson", value: "navy" },
        { label: "Gold Accent", value: "gold" },
        { label: "Light Rose", value: "lightBlue" },
      ],
      ai: { instructions: "navy (crimson) for the page's closing CTA; gold for a mid-page nudge; lightBlue only directly after a crimson section." },
    },
  },
  defaultProps: {
    heading: "Ready to Start Your Grand Lakes Journey?",
    subtext: "Applications for Fall 2026 are open. Early Action deadline: November 1. Regular Decision deadline: January 15.",
    primaryCtaLabel: "Start Your Application",
    primaryCtaHref: "/apply",
    secondaryCtaLabel: "Request Information",
    secondaryCtaHref: "/contact",
    background: "navy",
  },
  render: GLUCtaBannerComponent,
} as ComponentConfig<GLUCtaBannerProps>;
