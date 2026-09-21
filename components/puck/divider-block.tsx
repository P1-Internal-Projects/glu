export const dividerBlock = {
  label: "Divider",
  ai: {
    instructions:
      "Thin horizontal rule between text blocks. Not needed between GLU sections, which space themselves.",
  },
  fields: {},
  defaultProps: {},
  render: () => (
    <div className="px-16 py-4">
      <hr className="m-0 border-0 border-t border-neutral-300" />
    </div>
  ),
};
