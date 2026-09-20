"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ResolvedItem, LayoutProps } from "@pantheon-systems/puck-css/fields";
import { colors, radii, shadows, spacing, typography } from "../../design-system/tokens";

/**
 * A text-only card mode for the academic program catalog.
 *
 * Deliberately imageless. The other two modes lead with a photograph because an
 * event and a person both have one worth showing; a degree programme does not,
 * and the stock imagery that gets attached to one is decoration that pushes the
 * facts — level, credits, duration, how you study — below the fold. So the
 * hierarchy here is typographic, and the image field is ignored even when the
 * datasource provides one.
 *
 * Clicking a card opens a detail panel that spans the full grid width directly
 * beneath that card's row, rather than a modal. A modal would cover the
 * catalogue; this keeps the neighbours visible, which is what someone comparing
 * programmes is actually doing. It also degrades honestly: with JavaScript off
 * or a reduced-motion preference, it is still a list of readable cards.
 */

/** The Drupal row behind each resolved item. */
type ProgramRaw = {
  code?: string;
  college?: string;
  department?: string;
  degreeType?: string;
  degreeLevelLabel?: string;
  credits?: number;
  duration?: string;
  deliveryModes?: string[];
  startTerms?: string[];
  careerOutcomes?: string[];
  accreditation?: string;
  applyUrl?: string;
  description?: string;
  featured?: boolean;
  url?: string;
};

function raw(item: ResolvedItem): ProgramRaw {
  return (item._raw ?? {}) as ProgramRaw;
}

const ALL_COLLEGES = "__all__";

/**
 * How many columns the grid resolved to.
 *
 * The detail panel has to be inserted after the last card of the clicked
 * card's row, and with `auto-fit` the column count is whatever fits — it is not
 * knowable from the props. Reading the resolved `grid-template-columns` gives
 * the real number, and it is recomputed on resize so the panel does not end up
 * mid-row after the window changes.
 */
