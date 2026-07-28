"use client";
import { ComponentConfig } from "@puckeditor/core";

export type CtEventProps = {
  title: string;
  eventType: string;
  description: string;
  location: string;
  date: string;
  time: string;
  cost: "Free" | "Paid" | "";
  registrationLink: string;
  imageUrl: string;
};

function formatEventDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CtEvent({
  title,
  eventType,
  description,
  location,
  date,
  time,
  registrationLink,
  imageUrl,
}: CtEventProps) {
  const displayDate = formatEventDate(date);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        .ct-event-card {
          font-family: 'Poppins', sans-serif;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          max-width: 680px;
          margin: 1.5rem auto;
        }
        .ct-event-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: #ede9fe;
          color: #5b21b6;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
        }
        .ct-event-date {
          font-size: 0.82rem;
          font-weight: 500;
          color: #6d6d78;
        }
        .ct-event-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
          margin: 0.4rem 0 0.6rem;
        }
        .ct-event-desc {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }
        .ct-event-meta {
          font-size: 0.82rem;
          color: #6b7280;
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .ct-event-meta span { display: flex; align-items: center; gap: 0.3rem; }
        .ct-event-cta {
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
          background: #5b21b6;
          padding: 0.55rem 1.25rem;
          border-radius: 99px;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .ct-event-cta:hover { opacity: 0.85; }
      `}</style>
      <article className="ct-event-card">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
          />
        )}
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            {eventType && <span className="ct-event-badge">{eventType}</span>}
            {displayDate && <span className="ct-event-date">{displayDate}</span>}
          </div>
          <h2 className="ct-event-title">{title}</h2>
          {description && <p className="ct-event-desc">{description}</p>}
          <div className="ct-event-meta">
            {time && (
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {time}
              </span>
            )}
            {location && (
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {location}
              </span>
            )}
          </div>
          {registrationLink && (
            <a href={registrationLink} className="ct-event-cta">
              Register Now
            </a>
          )}
        </div>
      </article>
    </>
  );
}

export const ctEventConfig = {
  label: "Event",
  ai: {
    instructions: "Event record — defines a single event. Use Event Listing to display collections of events on pages.",
  },
  fields: {
    title: { type: "text", label: "Event Title" },
    eventType: { type: "text", label: "Event Type (e.g. Workshop, Webinar, Conference)" },
    description: { type: "textarea", label: "Description" },
    location: { type: "text", label: "Location" },
    date: {
      type: "custom",
      label: "Event Date",
      render: ({ value, onChange }) => (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 8px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      ),
    },
    time: { type: "text", label: "Time (e.g. 2:00 PM – 5:00 PM EDT)" },
    cost: {
      type: "select",
      label: "Cost",
      options: [
        { label: "— Select —", value: "" },
        { label: "Free", value: "Free" },
        { label: "Paid", value: "Paid" },
      ],
    },
    registrationLink: { type: "text", label: "Registration Link (URL)" },
    imageUrl: { type: "text", label: "Image URL" },
  },
  defaultProps: {
    title: "Event Title",
    eventType: "",
    description: "Join us for this exciting event.",
    location: "",
    date: "",
    time: "",
    cost: "",
    registrationLink: "",
    imageUrl: "",
  },
  render: (props) => <CtEvent {...props} />,
} as ComponentConfig<CtEventProps>;
