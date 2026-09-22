import type { Preview } from "@storybook/nextjs";
import React from "react";
import "../design-system/globals.css";
// Tailwind itself, which the body blocks are styled with. Without it Storybook
// renders them unstyled — a paragraph keeps no measure, a figure falls back to
// the browser's default margin — so any layout checked here was checked against
// a page that does not exist. app/styles.css also pulls in the p1-* token
// layers below, but they are left imported explicitly so the intent survives if
// this entry ever changes.
import "../app/styles.css";
// The P1 component library's token layer and GLU's answers to it, so a block
// installed from components.p1.pantheon.io renders here as it does on the site.
import "../app/p1-tokens.css";
import "../app/p1-base.css";
import "../app/p1-theme.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: ["Foundations", "Components"],
      },
    },
    backgrounds: {
      default: "white",
      values: [
        { name: "white", value: "#ffffff" },
        { name: "off-white", value: "#FFF5F5" },
        { name: "navy", value: "#8B0015" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
