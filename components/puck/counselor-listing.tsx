"use client";

import { ComponentConfig } from "@puckeditor/core";
import { useEffect, useState } from "react";
import type { CTRecord } from "../../lib/ct-client";

type CounselorRecord = CTRecord & {
  firstName: string;
  lastName: string;
  title: string;
  credential: string;
  bio: string;
  photo: string;
  geographyServed: string;
};

export type CounselorListingProps = {
  eyebrow: string;
  heading: string;
  subtext: string;
  geographyFilter: "All" | "United States" | "International";
  columns: 2 | 3 | 4;
  accentColor: string;
  backgroundColor: string;
};

function CounselorCard({ counselor, accent }: { counselor: CounselorRecord; accent: string }) {
  const fullName = [counselor.firstName, counselor.lastName].filter(Boolean).join(" ");
  const titleLine = [counselor.title, counselor.credential].filter(Boolean).join(" · ");

  return (
    <article style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#fff",
      borderRadius: "0.625rem",
      overflow: "hidden",
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
    }}>
      {counselor.photo ? (
        <img
          src={counselor.photo}
          alt={fullName}
          style={{ width: "100%", height: "300px", objectFit: "cover", objectPosition: "center 20%", display: "block" }}
        />
      ) : (
        <div style={{
          height: "300px",
          background: `linear-gradient(135deg, ${accent}18 0%, ${accent}33 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}

      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
        {counselor.geographyServed && (
          <span style={{
            alignSelf: "flex-start",
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em",
            textTransform: "uppercase", background: `${accent}18`, color: accent,
            padding: "0.15rem 0.55rem", borderRadius: "99px", marginBottom: "0.6rem",
          }}>
            {counselor.geographyServed}
          </span>
        )}
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: "0 0 0.2rem", lineHeight: 1.3 }}>
          {fullName || "Counselor"}
        </h3>
        {titleLine && (
          <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 0.75rem" }}>
            {titleLine}
          </p>
        )}
        {counselor.bio && (
          <p style={{
            fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.6, margin: 0,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {counselor.bio}
          </p>
        )}
      </div>
    </article>
  );
}

export function CounselorListing({
  eyebrow, heading, subtext, geographyFilter, columns, accentColor, backgroundColor,
}: CounselorListingProps) {
  const [counselors, setCounselors] = useState<CounselorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ct/counselors")
      .then((r) => r.json())
      .then((all: CounselorRecord[]) => {
        const filtered = geographyFilter === "All"
          ? all
          : all.filter((c) => c.geographyServed === geographyFilter);
        setCounselors(filtered);
      })
      .catch(() => setCounselors([]))
      .finally(() => setLoading(false));
  }, [geographyFilter]);

  return (
    <section style={{ backgroundColor, padding: "5rem 2rem", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "3rem" }}>
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

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", fontSize: "0.9rem" }}>
            Loading counselors…
          </div>
        ) : counselors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", fontSize: "0.9rem" }}>
            No counselors found.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "1.5rem",
          }}>
            {counselors.map((c) => (
              <CounselorCard key={c.id} counselor={c} accent={accentColor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export const counselorListingConfig = {
  label: "Counselor Listing",
  ai: {
    instructions: "Counselor listing — fetches admissions counselors from CMS. Filter by geography: All, United States, or International.",
  },
  fields: {
    eyebrow: { type: "text", label: "Eyebrow", contentEditable: true } as any,
    heading: { type: "text", label: "Heading", contentEditable: true } as any,
    subtext: { type: "textarea", label: "Subtext (optional)", contentEditable: true } as any,
    geographyFilter: {
      type: "select",
      label: "Filter by Geography",
      options: [
        { label: "All", value: "All" },
        { label: "United States", value: "United States" },
        { label: "International", value: "International" },
      ],
    },
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    },
    accentColor: { type: "text", label: "Accent Color" },
    backgroundColor: { type: "text", label: "Background Color" },
  },
  defaultProps: {
    eyebrow: "Meet Our Team",
    heading: "Counselors",
    subtext: "",
    geographyFilter: "All",
    columns: 3,
    accentColor: "#1d4ed8",
    backgroundColor: "#ffffff",
  },
  render: (props) => <CounselorListing {...props} />,
} as ComponentConfig<CounselorListingProps>;
