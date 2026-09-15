"use client";

import React, { useState } from "react";
import { Button } from "../../design-system/components/button";
import { GLULogo } from "../../design-system/components/glu-logo";
import { colors, layout, spacing, typography } from "../../design-system/tokens";
import { GLULocaleSwitcher } from "./glu-locale-switcher";

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
          <GLULocaleSwitcher />
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
          <GLULocaleSwitcher />
        </nav>
      )}
    </header>
  );
}

/**
 * There is deliberately no Puck config export here.
 *
 * The nav is not a block. It is rendered once by the Puck root (see
 * components/site-chrome.tsx) from the single definition in lib/site-chrome.ts,
 * so it cannot be added to a page, moved, deleted or reworded. Registering a
 * config again would reintroduce exactly the per-page copies this replaced.
 *
 * The component below stays exported for that root render and for Storybook.
 */
