/**
 * Pure link rules for the richtext link form: what an author typed becomes an
 * href, and the form's checkboxes become the link mark's attributes. No React,
 * no editor — so the rules are tested on their own (__tests__/rich-text-link).
 */

/** Schemes an author may link to. Everything else (javascript:, data:, …) is refused. */
const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

const SCHEME = /^([a-z][a-z0-9+.-]*):/i;
const EMAIL = /^[^\s@/:]+@[^\s@/:]+\.[^\s@/:]+$/;
// A host with at least one dot (example.com, www.example.co.uk), an optional
// port, then optionally a path, query or fragment.
const BARE_DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#]\S*)?$/i;

/**
 * Turn what an author typed into an href, or `null` when it is not one.
 *
 * - `/path`, `#anchor`, `?query` are kept as site-relative links.
 * - `http:`, `https:`, `mailto:`, `tel:` are kept as typed.
 * - `example.com/page` gains `https://` — without it the browser resolves the
 *   href against the current page, which is the GLU PR #41 bug.
 * - `name@example.com` becomes `mailto:`.
 * - Any other scheme (`javascript:`, `data:`, `vbscript:`, `file:`) and anything
 *   with spaces is refused.
 */
export function normalizeHref(input: string): string | null {
  // Browsers drop tabs and newlines inside URLs, so "java\tscript:" would run.
  // eslint-disable-next-line no-control-regex
  const value = input.trim().replace(/[\u0000-\u001F\u007F]/g, "");
  if (!value || /\s/.test(value)) return null;

  if (value.startsWith("//")) return BARE_DOMAIN.test(value.slice(2)) ? `https:${value}` : null;
  if (/^[/#?]/.test(value)) return value;

  const scheme = SCHEME.exec(value)?.[1]?.toLowerCase();
  // "localhost:3000" and "example.com:8080" look like a scheme but are a host and port.
  if (scheme && !/^[a-z0-9.-]+:\d/i.test(value)) {
    return SAFE_SCHEMES.has(scheme) ? value : null;
  }

  if (EMAIL.test(value)) return `mailto:${value}`;
  if (BARE_DOMAIN.test(value) || /^localhost(:\d+)?([/?#]|$)/i.test(value)) return `https://${value}`;
  return null;
}

/** A link to this site: a path, fragment or query, not another origin. */
export function isInternal(href: string): boolean {
  return /^[/#?]/.test(href) && !href.startsWith("//");
}

/** The choices in the link form. */
export interface LinkFormValues {
  href: string;
  newTab: boolean;
  nofollow: boolean;
  sponsored: boolean;
  title: string;
}

/** Attributes for TipTap's `setLink`. `null` leaves the attribute off the `<a>`. */
export interface LinkAttrs {
  href: string;
  target: string | null;
  rel: string | null;
  title: string | null;
}

/**
 * Build the link mark's attributes from the form.
 *
 * A new-tab link always gets `noopener noreferrer`. `nofollow` and `sponsored`
 * are only what the author ticked — never a default — and neither, nor a new
 * tab, applies to an internal link.
 */
export function buildLinkAttrs({ href, newTab, nofollow, sponsored, title }: LinkFormValues): LinkAttrs {
  const internal = isInternal(href);
  const opensNewTab = newTab && !internal;
  const rel = [
    ...(opensNewTab ? ["noopener", "noreferrer"] : []),
    ...(nofollow && !internal ? ["nofollow"] : []),
    ...(sponsored && !internal ? ["sponsored"] : []),
  ];
  return {
    href,
    target: opensNewTab ? "_blank" : null,
    rel: rel.length ? rel.join(" ") : null,
    title: title.trim() || null,
  };
}

/** Read an existing link's attributes back into the form, to edit it. */
export function parseLinkAttrs(attrs: Record<string, unknown>): LinkFormValues {
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const rel = text(attrs.rel).toLowerCase().split(/\s+/);
  return {
    href: text(attrs.href),
    newTab: attrs.target === "_blank",
    nofollow: rel.includes("nofollow"),
    sponsored: rel.includes("sponsored"),
    title: text(attrs.title),
  };
}
