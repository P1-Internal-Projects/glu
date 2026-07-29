import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLULogo } from "../design-system/components/glu-logo";

const meta: Meta<typeof GLULogo> = {
  title: "Components/GLULogo",
  component: GLULogo,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof GLULogo>;

export const OnWhite: Story = {
  args: { color: "#8B0015", width: 240 },
};

export const OnCrimson: Story = {
  args: { color: "#ffffff", width: 240 },
  decorators: [
    (Story) => (
      <div style={{ background: "#8B0015", padding: "2rem 3rem", borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export const Small: Story = {
  args: { color: "#8B0015", width: 160 },
};

export const Large: Story = {
  args: { color: "#8B0015", width: 320 },
};
