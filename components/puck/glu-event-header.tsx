"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Button } from "../../design-system/components/button";
import { colors, layout, radii, spacing, typography } from "../../design-system/tokens";
import { buttonLabelAi, imageAi, linkAi } from "../../lib/ai-hints";

/**
 * The masthead of a single event page, and the place an event's structured
 * fields live.
 *
 * These props are the event record. The Event template pins this component, so
 * every page created from that template carries exactly one of them at a known
 * place — which is what lets the `gluEvents` datasource read a page back as a
 * record without guessing (see lib/glu-collections.ts).
 *
 * None of the text fields are contentEditable. A contentEditable field's value
 * is a React element in the editor and a string on the published page, and
 * these values are also read as data and formatted as dates — so keeping them
 * plain fields keeps one type flowing through both paths.
 */
export type GLUEventHeaderProps = {
  eventType: string;
  title: string;
  summary: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  registrationUrl: string;
  registrationLabel: string;
  imageUrl: string;
};

/**
 * Formatted in UTC from the date parts rather than `new Date(iso)`, which reads
 * a bare `YYYY-MM-DD` as UTC midnight and then renders it in the viewer's zone —
 * turning an event into the previous day for anyone west of Greenwich.
 */
export function formatEventDate(iso: string, locale = "en-US"): string {
  if (!iso) return "";
  const parts = iso.split("-").map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return iso;
  const [y, m, d] = parts as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: spacing[2],
        fontFamily: typography.fontBody,
        fontSize: typography.sizeSm,
        color: "rgba(255,255,255,0.88)",
      }}
    >
      <span aria-hidden="true" style={{ display: "inline-flex", opacity: 0.8 }}>
        {icon}
      </span>
      {children}
    </span>
  );
}

const CalendarIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PinIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export function GLUEventHeader({
  eventType,
  title,
  summary,
  startDate,
  startTime,
  endTime,
  location,
  registrationUrl,
  registrationLabel,
  imageUrl,
}: GLUEventHeaderProps) {
  const when = [startTime, endTime].filter(Boolean).join(" – ");

  return (
    <section
      style={{
        position: "relative",
        backgroundColor: colors.crimson,
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: `${spacing[20]} ${spacing[6]} ${spacing[16]}`,
      }}
    >
      {imageUrl && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(107,0,16,0.82) 0%, rgba(139,0,21,0.92) 100%)`,
          }}
        />
      )}

      <div style={{ position: "relative", maxWidth: layout.containerMax, margin: "0 auto" }}>
        {eventType && (
          <p
            style={{
              display: "inline-block",
              fontFamily: typography.fontBody,
              fontSize: typography.sizeXs,
              fontWeight: typography.weightSemibold,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: colors.gold,
              border: `1px solid ${colors.gold}`,
              borderRadius: radii.full,
              padding: `${spacing[1]} ${spacing[3]}`,
              margin: `0 0 ${spacing[5]}`,
            }}
          >
            {eventType}
          </p>
        )}

        <h1
          style={{
            fontFamily: typography.fontHeading,
            fontSize: `clamp(${typography.size3xl}, 5vw, ${typography.size5xl})`,
            fontWeight: typography.weightBold,
            lineHeight: typography.lineHeightTight,
            color: colors.white,
            margin: `0 0 ${spacing[4]}`,
            maxWidth: "24ch",
          }}
        >
          {title}
        </h1>

        {summary && (
          <p
            style={{
              fontFamily: typography.fontBody,
              fontSize: typography.sizeLg,
              lineHeight: typography.lineHeightRelaxed,
              color: "rgba(255,255,255,0.9)",
              margin: `0 0 ${spacing[6]}`,
              maxWidth: "62ch",
            }}
          >
            {summary}
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: `${spacing[3]} ${spacing[6]}`,
            marginBottom: registrationUrl ? spacing[8] : 0,
          }}
        >
          <MetaItem icon={CalendarIcon}>{formatEventDate(startDate)}</MetaItem>
          <MetaItem icon={ClockIcon}>{when}</MetaItem>
          <MetaItem icon={PinIcon}>{location}</MetaItem>
        </div>

        {registrationUrl && (
          <Button variant="primary" href={registrationUrl}>
            {registrationLabel || "Register"}
          </Button>
        )}
      </div>
    </section>
  );
}

export const gluEventHeaderConfig = {
  label: "GLU Event Header",
  ai: {
    instructions:
      "Event masthead AND the event's data record. One per event page, pinned first by the Event template. Fill every field: the Upcoming Events listings read this block.",
  },
  fields: {
    eventType: {
      type: "select",
      label: "Event Type",
      options: [
        { label: "Open House", value: "Open House" },
        { label: "Campus Tour", value: "Campus Tour" },
        { label: "Webinar", value: "Webinar" },
        { label: "Workshop", value: "Workshop" },
        { label: "Deadline", value: "Deadline" },
        { label: "Information Session", value: "Information Session" },
      ],
      ai: { instructions: "The closest type; it becomes the badge on listing cards and a filter value." },
    },
    title: { type: "text", label: "Event Title", ai: { required: true, instructions: "The event's official name, e.g. 'Fall Open House 2026'." } },
    summary: { type: "textarea", label: "Summary", ai: { required: true, instructions: "1–2 sentences for the listing card: who it is for and what happens." } },
    startDate: { type: "text", label: "Date (YYYY-MM-DD)", ai: { required: true, stream: false, instructions: "YYYY-MM-DD exactly — listings sort and format on it." } },
    startTime: { type: "text", label: "Start Time", ai: { instructions: "As displayed, e.g. '9:00 AM'. Blank for all-day items and deadlines." } },
    endTime: { type: "text", label: "End Time", ai: { instructions: "As displayed, e.g. '3:00 PM'. Blank if open-ended." } },
    location: { type: "text", label: "Location", ai: { instructions: "Building and room, or 'Online'." } },
    registrationUrl: { type: "text", label: "Registration URL", ai: linkAi("Where to register or RSVP.", { optional: true }) },
    registrationLabel: { type: "text", label: "Registration Button Label", ai: buttonLabelAi("Register") },
    imageUrl: { type: "text", label: "Background Image URL", ai: imageAi("Wide photo behind the masthead; also the listing card image.") },
  },
  defaultProps: {
    eventType: "Open House",
    title: "Event title",
    summary: "",
    startDate: "",
    startTime: "",
    endTime: "",
    location: "",
    registrationUrl: "",
    registrationLabel: "Register",
    imageUrl: "",
  },
  render: GLUEventHeader,
} as unknown as ComponentConfig<GLUEventHeaderProps>;
