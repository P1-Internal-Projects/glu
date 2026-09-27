"use client";
import { type ReactNode, isValidElement } from "react";
import { richtextField } from "@pantheon-systems/puck-css/fields";
import { blockPaddingClass } from "./block-padding";
import { ParagraphEditorText } from "./paragraph-editor-text";
import { sanitizeRichtextHtml } from "./sanitize-richtext";
import { bodyCopyStyle, proseVars } from "../../design-system/components/body-copy";

export const paragraphBlock = {
  label: "Paragraph",
  ai: {
    instructions:
      "Body copy in rich text — the block for prose between GLU sections or under a Heading. One idea per paragraph; use several blocks for several paragraphs.",
  },
  fields: {
    text: richtextField,
  },
  defaultProps: {
    text: "Add your copy here. You can use multiple lines.",
  },
  render: ({ text, id }: { text?: string | ReactNode; id: string }) => {
    if (isValidElement(text)) {
      return (
        <div className={`${blockPaddingClass} prose max-w-prose`} style={{ ...bodyCopyStyle, ...proseVars }}>
          <ParagraphEditorText text={text} id={id} />
        </div>
      );
    }
    return (
      <div
        className={`${blockPaddingClass} prose max-w-prose`}
        style={{ ...bodyCopyStyle, ...proseVars }}
        dangerouslySetInnerHTML={{
          __html: typeof text === "string" ? sanitizeRichtextHtml(text) : "",
        }}
      />
    );
  },
};
