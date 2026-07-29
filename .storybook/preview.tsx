import type { Preview } from "@storybook/nextjs";
import React from "react";
import "../design-system/globals.css";

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
