import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUFooterComponent } from "../components/puck/glu-footer";

const meta: Meta<typeof GLUFooterComponent> = {
  title: "Components/GLUFooter",
  component: GLUFooterComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUFooterComponent>;

export const Default: Story = {
  args: {
    logoText: "Grand Lakes University",
    tagline: "Advancing knowledge and enriching lives through excellence in teaching, research, and community engagement since 1887.",
    copyright: "© 2025 Grand Lakes University. 1887 University Drive, Grand Lakes, Michigan 48901.",
    columns: [
      {
        heading: "Admissions",
        links: [
          { label: "How to Apply", href: "/apply" },
          { label: "Deadlines", href: "/apply#deadlines" },
          { label: "Requirements", href: "/apply#requirements" },
        ],
      },
      {
        heading: "Academics",
        links: [
          { label: "Programs & Majors", href: "/academics" },
          { label: "Research", href: "/research" },
        ],
      },
      {
        heading: "Campus Life",
        links: [
          { label: "Housing", href: "/campus-life#housing" },
          { label: "Dining", href: "/campus-life#dining" },
        ],
      },
    ],
    socialLinks: [
      { platform: "Twitter", href: "#" },
      { platform: "Instagram", href: "#" },
      { platform: "LinkedIn", href: "#" },
    ],
  },
};
