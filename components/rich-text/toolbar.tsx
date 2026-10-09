"use client";

import { RichTextMenu, type RichtextField } from "@puckeditor/core";

import { LinkControl } from "./link-control";
import type { RichTextControl } from "./presets";

/**
 * The richtext toolbar for a preset, sidebar and canvas alike. Client-only:
 * RichTextMenu is not part of @puckeditor/core's react-server entry.
 *
 * Block formats are dropdowns (HeadingSelect, ListSelect), so even long-form
 * fits the sidebar in one row without restyling Puck's menu.
 */

export type RichTextMenuProps = Omit<Parameters<NonNullable<RichtextField["renderMenu"]>>[0], "children">;

export function RichTextToolbar({
  controls,
  ...menu
}: RichTextMenuProps & { controls: readonly RichTextControl[] }) {
  const has = (control: RichTextControl) => controls.includes(control);
  const { editor, readOnly } = menu;

  return (
    <RichTextMenu>
      {(has("headings") || has("lists") || has("blockquote")) && (
        <RichTextMenu.Group>
          {has("headings") && <RichTextMenu.HeadingSelect />}
          {has("lists") && <RichTextMenu.ListSelect />}
          {has("blockquote") && <RichTextMenu.Blockquote />}
        </RichTextMenu.Group>
      )}
      <RichTextMenu.Group>
        {has("bold") && <RichTextMenu.Bold />}
        {has("italic") && <RichTextMenu.Italic />}
        {has("link") && <LinkControl {...menu} />}
      </RichTextMenu.Group>
      {has("clearFormatting") && (
        <RichTextMenu.Group>
          <RichTextMenu.Control
            title="Clear formatting"
            icon={<ClearFormattingIcon />}
            disabled={readOnly || !editor}
            onClick={(e) => {
              e.stopPropagation();
              // Marks first (bold, italic, link), then blocks back to paragraphs.
              editor?.chain().focus().unsetAllMarks().clearNodes().run();
            }}
          />
        </RichTextMenu.Group>
      )}
    </RichTextMenu>
  );
}

function ClearFormattingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7V4h16v3M5 20h6M13 4 8 20M15 15l5 5M20 15l-5 5" />
    </svg>
  );
}
