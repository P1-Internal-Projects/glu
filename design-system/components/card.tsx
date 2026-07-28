import React from "react";
import { colors, radii, shadows } from "../tokens";

export interface CardProps {
  hover?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ hover = true, children, style, className }: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={className}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        border: `1px solid ${isHovered ? colors.blue : colors.border}`,
        boxShadow: isHovered ? shadows.md : shadows.sm,
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
