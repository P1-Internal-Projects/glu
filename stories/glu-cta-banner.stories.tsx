import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUCtaBannerComponent } from "../components/puck/glu-cta-banner";

const meta: Meta<typeof GLUCtaBannerComponent> = {
  title: "Components/GLUCtaBanner",
  component: GLUCtaBannerComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUCtaBannerComponent>;

const base = {
  heading: "Ready to Start Your Grand Lakes Journey?",
  subtext: "Applications for Fall 2026 are open. Early Action deadline: November 1. Regular Decision: January 15.",
  primaryCtaLabel: "Start Your Application",
  primaryCtaHref: "/apply",
  secondaryCtaLabel: "Request Information",
  secondaryCtaHref: "/contact",
};

// Story names follow the colour, not the stored value: `navy` and `lightBlue`
// are leftovers from before the crimson palette and are kept only because
// published documents hold them.
export const Crimson: Story = { args: { ...base, background: "navy" as const } };
export const LightRose: Story = { args: { ...base, background: "lightBlue" as const } };
