import React from "react";
import { colors, typography, radii, spacing } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: colors.gold,
    color: colors.dark,
    border: `2px solid ${colors.gold}`,
  },
  secondary: {
    backgroundColor: colors.navy,
    color: colors.white,
    border: `2px solid ${colors.navy}`,
  },
  outline: {
    backgroundColor: "transparent",
    color: colors.navy,
    border: `2px solid ${colors.navy}`,
  },
  ghost: {
    backgroundColor: "transparent",
    color: colors.navy,
    border: "2px solid transparent",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.sizeSm,
  },
  md: {
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.sizeBase,
  },
  lg: {
    padding: `${spacing[4]} ${spacing[8]}`,
    fontSize: typography.sizeLg,
  },
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  fullWidth,
  children,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: typography.fontBody,
    fontWeight: typography.weightSemibold,
    borderRadius: radii.full,
    cursor: "pointer",
    textDecoration: "none",
    lineHeight: typography.lineHeightTight,
    transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
    whiteSpace: "nowrap",
    width: fullWidth ? "100%" : undefined,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  if (href) {
    return (
      <a href={href} style={base} {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button style={base} {...props}>
      {children}
    </button>
  );
}
