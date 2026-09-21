"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { Button } from "../../design-system/components/button";
import { Container } from "../../design-system/components/container";
import { Eyebrow } from "../../design-system/components/typography";
import { colors, radii, shadows, spacing, typography } from "../../design-system/tokens";
import { headshotOrSilhouette } from "../../lib/glu-assets";
import { buttonLabelAi } from "../../lib/ai-hints";

/**
 * A staff profile, and the place a person's structured fields live.
 *
 * Pinned by the Counselor template, so every page built from it carries exactly
 * one — which is what lets the `gluPeople` datasource read the page back as a
 * record. Plain fields rather than contentEditable ones, for the same reason as
 * GLUEventHeader: these values are read as data as well as rendered.
 *
 * Two kinds of prop live here and the split matters. The record fields (name
 * through bio) are the person: they are what the listing reads and what a
 * translation carries. The presentation fields (layout, background,
 * photoShape) are how this page chooses to draw them, and a listing never sees
 * them. Keeping both on one block is deliberate — an editor sets up a counselor
 * page in one panel — but a new field has to go in the right group, or it ends
 * up in the datasource as noise.
 */
export type GLUPersonProfileProps = {
  name: string;
  pronouns: string;
  role: string;
  focusArea: string;
  territory: string;
  languages: string;
  email: string;
  phone: string;
  officeLocation: string;
  officeHours: string;
  bookingUrl: string;
  bookingLabel: string;
  photoUrl: string;
  bio: string;
  layout: "split" | "centered";
  background: "white" | "offWhite" | "lightBlue" | "crimson";
  photoShape: "rounded" | "circle";
};

const BG: Record<GLUPersonProfileProps["background"], string> = {
  white: colors.white,
  offWhite: colors.offWhite,
  lightBlue: colors.lightBlue,
  crimson: colors.crimson,
};

function Chip({ label, value, onDark }: { label: string; value: string; onDark: boolean }) {
  if (!value) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: spacing[2],
        padding: `${spacing[2]} ${spacing[3]}`,
        borderRadius: radii.full,
        fontFamily: typography.fontBody,
        fontSize: typography.sizeSm,
        backgroundColor: onDark ? "rgba(255,255,255,0.12)" : colors.lightBlue,
        color: onDark ? colors.white : colors.dark,
        border: `1px solid ${onDark ? "rgba(255,255,255,0.25)" : colors.border}`,
      }}
    >
      <span
        style={{
          fontSize: typography.sizeXs,
          fontWeight: typography.weightSemibold,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: onDark ? colors.goldLight : colors.crimson,
        }}
      >
        {label}
      </span>
      {value}
    </span>
  );
}

function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <>
      <dt
        style={{
          color: colors.muted,
          fontSize: typography.sizeXs,
          fontWeight: typography.weightSemibold,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          alignSelf: "baseline",
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: 0, color: colors.dark, fontSize: typography.sizeSm, lineHeight: typography.lineHeightSnug }}>
        {children}
      </dd>
    </>
  );
}

/**
 * The contact card is always a white card, whatever the section background:
 * it is the one part of the page a visitor acts on, so it reads the same on the
 * crimson variant as on the plain one.
 */
