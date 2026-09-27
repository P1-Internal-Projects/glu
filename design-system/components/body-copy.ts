import type React from "react";
import { colors, typography } from "../tokens";

/**
 * The look of long-form body copy: Paragraph, Text List and Quote blocks.
 *
 * Those blocks came with the starter kit and were styled by Tailwind defaults
 * (`prose`, neutral greys, blue links), so a GLU article read as a different
 * site from the sections around it. This is the one place their type and
 * colour come from, drawn from the same tokens every GLU section uses.
 *
 * Paragraph renders rich-text HTML, whose elements a React component cannot
 * style one by one, so it keeps Tailwind's `prose` layout and repoints the
 * `--tw-prose-*` colour variables here instead. Setting them inline, rather
 * than in a stylesheet, keeps the change inside the block: no global rule has
 * to reach into the editor canvas (see __tests__/styles-canvas-scope.test.ts).
 */
export const bodyCopyStyle = {
  fontFamily: typography.fontBody,
  fontSize: typography.sizeBase,
  lineHeight: typography.lineHeightRelaxed,
  color: colors.dark,
} as const satisfies React.CSSProperties;

/** Tailwind typography's colour variables, set to GLU's palette. */
export const proseVars = {
  "--tw-prose-body": colors.dark,
  "--tw-prose-headings": colors.dark,
  "--tw-prose-lead": colors.muted,
  "--tw-prose-links": colors.crimson,
  "--tw-prose-bold": colors.dark,
  "--tw-prose-counters": colors.crimson,
  "--tw-prose-bullets": colors.crimson,
  "--tw-prose-hr": colors.border,
  "--tw-prose-quotes": colors.dark,
  "--tw-prose-quote-borders": colors.crimson,
  "--tw-prose-captions": colors.muted,
  "--tw-prose-code": colors.dark,
} as React.CSSProperties;

/** A link inside body copy. */
export const bodyLinkStyle = {
  color: colors.crimson,
  textDecoration: "underline",
  textUnderlineOffset: "2px",
} as const satisfies React.CSSProperties;
