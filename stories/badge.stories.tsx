import type { Meta, StoryObj } from "@storybook/nextjs";
import { Badge } from "../design-system/components/badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    variant: { control: "select", options: ["crimson", "gold", "accent", "light", "success", "error"] },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { variant: "crimson", children: "Undergraduate" } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 24 }}>
      <Badge variant="crimson">Crimson</Badge>
      <Badge variant="gold">Gold</Badge>
      <Badge variant="accent">Accent red</Badge>
      <Badge variant="light">Light</Badge>
      <Badge variant="success">Open</Badge>
      <Badge variant="error">Closed</Badge>
    </div>
  ),
};
