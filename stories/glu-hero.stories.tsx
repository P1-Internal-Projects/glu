import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUHeroComponent } from "../components/puck/glu-hero";

const meta: Meta<typeof GLUHeroComponent> = {
  title: "Components/GLUHero",
  component: GLUHeroComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUHeroComponent>;

export const Default: Story = {
  args: {
    layout: "panel",
    eyebrow: "Undergraduate Admissions",
    heading: "Find Your Place at Grand Lakes",
    subtext: "Join 15,000 students at Michigan's flagship research university. Explore 120+ majors, world-class faculty, and a campus on the shores of the Great Lakes.",
    ctaLabel: "Start Your Application",
    ctaHref: "/apply",
    secondaryCtaLabel: "Explore Academics",
    secondaryCtaHref: "/academics",
    backgroundImageUrl: "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg",
    overlayOpacity: 0.72,
  },
};

export const LightOverlay: Story = {
  args: { ...Default.args, overlayOpacity: 0.45 },
};

export const FullOverlay: Story = {
  args: { ...Default.args, layout: "fullOverlay" },
};

export const LowerBand: Story = {
  args: { ...Default.args, layout: "lowerBand" },
};
