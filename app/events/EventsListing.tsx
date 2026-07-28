"use client";

import { useState, useMemo } from "react";
import type { EventRecord } from "../../lib/ct-client";

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EventCard({ event }: { event: EventRecord }) {
  return (
    <article
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title}
          style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
        />
      )}
      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
          {event.eventType && (
            <span style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              background: "#ede9fe",
              color: "#5b21b6",
              padding: "0.15rem 0.5rem",
              borderRadius: "99px",
            }}>
              {event.eventType}
            </span>
          )}
          {event.date && (
            <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 500 }}>
              {formatDate(event.date)}
            </span>
          )}
        </div>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", margin: "0 0 0.5rem", lineHeight: 1.3 }}>
          {event.title}
        </h2>

        {event.description && (
          <p style={{ fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.6, margin: "0 0 0.75rem", flex: 1 }}>
            {event.description}
          </p>
        )}

        <div style={{ marginTop: "auto" }}>
          {(event.time || event.location) && (
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              {event.time && (
                <span style={{ fontSize: "0.8rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {event.time}
                </span>
              )}
              {event.location && (
                <span style={{ fontSize: "0.8rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {event.location}
                </span>
              )}
            </div>
          )}
          {event.registrationLink && (
            <a
              href={event.registrationLink}
              style={{
                display: "inline-block",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#5b21b6",
                textDecoration: "none",
                border: "1.5px solid #5b21b6",
                padding: "0.35rem 0.9rem",
                borderRadius: "99px",
                transition: "all 0.15s",
              }}
            >
              Register →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function EventsListing({ events }: { events: EventRecord[] }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const allTypes = useMemo(
    () => Array.from(new Set(events.map((e) => e.eventType).filter(Boolean))).sort(),
    [events],
  );

  const filtered = useMemo(() => {
    return events
      .filter((e) => {
        if (dateFrom && e.date && e.date < dateFrom) return false;
        if (dateTo && e.date && e.date > dateTo) return false;
        if (typeFilter && e.eventType !== typeFilter) return false;
        return true;
      })
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [events, dateFrom, dateTo, typeFilter]);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#f9fafb" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>

      {/* Page header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "3rem 1.5rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#5b21b6", marginBottom: "0.5rem" }}>
            Upcoming Events
          </p>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 700, color: "#111827", margin: "0 0 0.5rem" }}>
            Events &amp; Programs
          </h1>
          <p style={{ fontSize: "1rem", color: "#6b7280", margin: 0 }}>
            Browse and register for upcoming workshops, webinars, and conferences.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Filters */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
          marginBottom: "2rem",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          padding: "1rem 1.25rem",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ padding: "0.4rem 0.6rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ padding: "0.4rem 0.6rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "inherit" }}
            />
          </div>
          {allTypes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: "0.4rem 0.6rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "inherit", background: "#fff" }}
              >
                <option value="">All types</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
          {(dateFrom || dateTo || typeFilter) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); setTypeFilter(""); }}
              style={{ alignSelf: "flex-end", fontSize: "0.8rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: "0.4rem 0.5rem", fontFamily: "inherit" }}
            >
              Clear filters ×
            </button>
          )}
          <div style={{ marginLeft: "auto", alignSelf: "flex-end", fontSize: "0.8rem", color: "#9ca3af" }}>
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>
            <p style={{ fontSize: "1rem" }}>No events match your filters.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}>
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
