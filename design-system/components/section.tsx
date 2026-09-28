import React from "react";
import { colors, layout, spacing } from "../tokens";

/** Canonical, current stored values. */
export type SectionBackground = "white" | "offWhite" | "rose" | "crimson";

/**
 * Old stored values from before the blue -> crimson rebrand. Hundreds of
 * existing pages still hold these; they must keep rendering exactly as
 * before until content is migrated separately.
 */
export type LegacySectionBackground = "lightBlue" | "navy";

const bgColors: Record<SectionBackground, string> = {
  white: colors.white,
  offWhite: colors.offWhite,
  rose: colors.rose,
  crimson: colors.crimson,
};

/**
 * Normalizes a section background value, mapping legacy stored values
 * (lightBlue -> rose, navy -> crimson) to their current canonical
 * equivalents. Unknown/unset values fall back to "white".
 */
export function normalizeBackground(
  bg: SectionBackground | LegacySectionBackground | string | undefined | null
): SectionBackground {
  switch (bg) {
    case "lightBlue":
      return "rose";
    case "navy":
      return "crimson";
    case "white":
    case "offWhite":
    case "rose":
    case "crimson":
      return bg;
    default:
      return "white";
  }
}

export interface SectionProps {
  background?: SectionBackground | LegacySectionBackground;
  paddingY?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  id?: string;
}

export function Section({
  background = "white",
  paddingY = layout.sectionPaddingY,
  children,
  style,
  id,
}: SectionProps) {
  const normalized = normalizeBackground(background);
  return (
    <section
      id={id}
      style={{
        backgroundColor: bgColors[normalized],
        paddingTop: paddingY,
        paddingBottom: paddingY,
        width: "100%",
        ...style,
      }}
    >
      {children}
    </section>
  );
}
