import type { CSSProperties, ReactNode } from "react";
import { sanitizeRichtextHtml } from "@pantheon-systems/puck-css/sanitize-richtext";

/**
 * Renders a richtext field value, in whichever shape it arrives:
 *
 * - a React element — Puck's inline editor while editing, or its own
 *   rendering where the field transform has run; rendered as-is;
 * - an HTML string — the stored value; sanitized, then set as HTML;
 * - a plain string — a default written as text; set as text.
 *
 * The wrapper carries `rich-text-prose` for the shared styles in ./rich.css.
 *
 * Sanitizing adds `title` to the defaults (href, target, rel) because the link
 * form writes it. Every tag a preset can produce is already a sanitizer
 * default. Caveat: puck-css 0.18.2 drops `target` and `rel` on this path even
 * though it allowlists them — see README "Sanitizer alignment".
 */

export const RICH_TEXT_SANITIZE_OPTIONS = { allowedAttrs: ["title"] } as const;

export function sanitizeRichText(html: string): string {
  return sanitizeRichtextHtml(html, RICH_TEXT_SANITIZE_OPTIONS);
}

export interface RichTextProps {
  value: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function RichText({ value, className, style }: RichTextProps) {
  if (value == null || value === "") return null;
  const wrapper = { className: className ? `rich-text-prose ${className}` : "rich-text-prose", style };

  if (typeof value === "string") {
    return /<[a-z][\s\S]*>/i.test(value) ? (
      <div {...wrapper} dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />
    ) : (
      <div {...wrapper}>
        <p>{value}</p>
      </div>
    );
  }
  // Elements, arrays and other nodes Puck may hand back; never sanitize an element tree.
  return <div {...wrapper}>{value}</div>;
}
