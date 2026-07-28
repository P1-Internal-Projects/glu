import React from "react";
import { layout, spacing } from "../tokens";

export interface ContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Container({ children, style, className }: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        maxWidth: layout.containerMax,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: spacing[6],
        paddingRight: spacing[6],
        width: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
