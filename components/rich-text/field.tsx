import type { RichtextField } from "@puckeditor/core";

import { RICH_TEXT_PRESETS, type RichTextPresetName } from "./presets";
import { RichTextToolbar } from "./toolbar";

/**
 * A Puck `richtext` field built from a preset (./presets): the toolbar shows
 * the preset's controls and the editor accepts nothing else.
 *
 *   body: richTextField({ label: "Body", preset: "standard", ai: { instructions: "…" } })
 *
 * Server-safe: this file is not "use client" and never imports RichTextMenu
 * (absent from Puck's react-server entry). It refers to RichTextToolbar, which
 * lives behind "use client" in ./toolbar — in a server graph that import is a
 * client reference, and the menu is only ever rendered by Puck's editor.
 */

type Selector = NonNullable<NonNullable<RichtextField["tiptap"]>["selector"]>;

/**
 * Extra editor state for the toolbar. Puck's default state has no link entry,
 * and calling editor.isActive() during render would not re-render on selection
 * changes; a selector does.
 */
export const selectLinkState = ((ctx, readOnly) => {
  const editor = ctx.editor;
  if (!editor || editor.isDestroyed) return {};
  return {
    isLink: editor.isActive("link"),
    canLink: !readOnly && editor.isEditable,
  };
}) satisfies Selector;

/** Field-level AI metadata — the same shape as puck-css's FieldAiMeta. */
export interface RichTextFieldAi {
  instructions?: string;
  required?: boolean;
  stream?: boolean;
  exclude?: boolean;
}

export type RichTextFieldConfig = RichtextField<typeof selectLinkState> & { ai?: RichTextFieldAi };

export interface RichTextFieldOptions {
  label: string;
  preset?: RichTextPresetName;
  /** The field's own AI guidance; the preset's formatting rules are appended. */
  ai?: RichTextFieldAi;
}

export function richTextField({ label, preset = "standard", ai }: RichTextFieldOptions): RichTextFieldConfig {
  const { controls, inlineControls, options, aiInstructions } = RICH_TEXT_PRESETS[preset];
  return {
    type: "richtext",
    label,
    contentEditable: true,
    options,
    // Puck's own controls arrive as `children`; they are deliberately not
    // rendered, so the toolbar shows exactly what the preset allows.
    renderMenu: ({ editor, editorState, readOnly }) => (
      <RichTextToolbar editor={editor} editorState={editorState} readOnly={readOnly} controls={controls} />
    ),
    renderInlineMenu: ({ editor, editorState, readOnly }) => (
      <RichTextToolbar editor={editor} editorState={editorState} readOnly={readOnly} controls={inlineControls} />
    ),
    tiptap: { selector: selectLinkState },
    ai: {
      ...ai,
      instructions: [ai?.instructions, aiInstructions].filter(Boolean).join(" "),
    },
  };
}
