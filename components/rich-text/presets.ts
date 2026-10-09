import type { RichtextField } from "@puckeditor/core";

/**
 * Richtext presets: which controls a field's toolbar shows, and the TipTap
 * options that make everything else unrepresentable.
 *
 * The two halves are kept in step on purpose. A control without its extension
 * does nothing; an extension without a control is schema surface only paste
 * and AI can reach — which is how justified text and `<u>` used to arrive from
 * Word. Here every extension a preset does not offer is `false`, so the editor
 * drops that markup on every ingest path (typing, paste, AI, setContent).
 *
 * Server-safe: types and data only.
 */

export type RichTextOptions = NonNullable<RichtextField["options"]>;

/** A toolbar control. Each maps to the TipTap extensions it needs (CONTROL_EXTENSIONS). */
export type RichTextControl =
  | "headings"
  | "lists"
  | "bold"
  | "italic"
  | "blockquote"
  | "link"
  | "clearFormatting";

export type RichTextPresetName = "inline" | "standard" | "long-form";

export interface RichTextPreset {
  /** Sidebar toolbar, in order. */
  controls: readonly RichTextControl[];
  /** Canvas (inline) toolbar: the inline-level subset, so it stays one short row. */
  inlineControls: readonly RichTextControl[];
  options: RichTextOptions;
  /** Formatting rules for AI, appended to the field's own instructions. */
  aiInstructions: string;
}

/** Extensions each control needs. Paragraph, hard break, document and text are structural and always on. */
export const CONTROL_EXTENSIONS: Record<RichTextControl, readonly (keyof RichTextOptions)[]> = {
  headings: ["heading"],
  lists: ["bulletList", "orderedList", "listItem", "listKeymap"],
  bold: ["bold"],
  italic: ["italic"],
  blockquote: ["blockquote"],
  link: ["link"],
  clearFormatting: [],
};

/**
 * TipTap Link options, overriding three defaults:
 * - openOnClick: a click inside a link in the editor followed it;
 * - HTMLAttributes: every link was saved target="_blank" rel="noopener noreferrer
 *   nofollow", internal ones included. Target and rel are now the link form's call;
 * - defaultProtocol: a domain typed into the text autolinks to https, not http.
 */
export const LINK_OPTIONS = {
  openOnClick: false,
  HTMLAttributes: { target: null, rel: null },
  defaultProtocol: "https",
} satisfies RichTextOptions["link"];

/** Every toggleable extension, all off — each preset turns its own back on. */
const NONE: RichTextOptions = {
  blockquote: false,
  bold: false,
  bulletList: false,
  code: false,
  codeBlock: false,
  heading: false,
  horizontalRule: false,
  italic: false,
  link: false,
  listItem: false,
  listKeymap: false,
  orderedList: false,
  strike: false,
  textAlign: false,
  underline: false,
};

const ON = {} as const;

const INLINE_OPTIONS: RichTextOptions = { ...NONE, bold: ON, italic: ON, link: LINK_OPTIONS };
const STANDARD_OPTIONS: RichTextOptions = {
  ...INLINE_OPTIONS,
  bulletList: ON,
  orderedList: ON,
  listItem: ON,
  listKeymap: ON,
};

export const RICH_TEXT_PRESETS: Record<RichTextPresetName, RichTextPreset> = {
  inline: {
    controls: ["bold", "italic", "link"],
    inlineControls: ["bold", "italic", "link"],
    options: INLINE_OPTIONS,
    aiInstructions:
      "Formatting: plain sentences in paragraphs. Bold or italic only for emphasis, and links only to real URLs. No lists, headings or quotes.",
  },
  standard: {
    controls: ["lists", "bold", "italic", "link", "clearFormatting"],
    inlineControls: ["bold", "italic", "link"],
    options: STANDARD_OPTIONS,
    aiInstructions:
      "Formatting: paragraphs, with a bullet or numbered list only when it genuinely aids reading. Bold or italic sparingly, links only to real URLs. No headings or quotes.",
  },
  "long-form": {
    controls: ["headings", "lists", "bold", "italic", "blockquote", "link", "clearFormatting"],
    inlineControls: ["bold", "italic", "link"],
    options: { ...STANDARD_OPTIONS, heading: { levels: [2, 3] }, blockquote: ON },
    aiInstructions:
      "Formatting: paragraphs, with h2/h3 subheadings for sections (never h1), lists and block quotes where they aid reading. Bold or italic sparingly, links only to real URLs.",
  },
};
