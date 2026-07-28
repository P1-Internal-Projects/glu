import React from "react";
import { colors, layout, spacing } from "../tokens";

export type SectionBackground = "white" | "offWhite" | "navy" | "lightBlue";

export interface SectionProps {
  background?: SectionBackground;
  paddingY?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  id?: string;
}

const bgColors: Record<SectionBackground, string> = {
  white: colors.white,
  offWhite: colors.offWhite,
  navy: colors.navy,
  lightBlue: colors.lightBlue,
};

export function Section({
  background = "white",
  paddingY = layout.sectionPaddingY,
  children,
  style,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      style={{
        backgroundColor: bgColors[background],
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