function ContactCard(props: GLUPersonProfileProps) {
  const { email, phone, officeLocation, officeHours, languages, bookingUrl, bookingLabel } = props;
  const hasRows = Boolean(email || phone || officeLocation || officeHours || languages);
  const hasActions = Boolean(bookingUrl || email);
  if (!hasRows && !hasActions) return null;

  return (
    <div
      style={{
        backgroundColor: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.xl,
        boxShadow: shadows.md,
        padding: spacing[6],
        fontFamily: typography.fontBody,
        display: "flex",
        flexDirection: "column",
        gap: spacing[5],
      }}
    >
      {hasRows && (
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: spacing[5],
            rowGap: spacing[3],
            margin: 0,
          }}
        >
          <ContactRow label="Email">
            {email && (
              <a href={`mailto:${email}`} style={{ color: colors.crimson, fontWeight: typography.weightMedium, textDecoration: "none" }}>
                {email}
              </a>
            )}
          </ContactRow>
          <ContactRow label="Phone">
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} style={{ color: colors.dark, textDecoration: "none" }}>
                {phone}
              </a>
            )}
          </ContactRow>
          <ContactRow label="Office">{officeLocation}</ContactRow>
          <ContactRow label="Hours">{officeHours}</ContactRow>
          <ContactRow label="Languages">{languages}</ContactRow>
        </dl>
      )}
      {hasActions && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing[3] }}>
          {bookingUrl && (
            <Button href={bookingUrl} variant="primary" size="md">
              {bookingLabel || "Schedule a conversation"}
            </Button>
          )}
          {email && (
            <Button href={`mailto:${email}`} variant="outline" size="md">
              Email me
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function GLUPersonProfile(props: GLUPersonProfileProps) {
  const {
    name,
    pronouns,
    role,
    focusArea,
    territory,
    photoUrl,
    bio,
    layout = "split",
    background = "white",
    photoShape = "rounded",
  } = props;
  const onDark = background === "crimson";
  const centered = layout === "centered";
  const src = headshotOrSilhouette(photoUrl);
  const ink = onDark ? colors.white : colors.dark;
  const soft = onDark ? "rgba(255,255,255,0.78)" : colors.muted;
  // The silhouette is a transparent PNG, so the tile behind it is chosen here
  // to sit one step off the section: a white section gets a blush tile, a
  // tinted one gets white, crimson gets a translucent lift. A photo covers it.
  const tileBg = onDark
    ? "rgba(255,255,255,0.12)"
    : background === "white"
      ? colors.offWhite
      : colors.white;

  const photo = (
    <div
      style={{
        width: centered ? "200px" : "100%",
        maxWidth: centered ? "200px" : "320px",
        aspectRatio: "1 / 1",
        borderRadius: photoShape === "circle" ? radii.full : radii["2xl"],
        overflow: "hidden",
        boxShadow: shadows.lg,
        border: `4px solid ${onDark ? "rgba(255,255,255,0.18)" : colors.white}`,
        backgroundColor: tileBg,
        flexShrink: 0,
        margin: centered ? "0 auto" : undefined,
      }}
    >
      <img
        src={src}
        alt={photoUrl ? name : ""}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );

  const heading = (
    <div style={{ textAlign: centered ? "center" : "left" }}>
      <Eyebrow light={onDark} style={{ marginBottom: spacing[3] }}>
        Admissions Counselor
      </Eyebrow>
      <h1
        style={{
          fontFamily: typography.fontHeading,
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: typography.weightBold,
          lineHeight: typography.lineHeightTight,
          color: ink,
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: centered ? "center" : "flex-start",
          gap: spacing[3],
        }}
      >
        {name}
        {pronouns && (
          <span
            style={{
              fontFamily: typography.fontBody,
              fontSize: typography.sizeBase,
              fontWeight: typography.weightNormal,
              color: soft,
            }}
          >
            ({pronouns})
          </span>
        )}
      </h1>
      {role && (
        <p
          style={{
            fontFamily: typography.fontBody,
            fontSize: typography.sizeLg,
            fontWeight: typography.weightSemibold,
            color: onDark ? colors.goldLight : colors.crimson,
            margin: `${spacing[2]} 0 0`,
          }}
        >
          {role}
        </p>
      )}
      {(focusArea || territory) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing[2],
            marginTop: spacing[5],
            justifyContent: centered ? "center" : "flex-start",
          }}
        >
          <Chip label="Focus" value={focusArea} onDark={onDark} />
          <Chip label="Territory" value={territory} onDark={onDark} />
        </div>
      )}
      {bio && (
        <p
          style={{
            fontFamily: typography.fontBody,
            fontSize: typography.sizeLg,
            lineHeight: typography.lineHeightRelaxed,
            color: onDark ? "rgba(255,255,255,0.9)" : colors.dark,
            margin: `${spacing[6]} ${centered ? "auto" : 0} 0`,
            maxWidth: "62ch",
          }}
        >
          {bio}
        </p>
      )}
    </div>
  );

  return (
    <section style={{ backgroundColor: BG[background], padding: `${spacing[16]} 0` }}>
      <Container>
        {centered ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing[8] }}>
            {photo}
            {heading}
            <div style={{ width: "100%", maxWidth: "560px" }}>
              <ContactCard {...props} />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: spacing[10],
              alignItems: "start",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: spacing[6], maxWidth: "360px" }}>
              {photo}
              <ContactCard {...props} />
            </div>
            <div style={{ gridColumn: "span 2", minWidth: 0 }}>{heading}</div>
          </div>
        )}
      </Container>
    </section>
  );
}

