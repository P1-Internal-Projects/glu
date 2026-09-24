import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUStatsBarComponent } from "../components/puck/glu-stats-bar";

const meta: Meta<typeof GLUStatsBarComponent> = {
  title: "Components/GLUStatsBar",
  component: GLUStatsBarComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUStatsBarComponent>;

const stats = [
  { value: "15,000", label: "Enrolled Students" },
  { value: "42%", label: "Acceptance Rate" },
  { value: "120+", label: "Degree Programs" },
  { value: "$450M", label: "Annual Research Funding" },
];

const heading = "Grand Lakes by the Numbers";

// `navy` is the stored value for crimson, kept because published pages hold it.
export const Crimson: Story = { args: { heading, stats, background: "navy" } };
export const DeepCrimson: Story = { args: { heading, stats, background: "crimsonDark" } };
export const Gold: Story = { args: { heading, stats, background: "gold" } };
export const White: Story = { args: { heading, stats, background: "white" } };
