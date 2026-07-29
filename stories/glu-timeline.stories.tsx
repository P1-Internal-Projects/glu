import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUTimelineComponent } from "../components/puck/glu-timeline";

const meta: Meta<typeof GLUTimelineComponent> = {
  title: "Components/GLUTimeline",
  component: GLUTimelineComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUTimelineComponent>;

export const Default: Story = {
  args: {
    eyebrow: "Our History",
    heading: "A Legacy of Excellence",
    items: [
      {
        year: "1887",
        title: "University Founded",
        description: "Grand Lakes University was established by the Michigan Legislature as the state's flagship public research institution, welcoming its first class of 212 students.",
      },
      {
        year: "1923",
        title: "Great Lakes Research Institute",
        description: "GLU founded the Great Lakes Research Institute, launching a century of landmark environmental science that shaped federal water-quality standards.",
      },
      {
        year: "1957",
        title: "College of Engineering Opens",
        description: "Responding to the postwar technology boom, GLU opened its College of Engineering with support from Michigan's auto industry.",
      },
      {
        year: "2024",
        title: "Today",
        description: "With 15,000 undergraduates and $450M in research funding, Grand Lakes University continues to shape science, business, and public service.",
      },
    ],
  },
};