export const gluPersonProfileConfig = {
  label: "GLU Person Profile",
  ai: {
    instructions:
      "Staff profile AND the person's data record. One per counselor page, pinned by the Counselor template; the Counselors listing reads this block. Fill the record fields from what you know about the person and leave photoUrl blank if no headshot is available — the block draws the GLU silhouette. Presentation fields (layout, background, photoShape) are page styling, not data.",
  },
  fields: {
    name: { type: "text", label: "Full Name", ai: { required: true } },
    pronouns: { type: "text", label: "Pronouns", ai: { instructions: "Optional, e.g. she/her. Leave blank if unknown." } },
    role: { type: "text", label: "Role / Title", ai: { required: true, instructions: "Official title, e.g. 'Senior Admissions Counselor'." } },
    focusArea: { type: "text", label: "Focus Area", ai: { instructions: "Who this counselor advises, e.g. 'Transfer applicants'." } },
    territory: { type: "text", label: "Territory", ai: { instructions: "Region or states covered." } },
    languages: { type: "text", label: "Languages", ai: { instructions: "Comma-separated, e.g. 'English, Spanish'." } },
    email: { type: "text", label: "Email", ai: { stream: false } },
    phone: { type: "text", label: "Phone", ai: { stream: false } },
    officeLocation: { type: "text", label: "Office", ai: { instructions: "Building and room, e.g. 'Visitor Center, Room 120'." } },
    officeHours: { type: "text", label: "Office Hours", ai: { instructions: "Drop-in hours as displayed, e.g. 'Wednesdays 1–4 PM'." } },
    bookingUrl: { type: "text", label: "Booking URL", ai: { stream: false } },
    bookingLabel: { type: "text", label: "Booking Button Label", ai: buttonLabelAi("Schedule a conversation") },
    // Rendered as the media library picker, not a text box: lib/media-fields.ts
    // matches this name. The stored value stays a plain CDN URL string, which
    // is what the Counselors listing binds to as `{{ item.photoUrl }}`.
    photoUrl: { type: "text", label: "Headshot", ai: { stream: false } },
    bio: { type: "textarea", label: "Biography", ai: { instructions: "2–3 sentences in the third person." } },
    layout: {
      type: "radio",
      label: "Layout",
      options: [
        { label: "Photo beside", value: "split" },
        { label: "Centered", value: "centered" },
      ],
      ai: { instructions: "split unless the rest of the page is centred." },
    },
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "White", value: "white" },
        { label: "Off White", value: "offWhite" },
        { label: "Light Rose", value: "lightBlue" },
        { label: "Crimson", value: "crimson" },
      ],
      ai: { instructions: "white by default. crimson only for a featured profile, and never when the next section is also crimson." },
    },
    photoShape: {
      type: "radio",
      label: "Photo Shape",
      options: [
        { label: "Rounded", value: "rounded" },
        { label: "Circle", value: "circle" },
      ],
      ai: { instructions: "rounded for the split layout, circle for centered." },
    },
  },
  defaultProps: {
    name: "New Counselor",
    pronouns: "",
    role: "Admissions Counselor",
    focusArea: "",
    territory: "",
    languages: "English",
    email: "",
    phone: "",
    officeLocation: "Visitor Center, Room 120",
    officeHours: "",
    bookingUrl: "/visit/open-house",
    bookingLabel: "Schedule a conversation",
    photoUrl: "",
    bio: "",
    layout: "split",
    background: "white",
    photoShape: "rounded",
  },
  render: GLUPersonProfile,
} as unknown as ComponentConfig<GLUPersonProfileProps>;
