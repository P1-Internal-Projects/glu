"use client";

import React from "react";
import { Container } from "../../design-system/components/container";
import { GLULogo } from "../../design-system/components/glu-logo";
import { colors, typography, spacing } from "../../design-system/tokens";

export type GLUFooterProps = {
  logoText: string;
  tagline: string;
  columns: { heading: string; links: { label: string; href: string }[] }[];
  copyright: string;
  socialLinks: { platform: string; href: string }[];
};

export function GLUFooterComponent({ logoText, tagline, columns, copyright, socialLinks }: GLUFooterProps) {
  return (
    <footer style={{ backgroundColor: colors.crimsonDark, color: colors.white }}>
      {/* Main footer content */}
      <div style={{ paddingTop: spacing[16], paddingBottom: spacing[12] }}>
        <Container>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `2fr ${columns.map(() => "1fr").join(" ")}`,
              gap: spacing[10],
            }}
          >
            {/* Brand col */}
            <div>
              <div style={{ marginBottom: spacing[4] }}>
                <GLULogo color={colors.white} width={180} />
              </div>
              <p
                style={{
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeSm,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: typography.lineHeightRelaxed,
                  margin: `0 0 ${spacing[6]}`,
                  maxWidth: 280,
                }}
              >
                {tagline}
              </p>
              {socialLinks.length > 0 && (
                <div style={{ display: "flex", gap: spacing[4] }}>
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      aria-label={social.platform}
                      style={{
                        fontFamily: typography.fontBody,
                        fontSize: typography.sizeXs,
                        fontWeight: typography.weightSemibold,
                        color: "rgba(255,255,255,0.7)",
                        textDecoration: "none",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase" as const,
                      }}
                    >
                      {social.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Link columns */}
            {columns.map((col, ci) => (
              <div key={ci}>
                <h3
                  style={{
                    fontFamily: typography.fontBody,
                    fontSize: typography.sizeXs,
                    fontWeight: typography.weightSemibold,
                    color: colors.gold,
                    backgroundColor: colors.crimsonDark,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    margin: `0 0 ${spacing[4]}`,
                  }}
                >
                  {col.heading}
                </h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" as const, gap: spacing[3] }}>
                  {col.links.map((link, li) => (
                    <li key={li}>
                      <a
                        href={link.href}
                        style={{
                          fontFamily: typography.fontBody,
                          fontSize: typography.sizeSm,
                          color: "rgba(255,255,255,0.7)",
                          textDecoration: "none",
                        }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: spacing[5], paddingBottom: spacing[5] }}>
        <Container>
          <p
            style={{
              fontFamily: typography.fontBody,
              fontSize: typography.sizeXs,
              color: "rgba(255,255,255,0.65)",
              margin: 0,
              textAlign: "center" as const,
            }}
          >
            {copyright}
          </p>
        </Container>
      </div>
    </footer>
  );
}

/**
 * There is deliberately no Puck config export here — see glu-nav.tsx. The
 * footer is rendered once by the Puck root from lib/site-chrome.ts.
 */
