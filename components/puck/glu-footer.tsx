"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
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

export const gluFooterConfig = {
  label: "GLU Footer",
  ai: {
    instructions: "Footer — place last on every page, one per page. Include link columns, social links, and copyright year.",
  },
  fields: {
    logoText: {
      type: "text",
      label: "Logo Text",
      contentEditable: true,
    } as any,
    tagline: {
      type: "textarea",
      label: "Tagline",
      contentEditable: true,
    } as any,
    copyright: {
      type: "text",
      label: "Copyright",
      contentEditable: true,
    } as any,
    columns: {
      type: "array",
      label: "Link Columns",
      arrayFields: {
        heading: { type: "text", label: "Column Heading" },
        links: {
          type: "array",
          label: "Links",
          arrayFields: {
            label: { type: "text", label: "Label" },
            href: { type: "text", label: "URL" },
          },
          getItemSummary: (item: { label?: string }, i?: number) => item?.label || `Item #${(i ?? 0) + 1}`,
        },
      },
      getItemSummary: (item: { heading?: string }, i?: number) => item?.heading || `Item #${(i ?? 0) + 1}`,
    },
    socialLinks: {
      type: "array",
      label: "Social Links",
      arrayFields: {
        platform: { type: "text", label: "Platform Name" },
        href: { type: "text", label: "URL" },
      },
      getItemSummary: (item: { platform?: string }, i?: number) => item?.platform || `Item #${(i ?? 0) + 1}`,
    },
  },
  defaultProps: {
    logoText: "Grand Lakes University",
    tagline: "Advancing knowledge and enriching lives through excellence in teaching, research, and community engagement since 1887.",
    copyright: "© 2025 Grand Lakes University. 1887 University Drive, Grand Lakes, Michigan 48901. All rights reserved.",
    columns: [
      {
        heading: "Admissions",
        links: [
          { label: "How to Apply", href: "/apply" },
          { label: "Deadlines", href: "/apply#deadlines" },
          { label: "Requirements", href: "/apply#requirements" },
          { label: "Visit Campus", href: "/visit" },
        ],
      },
      {
        heading: "Academics",
        links: [
          { label: "Programs & Majors", href: "/academics" },
          { label: "Research", href: "/research" },
          { label: "Academic Calendar", href: "/calendar" },
          { label: "Library", href: "/library" },
        ],
      },
      {
        heading: "Campus Life",
        links: [
          { label: "Housing", href: "/campus-life#housing" },
          { label: "Dining", href: "/campus-life#dining" },
          { label: "Student Clubs", href: "/campus-life#clubs" },
          { label: "Athletics", href: "/athletics" },
        ],
      },
    ],
    socialLinks: [
      { platform: "Twitter", href: "#" },
      { platform: "Instagram", href: "#" },
      { platform: "LinkedIn", href: "#" },
      { platform: "YouTube", href: "#" },
    ],
  },
  render: GLUFooterComponent,
} as ComponentConfig<GLUFooterProps>;
