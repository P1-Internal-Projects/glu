"use client";
import { RichTextMenu, type RichtextField } from "@puckeditor/core";
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import { linkAttrs, normalizeHref, readLink, type LinkValues } from "./rich-text-link";

/**
 * Richtext toolbars with a link button. Client-only: RichTextMenu is not
 * exported from Puck's server entry. Each menu is Puck's own default set of
 * controls with the link button next to bold, italic and underline.
 */
type MenuProps = Parameters<NonNullable<RichtextField["renderMenu"]>>[0];

/** Sidebar toolbar. */
export function MenuWithLink(props: MenuProps) {
  return (
    <RichTextMenu>
      <RichTextMenu.Group>
        <RichTextMenu.HeadingSelect />
        <RichTextMenu.ListSelect />
      </RichTextMenu.Group>
      <RichTextMenu.Group>
        <RichTextMenu.Bold />
        <RichTextMenu.Italic />
        <RichTextMenu.Underline />
        <LinkButton {...props} />
      </RichTextMenu.Group>
      <RichTextMenu.Group>
        <RichTextMenu.AlignSelect />
      </RichTextMenu.Group>
    </RichTextMenu>
  );
}

/** Canvas toolbar, shown over the text while it is edited in place. */
export function InlineMenuWithLink(props: MenuProps) {
  return (
    <RichTextMenu>
      <RichTextMenu.Group>
        <RichTextMenu.Bold />
        <RichTextMenu.Italic />
        <RichTextMenu.Underline />
        <LinkButton {...props} />
      </RichTextMenu.Group>
    </RichTextMenu>
  );
}

const EMPTY: LinkValues = { href: "", newTab: false, rel: "", title: "" };

/**
 * The button and its form. The form is a modal <dialog>, so Puck's scrolling
 * menus cannot clip it, and Escape and focus trapping come for free. It stays
 * inside the menu because Puck ends the edit when focus leaves the menu. That
 * also puts it inside Puck's sidebar <form>, so it is a plain group rather
 * than a nested form.
 */
function LinkButton({ editor, editorState, readOnly }: MenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<LinkValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const isLink = !!editorState?.isLink;
  const canLink = isLink || !!editorState?.hasSelection;

  const open = () => {
    if (!editor) return;
    setValues(isLink ? readLink(editor.getAttributes("link")) : EMPTY);
    setError(null);
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
    editor?.commands.focus();
  };

  const apply = () => {
    const href = normalizeHref(values.href);
    if (!href) {
      setError("Enter a web address (example.com), a site path (/apply), an #anchor or an email address.");
      return;
    }
    // extendMarkRange: with the cursor inside a link, edit the whole link.
    editor?.chain().focus().extendMarkRange("link").setLink(linkAttrs({ ...values, href })).run();
    dialogRef.current?.close();
  };

  const remove = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    dialogRef.current?.close();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // Keys typed in the form must not reach Puck: in the sidebar, Enter would
    // submit its fields form; in the canvas, Backspace would hit its
    // delete-block hotkey. Escape still closes the dialog natively.
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    if (event.key === "Enter" && !event.nativeEvent.isComposing && target.tagName === "INPUT") {
      event.preventDefault();
      apply();
    }
  };

  const set = <K extends keyof LinkValues>(key: K, value: LinkValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  return (
    <>
      <RichTextMenu.Control
        title={isLink ? "Edit link" : canLink ? "Link" : "Select text to link"}
        icon={<LinkIcon />}
        active={isLink}
        disabled={readOnly || !editor || !canLink}
        onClick={(event) => {
          event.stopPropagation();
          open();
        }}
      />
      <dialog ref={dialogRef} aria-labelledby={`${id}-title`} style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div role="group" aria-labelledby={`${id}-title`} onKeyDown={onKeyDown} style={styles.body}>
          <strong id={`${id}-title`}>{isLink ? "Edit link" : "Add link"}</strong>
          <label style={styles.field}>
            URL
            <input
              type="text"
              inputMode="url"
              autoComplete="off"
              value={values.href}
              placeholder="example.com, /apply or #section"
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => set("href", e.target.value)}
              style={styles.input}
            />
          </label>
          {error && (
            <span id={`${id}-error`} role="alert" style={styles.error}>
              {error}
            </span>
          )}
          <label style={styles.check}>
            <input type="checkbox" checked={values.newTab} onChange={(e) => set("newTab", e.target.checked)} />
            Open in a new tab
          </label>
          <label style={styles.field}>
            Title <span style={styles.hint}>(optional, shown on hover)</span>
            <input type="text" value={values.title} onChange={(e) => set("title", e.target.value)} style={styles.input} />
          </label>
          <label style={styles.field}>
            Rel <span style={styles.hint}>(optional, e.g. nofollow or sponsored)</span>
            <input type="text" value={values.rel} onChange={(e) => set("rel", e.target.value)} style={styles.input} />
          </label>
          <div style={styles.actions}>
            {isLink && (
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
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

// Inline styles: the dialog renders in the sidebar or in Puck's canvas iframe
// and must look the same in both. Puck's CSS variables are used where present.
const styles = {
  dialog: {
    width: "min(24rem, calc(100vw - 2rem))",
    padding: 0,
    border: "1px solid var(--puck-color-grey-09, #dcdcdc)",
    borderRadius: 8,
    font: "14px/1.4 var(--puck-font-family, system-ui, sans-serif)",
    color: "var(--puck-color-grey-01, #181818)",
    background: "var(--puck-color-white, #fff)",
  },
  body: { display: "grid", gap: 12, padding: 16 },
  field: { display: "grid", gap: 4, fontWeight: 500 },
  hint: { fontWeight: 400, color: "var(--puck-color-grey-05, #767676)" },
  input: { font: "inherit", padding: "6px 8px", border: "1px solid var(--puck-color-grey-08, #c3c3c3)", borderRadius: 4 },
  error: { color: "#c0392b", fontSize: 13 },
  check: { display: "flex", gap: 8, alignItems: "center" },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end" },
  button: {
    font: "inherit",
    padding: "6px 12px",
    border: "1px solid var(--puck-color-grey-08, #c3c3c3)",
    borderRadius: 4,
    background: "transparent",
    cursor: "pointer",
  },
  primary: { borderColor: "var(--puck-color-azure-04, #0158ad)", background: "var(--puck-color-azure-04, #0158ad)", color: "#fff" },
} satisfies Record<string, CSSProperties>;
