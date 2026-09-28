import { blockPaddingClass } from "./block-padding";
import { colors, typography, spacing } from "../../design-system/tokens";
import { bodyCopyStyle } from "../../design-system/components/body-copy";

export const quoteBlock = {
  label: "Quote",
  ai: {
    instructions:
      "Single pull quote in body copy. For several student voices use GLUTestimonialSlider instead.",
  },
  fields: {
    quote: {
      type: "textarea" as const,
      label: "Quote",
      contentEditable: true,
      ai: { required: true, instructions: "1–2 sentences, verbatim, without surrounding quotation marks." },
    },
    attribution: {
      type: "text" as const,
      label: "Attribution",
      contentEditable: true,
      ai: { instructions: "Name and role, e.g. 'Marisol Vega, Senior Admissions Counselor'. Leave blank if unknown — never invent a person." },
    },
  },
  defaultProps: {
    quote: "A short quotation goes here.",
    attribution: "",
  },
  render: ({ quote, attribution }: { quote?: string; attribution?: string }) => (
    // The GLU pull quote: crimson rule, the heading face in italic, and a muted
    // attribution — the same treatment as the testimonial slider's quotes.
    <blockquote
      className={`m-0 max-w-prose ${blockPaddingClass}`}
      style={{ borderLeft: `4px solid ${colors.crimson}`, paddingLeft: spacing[6] }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: typography.fontHeading,
          fontStyle: "italic",
          fontSize: typography.sizeXl,
          lineHeight: typography.lineHeightSnug,
          color: colors.dark,
        }}
      >
        {quote}
      </p>
      {attribution ? (
        <footer style={{ ...bodyCopyStyle, marginTop: spacing[3], fontSize: typography.sizeSm, color: colors.muted }}>
          — {attribution}
        </footer>
      ) : null}
    </blockquote>
  ),
};
