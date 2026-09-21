import { blockPaddingClass } from "./block-padding";
import { buttonLabelAi, linkAi } from "../../lib/ai-hints";

export const buttonBlock = {
  label: "Button",
  ai: {
    instructions:
      "Standalone button in body copy. GLU sections carry their own CTAs — use this only when a link needs to stand alone between Paragraph or List blocks.",
  },
  fields: {
    label: { type: "text" as const, label: "Label", ai: buttonLabelAi("Download the viewbook") },
    href: { type: "text" as const, label: "Link URL", ai: linkAi("Where the button goes.") },
    openInNewTab: {
      type: "radio" as const,
      label: "Open in new tab",
      ai: { instructions: "Yes only for external sites and PDFs; site pages open in the same tab." },
      options: [
        { label: "No", value: false },
        { label: "Yes", value: true },
      ],
    },
  },
  defaultProps: {
    label: "Learn more",
    href: "#",
    openInNewTab: false,
  },
  render: ({
    label,
    href,
    openInNewTab,
  }: {
    label?: string;
    href?: string;
    openInNewTab?: boolean;
  }) => (
    <div className={blockPaddingClass}>
      <a
        href={href || "#"}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="inline-block rounded-lg bg-neutral-900 px-6 py-3 font-semibold text-white no-underline"
      >
        {label}
      </a>
    </div>
  ),
};
