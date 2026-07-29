import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUCardGridComponent } from "../components/puck/glu-card-grid";

const meta: Meta<typeof GLUCardGridComponent> = {
  title: "GLU Components/GLUCardGrid",
  component: GLUCardGridComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUCardGridComponent>;

const cards = [
  {
    title: "Environmental Science",
    description: "Study ecosystems, climate change, and sustainability with direct access to the Great Lakes watershed.",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    linkHref: "/academics",
    linkLabel: "Explore the program",
  },
  {
    title: "Engineering",
    description: "ABET-accredited programs combining rigorous coursework with hands-on research and industry partnerships.",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    linkHref: "/academics",
    linkLabel: "Explore the program",
  },
  {
    title: "Business Administration",
    description: "GLU Business School prepares future leaders through experiential learning and global immersion programs.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    linkHref: "/academics",
    linkLabel: "Explore the program",
  },
];

export const ThreeColumn: Story = {
  args: {
    eyebrow: "Academics",
    heading: "Find Your Program",
    subtext: "With 120+ degree programs across 8 colleges, GLU offers the breadth of a major research university.",
    columns: 3,
    background: "offWhite",
    cards,
  },
};

export const FourColumn: Story = {
  args: {
    ...ThreeColumn.args,
    columns: 4,
    cards: [...cards, {
      title: "Public Health",
      description: "Prepare for careers in healthcare, policy, and community health with our top-ranked MPH program.",
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
      linkHref: "/academics",
      linkLabel: "Explore the program",
    }],
  },
};
