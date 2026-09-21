import { blockPaddingClass } from "./block-padding";

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
      ai: { required: true, instructions: "1–2 sentences, verbatim, without surrounding quotation marks." },
    },
    attribution: {
      type: "text" as const,
      label: "Attribution",
      ai: { instructions: "Name and role, e.g. 'Marisol Vega, Senior Admissions Counselor'. Leave blank if unknown — never invent a person." },
    },
  },
  defaultProps: {
    quote: "A short quotation goes here.",
    attribution: "",
  },
  render: ({ quote, attribution }: { quote?: string; attribution?: string }) => (
    <blockquote
      className={`m-0 max-w-prose border-l-4 border-neutral-300 pl-6 ${blockPaddingClass}`}
    >
      <p className="m-0 text-lg italic leading-relaxed">{quote}</p>
      {attribution ? (
        <footer className="mt-3 text-base text-neutral-600">— {attribution}</footer>
      ) : null}
    </blockquote>
  ),
};
