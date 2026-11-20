import type { RichtextField } from "@puckeditor/core";

import { InlineMenuWithLink, MenuWithLink } from "./rich-text-link-menu";

/**
 * Link editing for a richtext field. Puck includes TipTap's Link extension in
 * every richtext field but ships no toolbar control for it, so this adds one
 * through the field's documented extension points: `renderMenu` /
 * `renderInlineMenu` for the button, `options.link` for the extension's
 * settings and `tiptap.selector` for the button's state.
 * See rich-text-link.md.
 *
 *   body: withLinkEditing({ type: "richtext", label: "Body Text", contentEditable: true }),
 *
 * Server-safe: the menu lives behind "use client" in ./rich-text-link-menu.
 */
export function withLinkEditing(field: RichtextField): RichtextField {
  return {
    ...field,
    renderMenu: (props) => <MenuWithLink {...props} />,
    renderInlineMenu: (props) => <InlineMenuWithLink {...props} />,
    options: { ...field.options, link: LINK_OPTIONS },
    tiptap: {
      ...field.tiptap,
      selector: (ctx, readOnly) => ({
        ...field.tiptap?.selector?.(ctx, readOnly),
        isLink: !!ctx.editor?.isActive("link"),
        hasSelection: !!ctx.editor && !ctx.editor.state.selection.empty,
      }),
    },
  };
}

/**
 * Overrides three TipTap defaults:
 * - openOnClick: a click inside a link in the editor followed it;
 * - HTMLAttributes: every link was saved target="_blank" rel="noopener
 *   noreferrer nofollow", links to this site's own pages included;
 * - defaultProtocol: a domain typed into the text autolinks to https.
 */
const LINK_OPTIONS = {
  openOnClick: false,
  HTMLAttributes: { target: null, rel: null },
  defaultProtocol: "https",
};

/** What the link form edits. */
export interface LinkValues {
  href: string;
  newTab: boolean;
  rel: string;
  title: string;
}

const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/**
 * Turn what an author typed into an href, or null if it cannot be one.
 * `example.com` becomes `https://example.com` (TipTap's defaultProtocol only
 * applies to autolinks, not to setLink); an email address becomes mailto:.
 */
export function normalizeHref(input: string): string | null {
  const value = input.trim();
  if (!value || /\s/.test(value)) return null;
  // Site paths and anchors. Browsers read `/\` as `//`: another host. No bare
  // `?query`: the sanitizer would strip it from the published page.
  if (/^[/#]/.test(value)) return value.startsWith("/\\") ? null : value;
  const scheme = /^([a-z][a-z0-9+-]*):/i.exec(value)?.[1];
  if (scheme) return SAFE_SCHEMES.has(scheme.toLowerCase()) ? value : null;
  if (/^[^@/]+@[^@/]+\.[^@/]+$/.test(value)) return `mailto:${value}`;
  if (/^[^/]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(value)) return `https://${value}`;
  return null;
}

/**
 * Attributes for TipTap's `setLink`; null leaves one off the <a>. A new tab
 * brings `noopener noreferrer` with it, and turning it off takes them away.
 * Any other rel the author entered is kept as written.
 */
export function linkAttrs({ href, newTab, rel, title }: LinkValues) {
  const tokens = new Set(rel.toLowerCase().split(/\s+/).filter(Boolean));
  for (const token of ["noopener", "noreferrer"]) {
    if (newTab) tokens.add(token);
    else tokens.delete(token);
  }
  return {
    href,
    target: newTab ? "_blank" : null,
    rel: tokens.size ? [...tokens].join(" ") : null,
    title: title.trim() || null,
  };
}

/** Read an existing link back into the form. */
export function readLink(attrs: Record<string, unknown>): LinkValues {
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  return {
    href: text(attrs.href),
    newTab: attrs.target === "_blank",
    rel: text(attrs.rel),
    title: text(attrs.title),
  };
}
