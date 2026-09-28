"use client";

import React from "react";
import Image from "next/image";
import type { ComponentConfig } from "@puckeditor/core";
import { Eyebrow } from "../../design-system/components/typography";
import { colors, typography, layout, spacing } from "../../design-system/tokens";
import { linkAi } from "../../lib/ai-hints";

export type GLUPageHeroProps = {
  eyebrow: string;
  heading: string;
  breadcrumbs: { label: string; href: string }[];
  backgroundImageUrl: string;
};

export function GLUPageHeroComponent({ eyebrow, heading, breadcrumbs = [], backgroundImageUrl }: GLUPageHeroProps) {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "340px",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
      }}
    >
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(139,0,21,0.88) 0%, rgba(139,0,21,0.4) 60%, rgba(139,0,21,0.1) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: layout.containerMax,
          margin: "0 auto",
          padding: `${spacing[12]} ${spacing[6]}`,
        }}
      >
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" style={{ marginBottom: spacing[3] }}>
            <ol style={{ display: "flex", gap: spacing[2], listStyle: "none", margin: 0, padding: 0 }}>
              {breadcrumbs.map((crumb, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: spacing[2] }}>
                  {i > 0 && (
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: typography.sizeSm }}>›</span>
                  )}
                  <a
                    href={crumb.href}
                    style={{
                      fontFamily: typography.fontBody,
                      fontSize: typography.sizeSm,
                      color: "rgba(255,255,255,0.75)",
                      textDecoration: "none",
                      padding: "8px 4px",
                      display: "inline-block",
                    }}
                  >
                    {crumb.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && (
          <Eyebrow light style={{ marginBottom: spacing[3] }}>
            {eyebrow}
          </Eyebrow>
        )}
        <h1
          style={{
            fontFamily: typography.fontHeading,
            fontSize: "clamp(1.875rem, 4vw, 3rem)",
            fontWeight: typography.weightBold,
            color: colors.white,
            lineHeight: typography.lineHeightTight,
            margin: 0,
          }}
        >
          {heading}
        </h1>
      </div>
    </section>
  );
}

export const gluPageHeroConfig = {
  label: "GLU Page Hero",
  ai: {
    instructions: "First section on an interior page; only a GLUAnnouncementBanner may sit above it. Use instead of GLUHero on sub-pages. Shorter, includes breadcrumb navigation.",
  },
  fields: {
    eyebrow: {
      type: "text",
      label: "Eyebrow",
      contentEditable: true,
      ai: { instructions: "The section of the site this page belongs to, e.g. 'Admissions' or 'Grand Lakes University'." },
    } as any,
    heading: {
      type: "textarea",
      label: "Heading",
      contentEditable: true,
      ai: { required: true, instructions: "Clear page title, e.g. 'Undergraduate Admissions' or 'Financial Aid'." },
    } as any,
    breadcrumbs: {
      type: "array",
      label: "Breadcrumbs",
      ai: { instructions: "Home, then the section, then this page's parent if any — 2–3 items. Do not include the current page." },
      arrayFields: {
        label: { type: "text", label: "Label", contentEditable: true, ai: { required: true, instructions: "The page's nav name, e.g. 'Home' or 'Admissions'." } },
        href: { type: "text", label: "URL", ai: linkAi("That page's path.") },
      },
      getItemSummary: (item: { label?: string }, i?: number) => item?.label || `Item #${(i ?? 0) + 1}`,
    },
    backgroundImageUrl: { type: "text", label: "Background Image URL", ai: { stream: false } },
  },
  defaultProps: {
    eyebrow: "Grand Lakes University",
    heading: "Undergraduate Admissions",
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Admissions", href: "/apply" },
    ],
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80",
  },
  render: GLUPageHeroComponent,
} as ComponentConfig<GLUPageHeroProps>;
