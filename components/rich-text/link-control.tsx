"use client";

import { RichTextMenu } from "@puckeditor/core";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { buildLinkAttrs, isInternal, normalizeHref, parseLinkAttrs, type LinkFormValues } from "./link";
import type { RichTextMenuProps } from "./toolbar";

/**
 * Link button and form for a richtext toolbar. Puck includes TipTap's Link
 * extension but no control for it.
 *
 * The form is a native modal <dialog>: it sits in the top layer, so Puck's
 * scrolling, transformed menus cannot clip it, and Escape and focus trapping
 * come for free. It must stay a DOM descendant of the menu: Puck clears the
 * active editor when focus leaves for anything outside `[data-puck-rte-menu]`,
 * which would unmount the canvas toolbar — and this form with it.
 *
 * Because it stays in the menu, it also stays inside Puck's fields <form> in
 * the sidebar, and forms cannot nest. So the fields sit in a plain group and
 * Enter applies through a key handler rather than a submit.
 *
 * Mod-k opens it while the editor has focus (see the effect below).
 */

const EMPTY: LinkFormValues = { href: "", newTab: false, nofollow: false, sponsored: false, title: "" };

export function LinkControl({ editor, editorState, readOnly }: RichTextMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<LinkFormValues>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const isLink = !!editorState?.isLink;
  const disabled = readOnly || !editor || editorState?.canLink === false;

  const open = () => {
    if (!editor || disabled) return;
    const existing = parseLinkAttrs(editor.getAttributes("link"));
    setValues(existing.href ? existing : EMPTY);
    setEditing(!!existing.href);
    setError(null);
    dialogRef.current?.showModal();
  };

  // Mod-k. A TipTap extension would bind this inside the editor (README:
  // "Config or extension?"), but the site cannot import @tiptap/core, so the
  // control listens on its own document and acts only for keys typed in its
  // editor. The canvas editor lives in Puck's iframe and the sidebar menu in
  // the parent document, so only the toolbar beside the editor answers.
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const doc = dialogRef.current?.ownerDocument;
    if (!doc || !editor) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (editor.isDestroyed || !editor.view.dom.contains(event.target as Node)) return;
      event.preventDefault();
      openRef.current();
    };
    doc.addEventListener("keydown", onKeyDown, true);
    return () => doc.removeEventListener("keydown", onKeyDown, true);
  }, [editor]);

  const close = () => {
    dialogRef.current?.close();
    editor?.commands.focus();
  };

  const apply = () => {
    if (!editor) return;
    const href = normalizeHref(values.href);
    if (!href) {
      setError("Enter a web address (example.com), a path (/about), an #anchor, or an email address.");
      return;
    }
    const attrs = buildLinkAttrs({ ...values, href });
    // With nothing selected and no link to edit, there is no text to link:
    // insert the address itself as the link text.
    const insert = editor.state.selection.empty && !editor.isActive("link");
    const chain = editor.chain().focus().extendMarkRange("link");
    const ok = insert
      ? chain.insertContent({ type: "text", text: values.href.trim(), marks: [{ type: "link", attrs }] }).run()
      : chain.setLink(attrs).run();
    if (!ok) {
      setError("That link could not be applied.");
      return;
    }
    dialogRef.current?.close();
  };

  const remove = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    dialogRef.current?.close();
  };

  // Enter in a text field applies, as a form submit would. Stopped here so it
  // never reaches Puck's fields form around the sidebar toolbar.
  // (No instanceof: in the canvas the input belongs to Puck's iframe realm.)
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLInputElement;
    if (event.key !== "Enter" || target.tagName !== "INPUT" || target.type !== "text") return;
    event.preventDefault();
    event.stopPropagation();
    apply();
  };

  const set = <K extends keyof LinkFormValues>(key: K, value: LinkFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  // New tab and rel only mean something for another site. They stay visible
  // on an internal link that already has them, so they can be switched off.
  const external = !!values.href.trim() && !isInternal(values.href.trim());

  return (
    <>
      <RichTextMenu.Control
        title={isLink ? "Edit link (Ctrl/⌘ K)" : "Link (Ctrl/⌘ K)"}
        icon={<LinkIcon />}
        active={isLink}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
      />
      <dialog ref={dialogRef} aria-labelledby={`${id}-title`} style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div role="group" aria-labelledby={`${id}-title`} onKeyDown={onKeyDown} style={styles.form}>
          <strong id={`${id}-title`}>{editing ? "Edit link" : "Add link"}</strong>
          <label style={styles.field}>
            URL
            <input
              type="text"
              inputMode="url"
              autoComplete="off"
              value={values.href}
              placeholder="example.com, /about or #section"
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => {
                set("href", e.target.value);
                setError(null);
              }}
              style={styles.input}
            />
          </label>
          {error && (
            <span id={`${id}-error`} role="alert" style={styles.error}>
              {error}
            </span>
          )}
          {(external || values.newTab) && (
            <label style={styles.check}>
              <input type="checkbox" checked={values.newTab} onChange={(e) => set("newTab", e.target.checked)} />
              Open in a new tab
            </label>
          )}
          {(external || values.nofollow || values.sponsored) && (
            <fieldset style={styles.fieldset}>
              <legend style={styles.legend}>Relationship</legend>
              <label style={styles.check}>
                <input type="checkbox" checked={values.nofollow} onChange={(e) => set("nofollow", e.target.checked)} />
                nofollow — don&apos;t vouch for this site
              </label>
              <label style={styles.check}>
                <input type="checkbox" checked={values.sponsored} onChange={(e) => set("sponsored", e.target.checked)} />
                sponsored — paid or affiliate link
              </label>
            </fieldset>
          )}
          <label style={styles.field}>
            Title <span style={styles.hint}>(optional tooltip)</span>
            <input type="text" value={values.title} onChange={(e) => set("title", e.target.value)} style={styles.input} />
          </label>
          <div style={styles.actions}>
            {editing && (
              <button type="button" onClick={remove} style={{ ...styles.button, marginRight: "auto" }}>
                Remove link
              </button>
            )}
            <button type="button" onClick={close} style={styles.button}>
              Cancel
            </button>
            <button type="button" onClick={apply} style={{ ...styles.button, ...styles.primary }}>
              Apply
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// Inline styles: the dialog renders in the parent document (sidebar) or in
// Puck's canvas iframe (inline toolbar), and must look the same in both
// without depending on which stylesheets were copied where. Puck's own CSS
// variables are used where present.
const styles = {
  dialog: {
    width: "min(24rem, calc(100vw - 2rem))",
    padding: 0,
    border: "1px solid var(--puck-color-grey-09, #dcdcdc)",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgb(0 0 0 / 0.18)",
    font: "14px/1.4 var(--puck-font-family, system-ui, sans-serif)",
    color: "var(--puck-color-grey-01, #181818)",
    background: "var(--puck-color-white, #fff)",
  },
  form: { display: "grid", gap: 12, padding: 16 },
  field: { display: "grid", gap: 4, fontWeight: 500 },
  hint: { fontWeight: 400, color: "var(--puck-color-grey-05, #767676)" },
  input: {
    font: "inherit",
    padding: "6px 8px",
    border: "1px solid var(--puck-color-grey-08, #c3c3c3)",
    borderRadius: 4,
  },
  error: { color: "var(--puck-color-red-04, #c0392b)", fontSize: 13 },
  check: { display: "flex", gap: 8, alignItems: "center" },
  fieldset: { display: "grid", gap: 4, margin: 0, padding: 0, border: 0 },
  legend: { padding: 0, marginBottom: 4, fontWeight: 500 },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end" },
  button: {
    font: "inherit",
    padding: "6px 12px",
    border: "1px solid var(--puck-color-grey-08, #c3c3c3)",
    borderRadius: 4,
    background: "transparent",
    cursor: "pointer",
  },
  primary: {
    borderColor: "var(--puck-color-azure-04, #0158ad)",
    background: "var(--puck-color-azure-04, #0158ad)",
    color: "#fff",
  },
} satisfies Record<string, CSSProperties>;
