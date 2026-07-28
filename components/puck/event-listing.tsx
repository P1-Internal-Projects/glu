"use client";

import { ComponentConfig } from "@puckeditor/core";
import { useEffect, useState } from "react";
import type { EventRecord } from "../../lib/ct-client";

export type EventListingProps = {
  eyebrow: string;
  heading: string;
  subtext: string;
  viewAllLabel: string;
  viewAllHref: string;
  accentColor: string;
  backgroundColor: string;
};

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function EventTile({ event, accent }: { event: EventRecord; accent: string }) {
  return (
    <article
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#fff",
        borderRadius: "0.625rem",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            height: "180px",
            background: `linear-gradient(135deg, ${accent}22 0%, ${accent}44 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
      )}

      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
          {event.eventType && (
            <span style={{
              fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em",
              textTransform: "uppercase", background: `${accent}18`, color: accent,
              padding: "0.15rem 0.55rem", borderRadius: "99px",
            }}>
              {event.eventType}
            </span>
          )}
          {event.date && (
            <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500 }}>
              {formatDate(event.date)}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: "0 0 0.5rem", lineHeight: 1.35 }}>
          {event.title}
        </h3>

        {event.description && (
          <p style={{
            fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.6, margin: "0 0 0.75rem", flex: 1,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {event.description}
          </p>
        )}

        <div style={{ marginTop: "auto" }}>
          {(event.time || event.location) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.875rem" }}>
              {event.time && (
                <span style={{ fontSize: "0.78rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {event.time}
                </span>
              )}
              {event.location && (
                <span style={{ fontSize: "0.78rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {event.location}
                </span>
              )}
            </div>
          )}
          {event.registrationLink && (
            <a href={event.registrationLink} style={{
              display: "inline-block", fontSize: "0.8rem", fontWeight: 600, color: accent,
              border: `1.5px solid ${accent}`, padding: "0.35rem 0.9rem",
              borderRadius: "99px", textDecoration: "none",
            }}>
              Register →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

const PAGE_SIZE = 3;

export function EventListing({
  eyebrow, heading, subtext, viewAllLabel, viewAllHref, accentColor, backgroundColor,
}: EventListingProps) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ct/events")
      .then((r) => r.json())
      .then((all: EventRecord[]) => {
        const upcoming = all
          .filter((e) => !e.date || e.date >= today())
          .sort((a, b) => (a.date > b.date ? 1 : -1));
        setEvents(upcoming);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const slice = events.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <style>{`
        .el-dot { width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; transition: opacity 0.15s; }
        .el-dot:hover { opacity: 0.7; }
        .el-nav { display: flex; align-items: center; justify-content: center; gap: 0.6rem; margin-top: 2.5rem; }
        .el-arrow { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid rgba(0,0,0,0.15); background: #fff; cursor: pointer; transition: all 0.15s; }
        .el-arrow:hover:not(:disabled) { border-color: currentColor; }
        .el-arrow:disabled { opacity: 0.3; cursor: default; }
      `}</style>
      <section style={{ backgroundColor, padding: "5rem 2rem", boxSizing: "border-box" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              {eyebrow && (
                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accentColor, marginBottom: "0.6rem" }}>
                  {eyebrow}
                </p>
              )}
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1.2, margin: subtext ? "0 0 0.6rem" : 0 }}>
                {heading}
              </h2>
              {subtext && (
                <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>
                  {subtext}
                </p>
              )}
            </div>
            {viewAllLabel && viewAllHref && (
              <a href={viewAllHref} style={{ fontSize: "0.875rem", fontWeight: 600, color: accentColor, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                {viewAllLabel} →
              </a>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", fontSize: "0.9rem" }}>Loading events…</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", fontSize: "0.9rem" }}>No upcoming events at this time.</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                {slice.map((event) => (
                  <EventTile key={event.id} event={event} accent={accentColor} />
                ))}
                {slice.length < PAGE_SIZE &&
                  Array.from({ length: PAGE_SIZE - slice.length }).map((_, i) => <div key={`empty-${i}`} />)}
              </div>

              {totalPages > 1 && (
                <div className="el-nav">
                  <button className="el-arrow" style={{ color: accentColor }} disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} className="el-dot" style={{ background: i === page ? accentColor : "#d1d5db" }} onClick={() => setPage(i)} aria-label={`Page ${i + 1}`} />
                  ))}
                  <button className="el-arrow" style={{ color: accentColor }} disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export const eventListingConfig = {
  label: "Event Listing",
  ai: {
    instructions: "Event listing — fetches and displays upcoming events from CMS with pagination. Auto-filters to future dates.",
  },
  fields: {
    eyebrow: { type: "text", label: "Eyebrow", contentEditable: true } as any,
    heading: { type: "text", label: "Heading", contentEditable: true } as any,
    subtext: { type: "textarea", label: "Subtext (optional)", contentEditable: true } as any,
    viewAllLabel: { type: "text", label: "View All Link Label", contentEditable: true } as any,
    viewAllHref: { type: "text", label: "View All Link URL" },
    accentColor: { type: "text", label: "Accent Color" },
    backgroundColor: { type: "text", label: "Background Color" },
  },
  defaultProps: {
    eyebrow: "Events & Programs",
    heading: "Upcoming Events",
    subtext: "Join us for webinars, workshops, and conferences.",
    viewAllLabel: "View all events",
    viewAllHref: "/events",
    accentColor: "#5b21b6",
    backgroundColor: "#ffffff",
  },
  render: (props) => <EventListing {...props} />,
} as ComponentConfig<EventListingProps>;