function useColumnCount(ref: React.RefObject<HTMLDivElement | null>): number {
  const [columns, setColumns] = useState(1);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const template = window.getComputedStyle(el).gridTemplateColumns;
    const count = template.split(" ").filter(Boolean).length;
    setColumns(count > 0 ? count : 1);
  }, [ref]);

  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, ref]);

  return columns;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: typography.fontBody,
        fontSize: typography.sizeXs,
        fontWeight: typography.weightSemibold,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: colors.crimson,
        backgroundColor: colors.lightBlue,
        borderRadius: radii.full,
        padding: `${spacing[1]} ${spacing[3]}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** A labelled fact in the expanded panel. */
function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt
        style={{
          fontFamily: typography.fontBody,
          fontSize: typography.sizeXs,
          fontWeight: typography.weightSemibold,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: colors.muted,
          marginBottom: spacing[1],
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontFamily: typography.fontBody,
          fontSize: typography.sizeSm,
          lineHeight: typography.lineHeightRelaxed,
          color: colors.dark,
        }}
      >
        {value}
      </dd>
    </div>
  );
}

function ProgramCard({
  item,
  open,
  panelId,
  showTeaser,
  onToggle,
}: {
  item: ResolvedItem;
  open: boolean;
  panelId: string;
  showTeaser: boolean;
  onToggle: () => void;
}) {
  const r = raw(item);
  const meta = [
    r.credits ? `${r.credits} credits` : null,
    r.duration,
    (r.deliveryModes ?? []).join(" · ") || null,
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      className="glu-program-card"
      data-open={open ? "true" : "false"}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        textAlign: "left",
        gap: spacing[3],
        height: "100%",
        width: "100%",
        cursor: "pointer",
        padding: spacing[6],
        backgroundColor: colors.white,
        border: `1px solid ${open ? colors.crimson : colors.border}`,
        borderRadius: radii.lg,
        boxShadow: open ? shadows.md : shadows.sm,
        font: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: spacing[2], flexWrap: "wrap" }}>
        {r.degreeType && <Pill>{r.degreeType}</Pill>}
        {r.featured && (
          <span
            style={{
              fontFamily: typography.fontBody,
              fontSize: typography.sizeXs,
              fontWeight: typography.weightSemibold,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: colors.goldDark,
            }}
          >
            Featured
          </span>
        )}
      </div>

      <h3
        style={{
          fontFamily: typography.fontHeading,
          fontSize: typography.size2xl,
          fontWeight: typography.weightBold,
          lineHeight: typography.lineHeightSnug,
          color: colors.dark,
          margin: 0,
        }}
      >
        {item.title}
      </h3>

      {r.college && (
        <p
          style={{
            fontFamily: typography.fontBody,
            fontSize: typography.sizeSm,
            fontWeight: typography.weightSemibold,
            color: colors.crimson,
            margin: 0,
          }}
        >
          {r.college}
        </p>
      )}

      {showTeaser && item.teaser && (
        <p
          style={{
            fontFamily: typography.fontBody,
            fontSize: typography.sizeSm,
            lineHeight: typography.lineHeightRelaxed,
            color: colors.muted,
            margin: 0,
            flex: 1,
          }}
        >
          {item.teaser}
        </p>
      )}

      {meta.length > 0 && (
        <p
          style={{
            fontFamily: typography.fontBody,
            fontSize: typography.sizeXs,
            color: colors.muted,
            margin: 0,
            paddingTop: spacing[3],
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          {meta.join("  ·  ")}
        </p>
      )}

      <span
        aria-hidden="true"
        className="glu-program-card__chevron"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: spacing[1],
          fontFamily: typography.fontBody,
          fontSize: typography.sizeXs,
          fontWeight: typography.weightSemibold,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: colors.crimson,
        }}
      >
        {open ? "Hide details" : "View details"}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>
  );
}

function DetailPanel({ item, panelId, onClose }: { item: ResolvedItem; panelId: string; onClose: () => void }) {
  const r = raw(item);
  return (
    <div id={panelId} role="region" aria-label={`${item.title} details`}>
        <div
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.crimson}`,
            borderRadius: radii.lg,
            padding: spacing[8],
            display: "flex",
            flexDirection: "column",
            gap: spacing[5],
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: spacing[4], alignItems: "flex-start" }}>
            <div>
              <h4
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.size2xl,
                  fontWeight: typography.weightBold,
                  color: colors.dark,
                  margin: `0 0 ${spacing[1]}`,
                }}
              >
                {item.title}
              </h4>
              <p style={{ margin: 0, fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.muted }}>
                {[r.college, r.department].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${item.title} details`}
              style={{
                border: `1px solid ${colors.border}`,
                background: colors.white,
                borderRadius: radii.full,
                width: 32,
                height: 32,
                cursor: "pointer",
                color: colors.muted,
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {r.description && (
            <p
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeBase,
                lineHeight: typography.lineHeightRelaxed,
                color: colors.dark,
                margin: 0,
                maxWidth: "68ch",
              }}
            >
              {r.description}
            </p>
          )}

          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
              gap: spacing[5],
              margin: 0,
            }}
          >
            <Fact label="Degree" value={r.degreeLevelLabel} />
            <Fact label="Credits" value={r.credits ? String(r.credits) : null} />
            <Fact label="Duration" value={r.duration} />
            <Fact label="How you study" value={(r.deliveryModes ?? []).join(", ") || null} />
            <Fact label="Starts" value={(r.startTerms ?? []).join(", ") || null} />
            <Fact label="Accreditation" value={r.accreditation} />
            <Fact
              label="Career outcomes"
              value={(r.careerOutcomes ?? []).length ? (r.careerOutcomes ?? []).join(", ") : null}
            />
            <Fact label="Program code" value={r.code} />
          </dl>

          {r.applyUrl && (
            <div>
              <a
                href={r.applyUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: colors.crimson,
                  color: colors.white,
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeSm,
                  fontWeight: typography.weightSemibold,
                  textDecoration: "none",
                  padding: `${spacing[3]} ${spacing[6]}`,
                  borderRadius: radii.full,
                }}
              >
                Apply to this program
              </a>
            </div>
          )}
        </div>
    </div>
  );
}

export interface GLUProgramCardsProps extends LayoutProps {
  /** Whether to offer the college filter above the grid. */
  showCollegeFilter?: boolean;
}

export function GLUProgramCards({ items, showTeaser, showCollegeFilter = true }: GLUProgramCardsProps) {
  const [college, setCollege] = useState<string>(ALL_COLLEGES);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const columns = useColumnCount(gridRef);

  const colleges = Array.from(
    new Set(items.map((i) => raw(i).college).filter((c): c is string => Boolean(c))),
  ).sort();

  const visible = college === ALL_COLLEGES ? items : items.filter((i) => raw(i).college === college);

  // An open card that the filter just hid would leave a panel attached to
  // nothing, so the selection is dropped when it falls out of view.
  useEffect(() => {
    if (openCode && !visible.some((i) => raw(i).code === openCode)) setOpenCode(null);
  }, [openCode, visible]);

  const openIndex = visible.findIndex((i) => raw(i).code === openCode);
  // The panel belongs after the last card on the open card's row.
  const insertAfter = openIndex >= 0 ? Math.min(visible.length, (Math.floor(openIndex / columns) + 1) * columns) - 1 : -1;

  if (items.length === 0) {
    return (
      <p
        style={{
          fontFamily: typography.fontBody,
          fontSize: typography.sizeSm,
          color: colors.muted,
          textAlign: "center",
          padding: spacing[12],
          margin: 0,
        }}
      >
        No programs to show yet.
      </p>
    );
  }

  return (
    <div>
      <style>{`
        /* The panel animates on grid-template-rows rather than height, which
           cannot be transitioned from auto. Both rows are in flow, so the
           content keeps its natural height and nothing has to be measured. */
        .glu-program-panel {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 320ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 200ms ease, margin-top 320ms cubic-bezier(0.22, 1, 0.36, 1);
          margin-top: 0;
        }
        .glu-program-panel[data-open="true"] {
          grid-template-rows: 1fr;
          opacity: 1;
          margin-top: ${spacing[2]};
        }
        .glu-program-panel__inner { overflow: hidden; min-height: 0; }
        .glu-program-card { transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
        .glu-program-card:hover { border-color: ${colors.crimson}; transform: translateY(-2px); }
        .glu-program-card:focus-visible { outline: 3px solid ${colors.gold}; outline-offset: 2px; }
        .glu-program-card__chevron svg { transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1); }
        .glu-program-card[data-open="true"] .glu-program-card__chevron svg { transform: rotate(180deg); }
        .glu-program-filter { transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease; }
        @media (prefers-reduced-motion: reduce) {
          .glu-program-panel, .glu-program-card, .glu-program-card__chevron svg, .glu-program-filter {
            transition-duration: 1ms;
          }
          .glu-program-card:hover { transform: none; }
        }
      `}</style>

      {showCollegeFilter && colleges.length > 1 && (
        <div
          role="group"
          aria-label="Filter programs by college"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing[2],
            justifyContent: "center",
            marginBottom: spacing[8],
          }}
        >
          {[ALL_COLLEGES, ...colleges].map((value) => {
            const active = value === college;
            const label = value === ALL_COLLEGES ? `All programs (${items.length})` : value;
            return (
              <button
                key={value}
                type="button"
                className="glu-program-filter"
                aria-pressed={active}
                onClick={() => setCollege(value)}
                style={{
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeSm,
                  fontWeight: typography.weightSemibold,
                  cursor: "pointer",
                  padding: `${spacing[2]} ${spacing[4]}`,
                  borderRadius: radii.full,
                  border: `1px solid ${active ? colors.crimson : colors.border}`,
                  backgroundColor: active ? colors.crimson : colors.white,
                  color: active ? colors.white : colors.dark,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: spacing[6],
          alignItems: "start",
        }}
      >
        {visible.map((item, i) => {
          const code = raw(item).code ?? String(i);
          const panelId = `glu-program-panel-${code}`;
          const open = code === openCode;
          return (
            <React.Fragment key={code}>
              <ProgramCard
                item={item}
                open={open}
                panelId={panelId}
                showTeaser={showTeaser !== false}
                onToggle={() => setOpenCode(open ? null : code)}
              />
              {i === insertAfter && openIndex >= 0 && (
                <DetailPanelSlot
                  item={visible[openIndex]}
                  panelId={`glu-program-panel-${raw(visible[openIndex]).code ?? openIndex}`}
                  onClose={() => setOpenCode(null)}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Wrapper that flips `data-open` on the tick after mount.
 *
 * The panel is only rendered while a card is open, so it would otherwise mount
 * already at its final height and skip the transition entirely.
 */
function DetailPanelSlot(props: { item: ResolvedItem; panelId: string; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="glu-program-panel" data-open={shown ? "true" : "false"} style={{ gridColumn: "1 / -1" }}>
      <div className="glu-program-panel__inner">
        <DetailPanel {...props} />
      </div>
    </div>
  );
}
