# Rich text fields: reference implementation

A Puck `richtext` field whose toolbar and editor schema agree, with a real link
editor. Demo: the GLU Feature Section's **Body Text** (`components/puck/glu-feature-section.tsx`).

```
presets.ts       server-safe  controls + TipTap options per preset
field.tsx        server-safe  richTextField({ label, preset, ai })
toolbar.tsx      client       the preset's controls, sidebar and canvas
link-control.tsx client       link button + <dialog> form, Mod-k
link.ts          pure         normalizeHref, isInternal, buildLinkAttrs, parseLinkAttrs
render.tsx       server-safe  <RichText value className style />
rich.css         global CSS   prose + link styles (imported from app/styles.css)
```

The module imports nothing from this repo, so it can move into
`@pantheon-systems/puck-css` as is.

## What Puck gives you, and what P1 exposes

Puck (`@puckeditor/core` 0.21) gives every `richtext` field:

| Key | What it does |
| --- | --- |
| `options` | Per-extension TipTap config, or `false` to unregister it: blockquote, bold, bulletList, code, codeBlock, hardBreak, heading, horizontalRule, italic, link, listItem, listKeymap, orderedList, paragraph, strike, textAlign, underline |
| `renderMenu` / `renderInlineMenu` | Sidebar / canvas toolbar. Defaults: Heading, List, B/I/U, Align (sidebar); B/I/U (canvas) |
| `tiptap.selector` | Extra booleans for `editorState` (re-rendered on every transaction) |
| `tiptap.extensions` | Your own TipTap extensions, added after Puck's |

`RichTextMenu` has controls for everything except links. Puck registers the
Link extension but ships no button for it.

P1's `richtextField` (puck-css) sets one toolbar (B/I/U, lists) and
`textAlign: false`, and nothing else, so headings, quotes, code, strike and
links stay in the schema with no button. Paste and AI can still put them in.

## Config or extension?

Most of what a site needs is **config**:

- Limit what content can hold: set `options.<ext>: false`. Nothing is
  representable without its extension, so the editor drops that markup from
  typing, paste, AI and `setContent`.
- Change behaviour: `options.link` (`openOnClick`, `HTMLAttributes`,
  `defaultProtocol`), `options.heading.levels`.
- Change the toolbar: `renderMenu` / `renderInlineMenu`, built from `RichTextMenu.*`.
- Add your own buttons: `RichTextMenu.Control` + `editor.chain()…`. Read their
  state from `tiptap.selector`, not `editor.isActive()` in render (render does
  not re-run on selection changes).

It needs an **extension** (`tiptap.extensions`) when the editor itself has to
change: a new mark or node (a callout, a footnote), new attributes on an
existing one, input rules, or keyboard shortcuts that must work inside the
editor. The worked example here is Mod-k for links:

```ts
import { Extension } from "@tiptap/core";

export const LinkShortcut = Extension.create({
  name: "linkShortcut",
  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        this.editor.view.dom.dispatchEvent(new CustomEvent("rich-text:link", { bubbles: true }));
        return true;
      },
    };
  },
});
// field: tiptap: { extensions: [LinkShortcut], … }; LinkControl listens for "rich-text:link".
```

