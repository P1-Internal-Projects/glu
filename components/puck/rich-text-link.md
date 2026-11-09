# Link editing in richtext fields

Puck includes TipTap's Link extension in every `richtext` field
([included extensions](https://puckeditor.com/docs/api-reference/fields/richtext#included-extensions))
but has no toolbar control for it. Without one, pasting a URL onto selected text
is the only way to make a link, and there is no way to edit it afterwards.

`withLinkEditing(field)` adds a link button to a field:

```tsx
body: withLinkEditing({ type: "richtext", label: "Body Text", contentEditable: true }),
```

The button opens a form with **URL**, **Open in a new tab**, **Title** and **Rel**,
plus **Remove link** when editing. It is disabled until text is selected or the
cursor is in a link; with the cursor in a link, the form edits the whole link.

## How it works

All of it uses the field's documented extension points. No custom TipTap
extension is needed.

| Puck API | Used for |
| --- | --- |
| `renderMenu` / `renderInlineMenu` | Puck's default controls plus the link button, in the sidebar and canvas toolbars (`rich-text-link-menu.tsx`) |
| `RichTextMenu.Control` | The button |
| `options.link` | `openOnClick: false`, no forced `target`/`rel`, `defaultProtocol: "https"` |
| `tiptap.selector` | `isLink` and `hasSelection`, for the button's active and disabled states |
| `editor.chain().extendMarkRange("link").setLink(...)` / `unsetLink()` | Applying and removing |

URLs are cleaned up by `normalizeHref`: `example.com` becomes `https://`, an
email address becomes `mailto:`, site paths, anchors, `tel:` and `mailto:` are
kept, and anything else (`javascript:`, `data:`) is refused. A new tab adds
`rel="noopener noreferrer"`; any other rel is kept as entered.

## Things to know

- **The sanitizer must keep the attributes.** Published pages render the stored
  HTML through `sanitize-richtext.ts`. It now allows `title` and marks `target`
  and `rel` as URI-safe; DOMPurify was dropping them as invalid URLs.
- **The form is a `<dialog>` inside Puck's menu.** Puck ends the edit when focus
  leaves the menu, so it cannot move elsewhere. That also puts it inside Puck's
  sidebar `<form>`, so it is a plain group, and it stops keys from reaching
  Puck's hotkeys (Enter, Backspace).
- **Existing links are unchanged.** Links made by pasting before this change keep
  TipTap's old `target="_blank" rel="noopener noreferrer nofollow"` until edited.
- **Needs an extension:** attributes beyond `href`, `target`, `rel`, `title` and
  `class` (e.g. `aria-label`), a keyboard shortcut, or links that store a page
  ID instead of a URL. Use `Link.extend(...)` through the field's
  `tiptap.extensions`.
