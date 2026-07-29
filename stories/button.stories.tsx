import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "../design-system/components/button";

const meta: Meta<typeof Button> = {
  title: "Design System/Button",
  component: Button,
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "outline", "ghost"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary", children: "Apply Now", size: "md" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Learn More", size: "md" } };
export const Outline: Story = { args: { variant: "outline", children: "Request Info", size: "md" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Visit Campus", size: "md" } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: 24 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 24 }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
