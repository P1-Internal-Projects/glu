"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { colors, layout, radii, spacing, typography } from "../../design-system/tokens";

/**
 * A staff profile, and the place a person's structured fields live.
 *
 * Pinned by the Counselor template, so every page built from it carries exactly
 * one — which is what lets the `gluPeople` datasource read the page back as a
 * record. Plain fields rather than contentEditable ones, for the same reason as
 * GLUEventHeader: these values are read as data as well as rendered.
 */
export type GLUPersonProfileProps = {
  name: string;
  role: string;
  focusArea: string;
  territory: string;
  email: string;
  phone: string;
  photoUrl: string;
  bio: string;
};

export function GLUPersonProfile({
  name,
  role,
  focusArea,
  territory,
  email,
  phone,
  photoUrl,
  bio,
}: GLUPersonProfileProps) {
  return (
    <section style={{ padding: `${spacing[16]} ${spacing[6]}`, backgroundColor: colors.white }}>
      <div
        style={{
          maxWidth: layout.containerMax,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: spacing[10],
          alignItems: "flex-start",
        }}
      >
        {photoUrl && (
          <img
            src={photoUrl}
            alt=""
            style={{
              width: "220px",
              height: "220px",
              objectFit: "cover",
              borderRadius: radii.lg,
              flexShrink: 0,
            }}
          />
        )}

        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <h1
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.size4xl,
              fontWeight: typography.weightBold,
              color: colors.dark,
              margin: `0 0 ${spacing[2]}`,
            }}
          >
            {name}
          </h1>

          {role && (
            <p
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeLg,
                color: colors.crimson,
                fontWeight: typography.weightSemibold,
                margin: `0 0 ${spacing[4]}`,
              }}
            >
              {role}
            </p>
          )}

          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: `${spacing[2]} ${spacing[4]}`,
              fontFamily: typography.fontBody,
              fontSize: typography.sizeSm,
              margin: `0 0 ${spacing[6]}`,
            }}
          >
            {[
              ["Focus", focusArea],
              ["Territory", territory],
              ["Email", email],
              ["Phone", phone],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt style={{ color: colors.muted, fontWeight: typography.weightSemibold }}>{k}</dt>
                  <dd style={{ margin: 0, color: colors.dark }}>
                    {k === "Email" ? <a href={`mailto:${v}`} style={{ color: colors.crimson }}>{v}</a> : v}
                  </dd>
                </React.Fragment>
              ))}
          </dl>

          {bio && (
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
              {bio}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export const gluPersonProfileConfig = {
  label: "GLU Person Profile",
  ai: {
    instructions:
      "Staff profile AND the person's data record. One per counselor page, pinned by the Counselor template. The Counselors listing reads this block.",
  },
  fields: {
    name: { type: "text", label: "Full Name" },
    role: { type: "text", label: "Role / Title" },
    focusArea: { type: "text", label: "Focus Area" },
    territory: { type: "text", label: "Territory" },
    email: { type: "text", label: "Email" },
    phone: { type: "text", label: "Phone" },
    // Rendered as the media library picker, not a text box: lib/media-fields.ts
    // matches this name. The stored value stays a plain CDN URL string, which
    // is what the Counselors listing binds to as `{{ item.photoUrl }}`.
    photoUrl: { type: "text", label: "Headshot" },
    bio: { type: "textarea", label: "Biography" },
  },
  defaultProps: {
    name: "Name",
    role: "",
    focusArea: "",
    territory: "",
    email: "",
    phone: "",
    photoUrl: "",
    bio: "",
  },
  render: GLUPersonProfile,
} as unknown as ComponentConfig<GLUPersonProfileProps>;
