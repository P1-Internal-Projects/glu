"use client";

import React, { useState } from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Button } from "../../design-system/components/button";
import { GLULogo } from "../../design-system/components/glu-logo";
import { colors, layout, spacing, typography } from "../../design-system/tokens";

export type GLUNavProps = {
  logoText: string;
  links: { label: string; href: string }[];
  ctaLabel: string;
  ctaHref: string;
};

export function GLUNavComponent({ logoText, links, ctaLabel, ctaHref }: GLUNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        backgroundColor: colors.crimson,
        height: layout.navHeight,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          maxWidth: layout.containerMax,
          margin: "0 auto",
          padding: `0 ${spacing[6]}`,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing[6],
        }}
      >
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", flexShrink: 0, lineHeight: 0 }} aria-label={logoText}>
          <GLULogo color={colors.white} width={160} />
        </a>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" style={{ display: "flex", alignItems: "center", gap: spacing[6] }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeSm,
                fontWeight: typography.weightSemibold,
                color: "rgba(255,255,255,0.85)",
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = colors.gold; }}
              onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)"; }}
            >
              {link.label}
            </a>
          ))}
          <Button variant="primary" size="sm" href={ctaHref}>
            {ctaLabel}
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: colors.white,
            cursor: "pointer",
            padding: spacing[2],
          }}
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          aria-label="Mobile navigation"
          style={{
            position: "absolute",
            top: layout.navHeight,
            left: 0,
            right: 0,
            backgroundColor: colors.crimsonDark,
            padding: spacing[4],
            display: "flex",
            flexDirection: "column" as const,
            gap: spacing[3],
          }}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeBase,
                color: colors.white,
                textDecoration: "none",
                padding: `${spacing[2]} 0`,
              }}
            >
              {link.label}
            </a>
          ))}
          <Button variant="primary" href={ctaHref} fullWidth>
            {ctaLabel}
          </Button>
        </nav>
      )}
    </header>
  );
}

export const gluNavConfig = {
  label: "GLU Nav",
  ai: {
    instructions: "Top nav — place first on every page, one per page. Add main nav links and a primary CTA (e.g. 'Apply Now').",
  },
  fields: {
    logoText: {
      type: "text",
      label: "Logo Text",
      contentEditable: true,
    } as any,
    links: {
      type: "array",
      label: "Navigation Links",
      arrayFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "URL" },
      },
      getItemSummary: (item: { label?: string }, i?: number) => item?.label || `Item #${(i ?? 0) + 1}`,
    },
    ctaLabel: {
      type: "text",
      label: "CTA Button Label",
      contentEditable: true,
    } as any,
    ctaHref: {
      type: "text",
      label: "CTA Button URL",
    },
  },
  defaultProps: {
    logoText: "Grand Lakes University",
    links: [
      { label: "Admissions", href: "/apply" },
      { label: "Academics", href: "/academics" },
      { label: "Cost & Aid", href: "/cost-aid" },
      { label: "Campus Life", href: "/campus-life" },
    ],
    ctaLabel: "Apply Now",
    ctaHref: "/apply",
  },
  render: GLUNavComponent,
} as ComponentConfig<GLUNavProps>;
