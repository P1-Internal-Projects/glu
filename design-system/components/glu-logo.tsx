import React from "react";

type GLULogoProps = {
  color?: string;
  width?: number;
};

export function GLULogo({ color = "currentColor", width = 200 }: GLULogoProps) {
  const height = Math.round(width * (80 / 340));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Grand Lakes University"
      role="img"
    >
      {/* ── Heraldic Shield ─────────────────────────────────── */}
      {/* Outer border — classic heater shield, pointed base */}
      <path
        d="M 3,3 L 57,3 L 57,50 Q 30,73 3,50 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner inset — double-border collegiate detail */}
      <path
        d="M 8,8 L 52,8 L 52,48 Q 30,67 8,48 Z"
        fill="none"
        stroke={color}
        strokeWidth="0.75"
        opacity="0.45"
        strokeLinejoin="round"
      />

      {/* Three stars — top of field */}
      <text x="17" y="22" textAnchor="middle" fontFamily="serif" fontSize="9" fill={color}>★</text>
      <text x="30" y="19" textAnchor="middle" fontFamily="serif" fontSize="9" fill={color}>★</text>
      <text x="43" y="22" textAnchor="middle" fontFamily="serif" fontSize="9" fill={color}>★</text>

      {/* Block "G" monogram — bold Playfair, centered in shield */}
      <text
        x="30"
        y="57"
        textAnchor="middle"
        fontFamily="var(--font-heading), 'Playfair Display', Georgia, serif"
        fontSize="38"
        fontWeight="900"
        fill={color}
      >
        G
      </text>

      {/* ── Separator ────────────────────────────────────────── */}
      <line x1="70" y1="8" x2="70" y2="72" stroke={color} strokeWidth="0.75" opacity="0.3" />

      {/* ── Wordmark ─────────────────────────────────────────── */}
      {/* "GRAND LAKES" — strong serifed display */}
      <text
        x="82"
        y="40"
        fontFamily="var(--font-heading), 'Playfair Display', Georgia, serif"
        fontSize="27"
        fontWeight="700"
        letterSpacing="2"
        fill={color}
      >
        GRAND LAKES
      </text>

      {/* Double rule — classic print-era university mark */}
      <line x1="82" y1="47" x2="336" y2="47" stroke={color} strokeWidth="1.5" />
      <line x1="82" y1="50.5" x2="336" y2="50.5" stroke={color} strokeWidth="0.5" opacity="0.5" />

      {/* "UNIVERSITY" — tracked sans, small caps energy */}
      <text
        x="82"
        y="66"
        fontFamily="var(--font-body), Inter, 'Helvetica Neue', Arial, sans-serif"
        fontSize="10"
        fontWeight="700"
        letterSpacing="6.5"
        fill={color}
      >
        UNIVERSITY
      </text>
    </svg>
  );
}
