import React from "react";
import { colors, typography, radii, spacing } from "../tokens";

export type BadgeVariant = "navy" | "gold" | "blue" | "light" | "success" | "error";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  navy: { backgroundColor: colors.navy, color: colors.white },
  gold: { backgroundColor: colors.gold, color: colors.white },
  blue: { backgroundColor: colors.blue, color: colors.white },
  light: { backgroundColor: colors.lightBlue, color: colors.navy },
  success: { backgroundColor: colors.success, color: colors.white },
  error: { backgroundColor: colors.error, color: colors.white },
};

export function Badge({ variant = "navy", children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${spacing[1]} ${spacing[3]}`,
        fontSize: typography.sizeXs,
        fontFamily: typography.fontBody,
        fontWeight: typography.weightSemibold,
        letterSpacing: "0.05em",
        textTransform: "uppercase" as const,
        borderRadius: radii.full,
        lineHeight: 1,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
