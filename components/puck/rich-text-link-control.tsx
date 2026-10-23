"use client";
import { RichTextMenu, type RichtextField } from "@puckeditor/core";

import "./rich-text-link-control.css";

/**
 * A link button for a richtext field, using the Link extension Puck already
 * includes (https://puckeditor.com/docs/api-reference/fields/richtext#included-extensions).
 * Puck ships no menu control for it, so per the docs it is added through the
 * field's renderMenu / renderInlineMenu: Puck's default controls (children)
 * plus one RichTextMenu.Control.
 *
 * Client-only: RichTextMenu is not exported from Puck's server entry, so the
 * field config refers to MenuWithLink without importing RichTextMenu itself.
 */
type MenuProps = Parameters<NonNullable<RichtextField["renderMenu"]>>[0];

const LinkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 13a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1.5 1.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 11a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1.5-1.5"
    />
  </svg>
);

export function MenuWithLink({ children, editor, readOnly }: MenuProps) {
  const isLink = !!editor?.isActive("link");
  return (
    // display: contents: only a hook for the wrap rule in the CSS file.
    <div className="glu-rte-menu" style={{ display: "contents" }}>
      <RichTextMenu>
        {children}
        <RichTextMenu.Group>
          <RichTextMenu.Control
            title={isLink ? "Edit link" : "Link"}
            icon={<LinkIcon />}
            active={isLink}
            disabled={readOnly || !editor}
            onClick={(e) => {
              e.stopPropagation();
              if (!editor) return;
              const url = window.prompt(
                "Link URL (leave empty to remove the link)",
                editor.getAttributes("link").href ?? "",
              );
              if (url === null) return;
              const chain = editor.chain().focus().extendMarkRange("link");
              if (url.trim()) chain.setLink({ href: url.trim() }).run();
              else chain.unsetLink().run();
            }}
          />
        </RichTextMenu.Group>
      </RichTextMenu>
    </div>
  );
}
