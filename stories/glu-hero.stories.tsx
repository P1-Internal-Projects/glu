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
    backgroundImageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80",
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
