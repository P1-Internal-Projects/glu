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

/**
 * The background field is now the rich `p1-media` type, so the hero can hold a
 * media value rather than a URL. These stories are the shapes that matter
 * after that change: what an editor picks from the library today, what heroes
 * published before it still hold, and the empty case.
 */

const CAMPUS = "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg";

/**
 * A rectangle drawn in the crop dialog, carried as trim params on the stored
 * URL. The alt travels with the value and is dropped on purpose — the image is
 * decoration behind the h1.
 */
export const RichMediaValue: Story = {
  args: {
    ...Default.args,
    heading: "Cropped in the media library",
    backgroundImageUrl: {
      assetId: "cc682a18-70f0-48a4-b831-6ebf199954b4",
      versionId: "c11b0445-e2c1-4485-82dd-43f66d18d806",
      url: `${CAMPUS}?trim.left=600&trim.top=300&trim.width=1400&trim.height=438`,
      alt: "The entrance arch, cropped close",
    },
  },
};

/**
 * A hero published before the field was converted still holds a plain URL, and
 * one that is not on the media CDN renders through the fallback — see
 * lib/media-image.ts for why it exists and when it can go.
 */
export const LegacyUrlString: Story = {
  args: {
    ...Default.args,
    heading: "Stored before the field was rich",
    backgroundImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80",
  },
};

/** No image at all: the section keeps its panel, without an empty frame behind it. */
export const NoImage: Story = {
  args: { ...Default.args, heading: "No background chosen", backgroundImageUrl: "" },
};
