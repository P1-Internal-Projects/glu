import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUFeatureSectionComponent } from "../components/puck/glu-feature-section";

const meta: Meta<typeof GLUFeatureSectionComponent> = {
  title: "GLU Components/GLUFeatureSection",
  component: GLUFeatureSectionComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUFeatureSectionComponent>;

const base = {
  eyebrow: "Research & Discovery",
  heading: "Pushing the Boundaries of Human Knowledge",
  body: "Grand Lakes University is home to 42 research centers, with particular strengths in environmental science, engineering innovation, and public health.",
  ctaLabel: "Explore Research",
  ctaHref: "/academics",
  imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900&q=80",
  imageAlt: "Students in research laboratory",
  background: "white" as const,
};

export const ImageRight: Story = { args: { ...base, imagePosition: "right" as const } };
export const ImageLeft: Story = { args: { ...base, imagePosition: "left" as const } };
