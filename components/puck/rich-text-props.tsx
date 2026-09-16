import { isValidElement, type ReactNode } from "react";
import { sanitizeRichtextHtml } from "./sanitize-richtext";

/**
 * Renders a `richtext` field value, whichever of its two shapes arrives.
 *
 * Puck types a richtext value as `string | ReactNode`, and which one a block
 * receives depends on the surface. When Puck's own field transform has run, the
 * stored HTML has already been hydrated into elements and rendering `{value}`
 * is correct. When the raw string reaches the block instead, `{value}` is a
 * string child — so React escapes it and the reader sees a literal `<p><em>`
 * where the italics should be.
 *
 * Blocks that render `{value}` alone therefore work on one surface and fail on
 * another. The starter kit's own paragraph block branches on exactly this; these
 * blocks were written without that branch.
 *
 * Returns props to spread rather than an element, so the caller keeps its own
 * styled wrapper and no extra node appears in the DOM:
 *
 *   <div style={...} {...richTextProps(card.description)} />
 *
 * The element must be self-closing — React rejects `children` alongside
 * `dangerouslySetInnerHTML`, and this returns one or the other.
 *
 * The string branch is sanitized at the render boundary rather than trusted:
 * the value is document content, and anyone who can edit the document controls
 * it. See ./sanitize-richtext.
 */
export function richTextProps(
  value: string | ReactNode | undefined | null,
):
  | { children: ReactNode }
  | { dangerouslySetInnerHTML: { __html: string } } {
  if (value == null || value === "") return { children: null };
  // Already hydrated by Puck — render as-is, and never sanitize an element tree.
  if (isValidElement(value)) return { children: value };
  if (typeof value === "string") {
    return { dangerouslySetInnerHTML: { __html: sanitizeRichtextHtml(value) } };
  }
  // Arrays and other nodes Puck may hand back.
  return { children: value as ReactNode };
}
