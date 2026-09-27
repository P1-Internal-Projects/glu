import { blockPaddingClass } from "./block-padding";
import { bodyCopyStyle, bodyLinkStyle, proseVars } from "../../design-system/components/body-copy";
import { colors } from "../../design-system/tokens";

/** One line = `[label](href)` (from a datasource's `markdownLinks` token or arg form) or plain text. */
const MARKDOWN_LINK_LINE = /^\[([^\]]*)\]\(([^)]+)\)$/;

export const listBlock = {
  label: "Text List",
  ai: {
    instructions:
      "Bulleted or numbered list in body copy. One item per line; a line may be a markdown link like [Visit campus](/campus-life).",
  },
  fields: {
    ordered: {
      type: "radio" as const,
      label: "Style",
      ai: { instructions: "Numbered only when the order matters (steps, deadlines); otherwise bulleted." },
      options: [
        { label: "Bulleted", value: false },
        { label: "Numbered", value: true },
      ],
    },
    items: {
      type: "textarea" as const,
      label: "Items (one per line)",
      ai: { required: true, instructions: "3–7 items, one per line, parallel phrasing, no trailing periods." },
    },
  },
  defaultProps: {
    ordered: false,
    items: "First item\nSecond item\nThird item",
  },
  render: ({ ordered, items }: { ordered?: boolean; items?: string }) => {
    const lines = (items || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const ListTag = ordered ? "ol" : "ul";
    const listClass = ordered ? "list-decimal" : "list-disc";
    return (
      <div className={blockPaddingClass}>
        {/* Crimson markers, as in Paragraph's lists: `::marker` takes the list's colour. */}
        <ListTag
          className={`m-0 max-w-prose space-y-1 pl-6 ${listClass} marker:text-[var(--glu-marker)]`}
          style={{ ...bodyCopyStyle, ...proseVars, ["--glu-marker" as string]: colors.crimson }}
        >
          {lines.map((line, i) => {
            const m = line.match(MARKDOWN_LINK_LINE);
            if (m) {
              const href = m[2];
              const safe =
                href.startsWith("/") ||
                href.startsWith("./") ||
                /^https?:\/\//i.test(href);
              if (!safe) {
                return (
                  <li key={i} className="break-words">
                    {line}
                  </li>
                );
              }
              return (
                <li key={i} className="break-words">
                  <a href={href} style={bodyLinkStyle}>
                    {m[1]}
                  </a>
                </li>
              );
            }
            return (
              <li key={i} className="break-words">
                {line}
              </li>
            );
          })}
        </ListTag>
      </div>
    );
  },
};
