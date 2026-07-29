import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUSlideshowComponent } from "../components/puck/glu-slideshow";

const meta: Meta<typeof GLUSlideshowComponent> = {
  title: "GLU Components/GLUSlideshow",
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
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80",
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
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80",
        heading: "Welcome to Grand Lakes",
        subtext: "Michigan's flagship research university since 1887.",
      },
    ],
  },
};
