"use client";

import { ComponentConfig } from "@puckeditor/core";
import { useEffect, useState } from "react";
import type { CTRecord } from "../../lib/ct-client";

export type AccoladeListingProps = {
  eyebrow: string;
  heading: string;
  subtext: string;
  columns: 2 | 3 | 4;
  accentColor: string;
  backgroundColor: string;
};

export function AccoladeListing({
  eyebrow, heading, subtext, columns, accentColor, backgroundColor,
}: AccoladeListingProps) {
  const [records, setRecords] = useState<CTRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const accent = accentColor;

  useEffect(() => {
    fetch("/api/ct/accolades")
      .then((r) => r.json())
      .then((data: CTRecord[]) => setRecords(data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ backgroundColor, padding: "5rem 2rem", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "3rem" }}>
          {eyebrow && (
            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: "0.6rem" }}>
              {eyebrow}
            </p>
          )}
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1.2, margin: subtext ? "0 0 0.6rem" : 0 }}>
            {heading}
          </h2>
          {subtext && <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{subtext}</p>}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", fontSize: "0.9rem" }}>Loading…</div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", fontSize: "0.9rem" }}>No accolades found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "1.5rem" }}>
            {records.map((record) => (
              <article key={record.id} style={{ fontFamily: "system-ui, sans-serif", background: "#fff", borderRadius: "0.625rem", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
                      {record.image ? (
        <img src={record.image as string} alt={record.accoladeName as string} style={{ width: "100%", height: "200px", objectFit: "cover", objectPosition: "top", display: "block" }} />
      ) : (
        <div style={{ height: "200px", background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.4">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>
          </svg>
        </div>
      )}
                      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: "0 0 0.35rem", lineHeight: 1.3 }}>{record.accoladeName as string}</h3>
                      </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export const accoladeListingConfig = {
  label: "Accolade Listing",
  ai: {
    instructions: "Accolade listing — fetches awards and rankings from CMS. Place near top of page for social proof.",
  },
  fields: {
    eyebrow:         { type: "text",    label: "Eyebrow",          contentEditable: true } as any,
    heading:         { type: "text",    label: "Heading",          contentEditable: true } as any,
    subtext:         { type: "textarea",label: "Subtext (optional)",contentEditable: true } as any,
    columns:         { type: "select",  label: "Columns",          options: [{ label: "2", value: 2 }, { label: "3", value: 3 }, { label: "4", value: 4 }] },
    accentColor:     { type: "text",    label: "Accent Color" },
    backgroundColor: { type: "text",    label: "Background Color" },
  },
  defaultProps: {
    eyebrow: "Accolades",
    heading: "Our Accolades",
    subtext: "",
    columns: 3,
    accentColor: "#5b21b6",
    backgroundColor: "#ffffff",
  },
  render: (props) => <AccoladeListing {...props} />,
} as ComponentConfig<AccoladeListingProps>;
