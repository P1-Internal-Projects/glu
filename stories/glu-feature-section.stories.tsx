import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUFeatureSectionComponent } from "../components/puck/glu-feature-section";

const meta: Meta<typeof GLUFeatureSectionComponent> = {
  title: "Components/GLUFeatureSection",
  component: GLUFeatureSectionComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUFeatureSectionComponent>;

const base = {
  eyebrow: "Research & Discovery",
  heading: "Pushing the Boundaries of Human Knowledge",
  body: "Grand Lakes University is home to 42 research centers, with particular strengths in environmental science, engineering innovation, and public health.",
  ctaLabel: "Explore Research",
  ctaHref: "/academics",
  imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900&q=80",
  imageAlt: "Students in research laboratory",
  background: "white" as const,
};

export const ImageRight: Story = { args: { ...base, imagePosition: "right" as const } };
export const ImageLeft: Story = { args: { ...base, imagePosition: "left" as const } };

/**
 * The image field is now the rich `p1-media` type, so a section can hold a
 * media value rather than a URL. These are the shapes that matter after that
 * change: what an editor picks from the library today, what sections published
 * before it still hold, and where the alt text comes from in each case.
 */

const LECTURE =
  "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/" +
  "8845534e-0d3a-4b2e-b22d-ab5ec0c03708/dad332f7-6af2-4998-9aee-8ecc4baf69c1-lecture-hall.jpeg";

/** A crop drawn in the dialog, and alt text carried by the asset itself. */
export const RichMediaValue: Story = {
  args: {
    ...base,
    imagePosition: "right" as const,
    heading: "Cropped in the media library",
    imageAlt: "",
    imageUrl: {
      assetId: "8845534e-0d3a-4b2e-b22d-ab5ec0c03708",
      versionId: "dad332f7-6af2-4998-9aee-8ecc4baf69c1",
      url: `${LECTURE}?trim.left=200&trim.top=150&trim.width=2000&trim.height=1500`,
      alt: "A tiered lecture hall part-way through a class",
    },
  },
};

/** The field wins when an author writes one, for a section that needs its own. */
export const AltOverride: Story = {
  args: {
    ...RichMediaValue.args,
    heading: "Alt text overridden on the section",
    imageAlt: "The same hall, described for this section specifically",
  },
};

/**
 * A section published before the field was converted still holds a plain URL,
 * and one that is not on the media CDN renders through the fallback — see
 * lib/media-image.ts for why it exists and when it can go.
 */
export const LegacyUrlString: Story = {
  args: { ...base, imagePosition: "right" as const, heading: "Stored before the field was rich" },
};

/** No image: the frame is skipped rather than left as an empty grey box. */
export const NoImage: Story = {
  args: { ...base, imagePosition: "right" as const, heading: "Text only", imageUrl: "" },
};
