import React from "react";
import { colors, typography } from "../tokens";

interface BaseTypographyProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

function makeHeading(
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  size: string,
  lineHeight: number = typography.lineHeightTight
) {
  return function Heading({ children, style, className, id }: BaseTypographyProps) {
    return React.createElement(
      tag,
      {
        id,
        className,
        style: {
          fontFamily: typography.fontHeading,
          fontSize: size,
          fontWeight: typography.weightBold,
          color: colors.dark,
          lineHeight,
          margin: 0,
          ...style,
        },
      },
      children
    );
  };
}

export const H1 = makeHeading("h1", typography.size6xl);
export const H2 = makeHeading("h2", typography.size4xl);
export const H3 = makeHeading("h3", typography.size3xl);
export const H4 = makeHeading("h4", typography.size2xl, typography.lineHeightSnug);
export const H5 = makeHeading("h5", typography.sizeXl, typography.lineHeightSnug);
export const H6 = makeHeading("h6", typography.sizeLg, typography.lineHeightNormal);

export interface BodyProps extends BaseTypographyProps {
  size?: "sm" | "base" | "lg";
  muted?: boolean;
}

export function Body({ children, size = "base", muted, style, className }: BodyProps) {
  const sizeMap = {
    sm: typography.sizeSm,
    base: typography.sizeBase,
    lg: typography.sizeLg,
  };
  return (
    <p
      className={className}
      style={{
        fontFamily: typography.fontBody,
        fontSize: sizeMap[size],
        color: muted ? colors.muted : colors.dark,
        lineHeight: typography.lineHeightRelaxed,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export interface EyebrowProps extends BaseTypographyProps {
  light?: boolean;
}

export function Eyebrow({ children, light, style, className }: EyebrowProps) {
  return (
    <p
      className={className}
      style={{
        fontFamily: typography.fontBody,
        fontSize: typography.sizeSm,
        fontWeight: typography.weightSemibold,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        color: light ? "rgba(255,255,255,0.75)" : colors.navy,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function Caption({ children, style, className }: BaseTypographyProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: typography.fontBody,
        fontSize: typography.sizeXs,
        color: colors.muted,
        lineHeight: typography.lineHeightNormal,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Label({ children, style, className }: BaseTypographyProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: typography.fontBody,
        fontSize: typography.sizeSm,
        fontWeight: typography.weightSemibold,
        color: colors.dark,
        lineHeight: typography.lineHeightNormal,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
