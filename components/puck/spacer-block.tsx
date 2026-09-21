export const spacerBlock = {
  label: "Spacer",
  ai: {
    instructions:
      "Vertical space between body-copy blocks. Rarely needed: GLU sections space themselves.",
  },
  fields: {
    height: {
      type: "number" as const,
      label: "Height (px)",
      min: 8,
      max: 240,
      step: 4,
      ai: { instructions: "Multiple of 8; 24–96 is the usual range." },
    },
  },
  defaultProps: {
    height: 48,
  },
  render: ({ height }: { height?: number }) => {
    const px = Math.min(240, Math.max(8, height ?? 48));
    return (
      <div
        aria-hidden
        className="w-full min-h-2 max-h-60 shrink-0"
        style={{ height: px }}
      />
    );
  },
};
