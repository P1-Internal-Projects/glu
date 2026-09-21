import type { Meta, StoryObj } from "@storybook/nextjs";
import { TeamGridRender } from "../components/puck/blocks/team-grid/team-grid";

/**
 * A block taken off the shelf from components.p1.pantheon.io with
 * `shadcn add @p1/team-grid`, unedited. What makes it GLU's is
 * app/p1-theme.css, which resolves the library's --p1-* tokens to the values
 * in design-system/tokens.ts: crimson where the library said "accent",
 * Playfair for its headings, GLU's shadows and radii. Compare with the same
 * block on the library site to see how much of the look the token layer
 * carries.
 */
const meta: Meta<typeof TeamGridRender> = {
  title: "P1 Component Library/Team Grid",
  component: TeamGridRender,
  parameters: { layout: "fullscreen" },
  argTypes: {
    columns: { control: "select", options: ["2", "3", "4"] },
    shape: { control: "radio", options: ["circle", "rounded"] },
    tone: { control: "radio", options: ["white", "light"] },
  },
};
export default meta;

type Story = StoryObj<typeof TeamGridRender>;

const leadership = [
  {
    name: "Dr. Elena Marsh",
    role: "Dean of Admissions",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    bio: "Leads the admissions office and chairs the scholarship committee.",
  },
  {
    name: "Robert Achebe",
    role: "Director of Financial Aid",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "Oversees institutional aid and the Lakeside Access Grant.",
  },
  {
    name: "Hannah Lindqvist",
    role: "Associate Director, International Admissions",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    bio: "Credential evaluation, visas and funding for students from abroad.",
  },
];

export const InGLUTokens: Story = {
  name: "In GLU tokens",
  args: {
    eyebrow: "Admissions leadership",
    heading: "The people who read your application",
    columns: "3",
    shape: "circle",
    tone: "white",
    members: leadership,
  },
};

export const LightRounded: Story = {
  name: "Light tone, rounded",
  args: {
    ...InGLUTokens.args,
    tone: "light",
    shape: "rounded",
  } as Story["args"],
};
