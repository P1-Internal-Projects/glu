import { blockPaddingClass } from "./block-padding";

const levelClass: Record<"h1" | "h2" | "h3" | "h4", string> = {
  h1: "text-4xl",
  h2: "text-3xl",
  h3: "text-2xl",
  h4: "text-xl",
};

export const headingBlock = {
  label: "Heading",
  fields: {
    title: { type: "text" as const, label: "Text" },
    level: {
      type: "select" as const,
      label: "Level",
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
    level: "h1" as const,
  },
  render: ({ title, level }: { title?: string; level?: string }) => {
    const L = (level ?? "h1") as "h1" | "h2" | "h3" | "h4";
    const size = levelClass[L] ?? levelClass.h1;
    // An empty heading is an accessibility failure, not a blank line: a screen
    // reader announces a heading with nothing under it. This happens for real
    // on a route template, where the text is bound to a datasource field that
    // a given record leaves empty, and the block cannot be removed per record.
    // Rendering nothing is what lets such a heading disappear with its content.
    if (!title?.trim()) return null;
    return (
      <div className={blockPaddingClass}>
        <L className={`m-0 font-bold leading-tight ${size}`}>{title}</L>
      </div>
    );
  },
};
