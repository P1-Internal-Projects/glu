import { blockPaddingClass } from "./block-padding";
import { H1, H2, H3, H4 } from "../../design-system/components/typography";
import { typography } from "../../design-system/tokens";

/**
 * The design system's headings, one size down.
 *
 * This block sits inside body copy, under a section whose own heading is the
 * design system's full-size H2 (GLUArticleSection draws it at 4xl). Drawn at
 * full size too, a subheading would outrank the section it belongs to, so each
 * level keeps its tag and its face and takes the next size down.
 */
const LEVELS = {
  h1: { Tag: H1, size: typography.size4xl },
  h2: { Tag: H2, size: typography.size3xl },
  h3: { Tag: H3, size: typography.size2xl },
  h4: { Tag: H4, size: typography.sizeXl },
} as const;

export const headingBlock = {
  label: "Heading",
  ai: {
    instructions:
      "Plain heading inside body copy, between Paragraph and List blocks. GLU sections carry their own headings. Never h1: the hero or profile is the page's h1.",
  },
  fields: {
    title: { type: "text" as const, label: "Text", ai: { required: true, instructions: "Sentence case, under 10 words." } },
    level: {
      type: "select" as const,
      label: "Level",
      ai: { instructions: "h2 for a topic within body copy, h3 beneath it. Do not use h1." },
      options: [
        { label: "H1", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
        { label: "H4", value: "h4" },
      ],
    },
  },
  defaultProps: {
    title: "Heading",
    // h2, not h1: the hero or profile is the page's h1, as the AI hint says.
    level: "h2" as const,
  },
  render: ({ title, level }: { title?: string; level?: string }) => {
    const { Tag, size } = LEVELS[(level ?? "h2") as keyof typeof LEVELS] ?? LEVELS.h2;
    // An empty heading is an accessibility failure, not a blank line: a screen
    // reader announces a heading with nothing under it. This happens for real
    // on a route template, where the text is bound to a datasource field that
    // a given record leaves empty, and the block cannot be removed per record.
    // Rendering nothing is what lets such a heading disappear with its content.
    if (!title?.trim()) return null;
    return (
      <div className={blockPaddingClass}>
        <Tag style={{ fontSize: size }}>{title}</Tag>
      </div>
    );
  },
};