**This repo cannot import `@tiptap/core`**: it is a dependency of Puck, not of
the site, and pnpm keeps it out of reach. Adding it (pinned to Puck's version)
would be a new direct dependency. So `link-control.tsx` does the same job
without one: it listens for Mod-k on its own document and acts only when the
key was typed inside its editor. Once this lives in puck-css, which can depend
on `@tiptap/core`, the extension above is the cleaner version.

## Using it

```tsx
import { richTextField } from "@/components/rich-text/field";
import { RichText } from "@/components/rich-text/render";

fields: {
  body: richTextField({
    label: "Body",
    preset: "standard",
    ai: { instructions: "2-3 sentences expanding on the heading." },
  }),
},
render: ({ body }) => <RichText value={body} className="my-body" />,
```

| Preset | Sidebar toolbar | Canvas toolbar | Content allowed |
| --- | --- | --- | --- |
| `inline` | B, I, link | B, I, link | paragraphs, bold, italic, links |
| `standard` (default) | list ▾, B, I, link, clear | B, I, link | + bullet and numbered lists |
| `long-form` | heading ▾ (H2/H3), list ▾, quote, B, I, link, clear | B, I, link | + h2, h3, blockquote |

Every preset turns off code, code block, strike, underline, horizontal rule and
alignment. `ai.instructions` gets the preset's formatting rules appended to the
field's own. `__tests__/rich-text-presets.test.ts` checks that each preset's
enabled extensions are exactly what its controls need.

Puck's `RichText` type has the same name as the component; alias one of them
(`import type { RichText as RichTextValue } from "@puckeditor/core"`).

## Link editing

The link button is active when the cursor is in a link (`isLink`, from the
field's `tiptap.selector`). It, or Mod-k, opens a native modal `<dialog>`:

- **URL**, normalized by `normalizeHref`: `example.com` → `https://example.com`,
  `name@example.com` → `mailto:`, `/path`, `#anchor`, `?query`, `mailto:` and
  `tel:` kept, `javascript:`/`data:`/other schemes refused with a message.
- **Open in a new tab**: off by default, and hidden for internal links (`/`,
  `#`, `?`). A new-tab link always gets `rel="noopener noreferrer"`.
- **nofollow / sponsored**: only when ticked, external links only.
- **Title**: optional tooltip.
- **Apply / Remove link / Cancel**. The form is prefilled from the link under
  the cursor, and Apply and Remove act on the whole link
  (`extendMarkRange("link")`). With no selection, Apply inserts the URL as the
  link text.

Link options for every preset: `openOnClick: false` (a click in the editor
placed the cursor; it no longer follows the link), `HTMLAttributes: { target:
null, rel: null }` (TipTap's default made every link `_blank` +
`nofollow`), `defaultProtocol: "https"` (for autolinked text).

The dialog has to stay inside Puck's `[data-puck-rte-menu]` element: when focus
moves anywhere else, Puck drops the active editor and unmounts the canvas
toolbar, form included. Its top-layer rendering keeps Puck's scrolling,
scaled menus from clipping it.

## Sanitizer alignment

`<RichText>` renders a stored HTML string through puck-css's
`sanitizeRichtextHtml` with `allowedAttrs: ["title"]`. Every tag a preset can
produce (`p br strong em ul ol li a h2 h3 blockquote`) is a sanitizer default,
and the presets make `pre` and `hr` unrepresentable, so the sanitizer never
strips what the toolbar made — with one exception:

**puck-css 0.18.2 drops `target` and `rel`.** They are allowlisted, but
DOMPurify also tests a non-URL attribute's value against `ALLOWED_URI_REGEXP`,
and the custom regexp only matches URLs, so `_blank` and `noopener` fail.
`title` survives only because DOMPurify treats it as URI-safe. The fix is one
line in `sanitize-richtext.ts`: `ADD_URI_SAFE_ATTR: ["target", "rel"]`
(checked against DOMPurify 3.4.15). Until then, new-tab and rel choices reach
pages rendered through Puck's `<Render>` (P1's `RenderClient`), which re-parses
the stored HTML with the field's own extensions — so the preset also applies on
publish — and hands `<RichText>` an element; they do not survive the
sanitized-string path. A test in `__tests__/rich-text-render.test.tsx` pins the
current behaviour and will fail when puck-css is fixed.

**Puck 0.21.3 ignores `textAlign: false`.** `PuckRichText` spreads its own
`textAlign` default over the field's options, so alignment stays in the schema
whatever the field says (checked by building the schema from each preset: the
rest of each preset's options come out exactly as configured). The presets
still say `false`, to be right once Puck is fixed, and the sanitizer strips
`style`, so alignment never reaches a sanitized page. puck-css's
`richtextField` makes the same assumption.

## Server / client boundary

`field.tsx`, `presets.ts`, `link.ts` and `render.tsx` have no `"use client"`
and take only types from Puck. The toolbar and link control are
`"use client"`, because `RichTextMenu` is not in Puck's react-server entry.
`field.tsx` imports the toolbar directly: in a server graph that import is a
client reference, and the menu is only ever rendered by Puck's editor. Checked
by rendering `richTextField(...)` and `<RichText>` in a temporary Server
Component under `next dev`, and by importing `puck.config.tsx` from plain Node
(the registry sync's path). puck-css lazy-loads its menu with `React.lazy`
instead. That also keeps the menu code out of bundles that only need the
config, at the cost of a Suspense flash on first render.

`rich.css` is global CSS imported from `app/styles.css`, which Puck copies into
the canvas iframe, so the editor and the page share it. Link colours are custom
properties (`--rich-text-link`, `--rich-text-link-hover`, `--rich-text-rule`)
set from the site's tokens in `app/styles.css` (GLU's red here), or per block
on the wrapper.

## Compared with GLU PR #41

| | GLU PR #41 | This module |
| --- | --- | --- |
| Link input | `window.prompt` | `<dialog>` form: URL, new tab, nofollow/sponsored, title, Remove |
| Bare domains | `example.com` saved as a relative link | `normalizeHref` → `https://example.com` |
| Unsafe URLs | Left to TipTap | Refused in the form; sanitized on render |
| Field typing | `as any` | `RichtextField<typeof selectLinkState>`, no casts |
| Active state | `editor.isActive("link")` in render | `tiptap.selector` → `editorState.isLink` |
| Toolbar | Puck's children + link; CSS override on `[data-puck-rte-menu]` to wrap | Explicit per-preset controls, dropdowns for blocks; no CSS against Puck internals |
| Schema | Puck defaults (code, strike, quote, h1–h6, alignment… reachable by paste/AI) | Everything not on the toolbar disabled |
| Link colour | Hard-coded hex in a block CSS file | Shared `rich.css` + CSS custom properties from tokens |
| Reuse | One field in one block | `richTextField({ preset })` for any field |
| Tests | None | link rules, presets ↔ options, sanitizer round trip, render |

## Open decisions

- **Existing links.** Content saved under TipTap's defaults has
  `target="_blank" rel="noopener noreferrer nofollow"` on every link, internal
  ones included. They keep those attributes until someone edits each link.
  Options: leave them, rewrite them in a one-off content migration, or strip
  `nofollow` from internal links at render time.
- **Moving into `@pantheon-systems/puck-css`.** The module is self-contained.
  Moving it would mean: replacing or extending `richtextField` /
  `createRichtextField` with presets, depending on `@tiptap/core` for the Mod-k
  extension, fixing the sanitizer's `target`/`rel` bug in the same release,
  and deciding whether `rich.css` ships as a stylesheet export or as guidance.
- **Underline.** No preset offers it (it reads as a link). Existing `<u>`
  content is dropped the next time the field is edited.
