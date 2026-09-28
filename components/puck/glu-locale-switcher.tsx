"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, localizedPath, readLocaleFromPath } from "../../lib/locales";
import { colors, radii, spacing, typography } from "../../design-system/tokens";

/**
 * Language switcher for the public site.
 *
 * Every configured market is offered, not only the ones this page has a version
 * in. The site's policy is `fallback`, so a market with no version still
 * resolves — the visitor lands on that URL and reads the default language
 * rather than a 404. Hiding those would make the site look less translated than
 * it is and would change which languages are reachable from page to page.
 *
 * The editor has a switcher of its own in the toolbar. That one moves between
 * documents to edit; this one moves a reader between published pages.
 */
export function GLULocaleSwitcher() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { locale: current, rest } = readLocaleFromPath(pathname);
  const active = LOCALES.find((l) => l.tag === current) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    function onDocumentPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocumentPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Language: ${active.english}. Change language`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: spacing[2],
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: radii.full,
          color: colors.white,
          fontFamily: typography.fontBody,
          fontSize: typography.sizeSm,
          fontWeight: typography.weightSemibold,
          padding: `${spacing[1]} ${spacing[3]}`,
          cursor: "pointer",
          lineHeight: 1.6,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {active.native}
      </button>

      {open && (
        <ul
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "190px",
            listStyle: "none",
            margin: 0,
            padding: spacing[2],
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.lg,
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            zIndex: 200,
          }}
        >
          {LOCALES.map((l) => {
            const isActive = l.tag === current;
            return (
              <li key={l.tag} role="none">
                <a
                  role="menuitem"
                  hrefLang={l.tag}
                  lang={l.tag}
                  href={localizedPath(rest, l.tag)}
                  aria-current={isActive ? "true" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: spacing[3],
                    padding: `${spacing[2]} ${spacing[3]}`,
                    borderRadius: radii.md,
                    textDecoration: "none",
                    fontFamily: typography.fontBody,
                    fontSize: typography.sizeSm,
                    color: isActive ? colors.crimson : colors.dark,
                    fontWeight: isActive ? typography.weightSemibold : typography.weightNormal,
                    backgroundColor: isActive ? colors.rose : "transparent",
                  }}
                >
                  <span>{l.native}</span>
                  <span style={{ fontSize: typography.sizeXs, color: colors.muted }}>
                    {l.tag}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
