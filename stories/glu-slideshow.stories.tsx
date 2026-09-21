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

/**
 * The image field is now the rich `p1-media` type, so a slide can hold a media
 * value rather than a URL. These cover the three states that matter after that
 * change: a crop drawn in the editor, a slide left as a plain URL from before
 * the change, and the shallowest height, where cropping matters most.
 */

const CAMPUS = "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg";

const mediaValue = (crop: string, alt: string) => ({
  assetId: "cc682a18-70f0-48a4-b831-6ebf199954b4",
  versionId: "c11b0445-e2c1-4485-82dd-43f66d18d806",
  url: `${CAMPUS}?${crop}`,
  alt,
});

/**
 * One photograph, three crops. The slide is a shallow band, so the same image
 * says something different depending on where the crop lands.
 */
export const RichMediaCrops: Story = {
  args: {
    autoPlay: false,
    interval: 5,
    height: "lg",
    slides: [
      {
        imageUrl: mediaValue("fit=cover&gravity=auto", "The main quadrangle, smart cropped"),
        heading: "Smart crop",
        subtext: "fit=cover with gravity=auto — the CDN keeps the subject in the band.",
      },
      {
        imageUrl: mediaValue(
          "trim.left=600&trim.top=300&trim.width=1400&trim.height=460",
          "The entrance arch, cropped close",
        ),
        heading: "Custom crop",
        subtext: "A rectangle drawn in the crop dialog, carried as trim params on the URL.",
      },
      {
        imageUrl: mediaValue("fit=scale-down", "The main quadrangle, uncropped"),
        heading: "Fit in",
        subtext: "The whole frame, scaled to the band rather than cropped into it.",
      },
    ],
  },
};

/**
 * The shallowest band. The transform tracks the height setting, so a crop is
 * requested at 1920x420 here rather than 1920x560 — which is the difference
 * between a usable crop and a sliver of sky.
 */
export const ShortBandCrop: Story = {
  args: { ...RichMediaCrops.args, height: "md" },
};

/**
 * Slides published before the field was rich still hold a plain URL. They keep
 * rendering — see lib/media-image.ts for why that fallback exists.
 */
export const LegacyUrlStrings: Story = {
  args: { ...Default.args },
};
