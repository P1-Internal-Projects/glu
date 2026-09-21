import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUSlideshowComponent } from "../components/puck/glu-slideshow";

const meta: Meta<typeof GLUSlideshowComponent> = {
  title: "Components/GLUSlideshow",
  component: GLUSlideshowComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUSlideshowComponent>;

export const Default: Story = {
  args: {
    autoPlay: false,
    interval: 5,
    height: "lg",
    slides: [
      {
        imageUrl: "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg",
        heading: "Campus at the Water's Edge",
        subtext: "Our lakeside campus spans 1,400 acres of natural beauty in the heart of Michigan.",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80",
        heading: "World-Class Academics",
        subtext: "120+ degree programs taught by faculty at the forefront of their fields.",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80",
        heading: "Student Life",
        subtext: "200+ clubs, Division I athletics, and a community built on belonging.",
      },
    ],
  },
};

export const ExtraLarge: Story = {
  args: {
    ...Default.args,
    height: "xl",
  },
};

export const SingleSlide: Story = {
  args: {
    autoPlay: false,
    interval: 5,
    height: "md",
    slides: [
      {
        imageUrl: "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg",
        heading: "Welcome to Grand Lakes",
        subtext: "Michigan's flagship research university since 1887.",
      },
    ],
  },
};
