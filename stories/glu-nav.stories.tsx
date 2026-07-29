import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUNavComponent } from "../components/puck/glu-nav";

const meta: Meta<typeof GLUNavComponent> = {
  title: "GLU Components/GLUNav",
  component: GLUNavComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUNavComponent>;

export const Default: Story = {
  args: {
    logoText: "Grand Lakes University",
    links: [
      { label: "Admissions", href: "/apply" },
      { label: "Academics", href: "/academics" },
      { label: "Cost & Aid", href: "/cost-aid" },
      { label: "Campus Life", href: "/campus-life" },
    ],
    ctaLabel: "Apply Now",
    ctaHref: "/apply",
  },
};
