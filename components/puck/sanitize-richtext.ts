import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize richtext HTML before it is rendered via `dangerouslySetInnerHTML`.
 *
 * Blocks render editor-authored richtext as an HTML string on the public,
 * server-rendered surface. This is defense-in-depth at the render boundary:
 * it does not rely on the richtext editor's schema or on TipTap's default
 * link-protocol allowlist to be the only thing standing between stored content
 * and the DOM. The allowlist below matches what the richtext toolbar can
 * actually produce (inline formatting + lists + links); anything else —
 * `<script>`, `<img onerror>`, `javascript:`/`data:` hrefs — is stripped.
 *
 * Runs in both Node (SSR) and the browser via isomorphic-dompurify.
 *
 * Starter kit 0.16 moved this into `@pantheon-systems/puck-css/sanitize-richtext`
 * and deletes the template's copy. GLU keeps its own: the package version is
 * additive-only but permanently forbids `style` (so text-align is lost) and has
 * no h4, pre or hr. Its defaults are a subset of this list; re-check that
 * before ever switching over.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "code",
  "span",
  // Block formatting the toolbar can produce. These were missing while the
  // editor happily emitted them, so an author styled a heading, saw it in the
  // canvas, and lost it on the public page: Puck hydrates richtext into
  // elements in the editor (rendered as-is, never sanitized) and hands the
  // public render a string, which comes through here. Silent, one-way loss.
  "h2",
  "h3",
  "h4",
  "blockquote",
  "pre",
  "hr",
  // Highlight. puck-css 0.16's own sanitizer allows it, so its toolbar can
  // produce it; see the note on keeping this file below.
  "mark",
];

/**
 * `h1` is deliberately NOT allowed.
 *
 * The page hero is the page's h1 — the same rule HeadingBlock states in its own
 * field hints. A second one inside body copy is an outline error rather than a
 * formatting choice, and this is the boundary that can still catch it.
 */

const ALLOWED_ATTR = ["href", "target", "rel", "title", "style"];

/** The only declarations `style` may carry — see the hook below. */
const ALIGNMENTS = new Set(["left", "center", "right", "justify"]);

/**
 * `style` is allowed for one reason: the toolbar's text-align control writes
 * `style="text-align: center"`, and dropping the attribute wholesale would be
 * the same silent loss the tags above just fixed.
 *
 * It is not allowed to mean anything else. DOMPurify sanitizes CSS values, but
 * it would still pass `position: fixed` or a `background-image: url(...)` that
 * turns body copy into an overlay or a request to a third party. So the hook
 * reduces every style attribute to a single recognized text-align, or removes
 * it. Registered once at module load; DOMPurify dedupes by reference.
 */
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  // Duck-typed rather than `node instanceof Element`: this runs under SSR as
  // well as in the browser, and there the global does not exist — the DOM comes
  // from isomorphic-dompurify's own jsdom. `instanceof` threw
  // "Element is not defined" for every call, server-side included.
  const el = node as unknown as Element;
  if (typeof el?.getAttribute !== "function" || !el.hasAttribute("style")) return;
  const align = /text-align\s*:\s*([a-z]+)/i.exec(el.getAttribute("style") ?? "")?.[1];
  if (align && ALIGNMENTS.has(align.toLowerCase())) {
    el.setAttribute("style", `text-align: ${align.toLowerCase()}`);
  } else {
    el.removeAttribute("style");
  }
});

export function sanitizeRichtextHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Explicit protocol allowlist (defense-in-depth over DOMPurify's default,
    // which already rejects javascript:/unknown schemes): only safe link
    // protocols, plus relative/anchor hrefs.
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|ftp:|#|\/|\.)/i,
    // DOMPurify checks every attribute not on its URI-safe list against the
    // regexp above, so `target="_blank"` and `rel="noopener"` were dropped as
    // if they were bad URLs. They are not URLs at all.
    ADD_URI_SAFE_ATTR: ["target", "rel"],
  });
}
