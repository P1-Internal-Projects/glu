import { describe, expect, it } from "vitest";

import { richTextField, selectLinkState } from "../components/rich-text/field";
import {
  CONTROL_EXTENSIONS,
  LINK_OPTIONS,
  RICH_TEXT_PRESETS,
  type RichTextPresetName,
} from "../components/rich-text/presets";

const PRESETS = Object.keys(RICH_TEXT_PRESETS) as RichTextPresetName[];

describe("rich text presets", () => {
  it.each(PRESETS)("%s: enables exactly the extensions its controls need", (name) => {
    const { controls, options } = RICH_TEXT_PRESETS[name];
    const needed = new Set(controls.flatMap((c) => CONTROL_EXTENSIONS[c]));
    const enabled = Object.entries(options)
      .filter(([, value]) => value !== false)
      .map(([key]) => key);
    expect(new Set(enabled)).toEqual(needed);
  });

  it.each(PRESETS)("%s: names every toggleable extension, so none is on by omission", (name) => {
    expect(Object.keys(RICH_TEXT_PRESETS[name].options).sort()).toEqual(
      [
        "blockquote",
        "bold",
        "bulletList",
        "code",
        "codeBlock",
        "heading",
        "horizontalRule",
        "italic",
        "link",
        "listItem",
        "listKeymap",
        "orderedList",
        "strike",
        "textAlign",
        "underline",
      ].sort(),
    );
  });

  it.each(PRESETS)("%s: never offers alignment, underline, strike or code", (name) => {
    const { options } = RICH_TEXT_PRESETS[name];
    for (const key of ["textAlign", "underline", "strike", "code", "codeBlock", "horizontalRule"] as const) {
      expect(options[key]).toBe(false);
    }
  });

  it.each(PRESETS)("%s: inline toolbar is a subset of the sidebar", (name) => {
    const { controls, inlineControls } = RICH_TEXT_PRESETS[name];
    for (const c of inlineControls) expect(controls).toContain(c);
  });

  it("configures links: no click-through, no default target/rel, https by default", () => {
    for (const name of PRESETS) expect(RICH_TEXT_PRESETS[name].options.link).toEqual(LINK_OPTIONS);
    expect(LINK_OPTIONS).toEqual({
      openOnClick: false,
      HTMLAttributes: { target: null, rel: null },
      defaultProtocol: "https",
    });
  });

  it("limits long-form headings to h2 and h3", () => {
    expect(RICH_TEXT_PRESETS["long-form"].options.heading).toEqual({ levels: [2, 3] });
  });
});

describe("richTextField", () => {
  it("builds an editable richtext field from the preset", () => {
    const field = richTextField({ label: "Body", preset: "long-form" });
    expect(field).toMatchObject({ type: "richtext", label: "Body", contentEditable: true });
    expect(field.options).toBe(RICH_TEXT_PRESETS["long-form"].options);
    expect(typeof field.renderMenu).toBe("function");
    expect(typeof field.renderInlineMenu).toBe("function");
    expect(field.tiptap?.selector).toBe(selectLinkState);
  });

  it("defaults to the standard preset", () => {
    expect(richTextField({ label: "Body" }).options).toBe(RICH_TEXT_PRESETS.standard.options);
  });

  it("appends the preset's formatting rules to the field's AI instructions", () => {
    const field = richTextField({ label: "Body", ai: { instructions: "Two sentences.", required: true } });
    expect(field.ai).toEqual({
      instructions: `Two sentences. ${RICH_TEXT_PRESETS.standard.aiInstructions}`,
      required: true,
    });
    expect(richTextField({ label: "Body", preset: "inline" }).ai?.instructions).toBe(
      RICH_TEXT_PRESETS.inline.aiInstructions,
    );
  });
});

describe("selectLinkState", () => {
  const ctx = (isLink: boolean, isEditable = true) =>
    ({ editor: { isDestroyed: false, isEditable, isActive: (name: string) => isLink && name === "link" } }) as never;

  it("reports whether the selection is in a link", () => {
    expect(selectLinkState(ctx(true), false)).toEqual({ isLink: true, canLink: true });
    expect(selectLinkState(ctx(false), false)).toEqual({ isLink: false, canLink: true });
  });

  it("cannot link when read-only", () => {
    expect(selectLinkState(ctx(false), true).canLink).toBe(false);
  });

  it("is empty without a live editor", () => {
    expect(selectLinkState({ editor: null } as never, false)).toEqual({});
  });
});
