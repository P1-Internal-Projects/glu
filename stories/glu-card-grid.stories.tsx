import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUCardGridComponent } from "../components/puck/glu-card-grid";

const meta: Meta<typeof GLUCardGridComponent> = {
  title: "Components/GLUCardGrid",
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

/**
 * The image field is now the rich `p1-media` type, so a card can hold a media
 * value rather than a URL. These two stories are the pair that matters after
 * that change: what an editor picks from the library today, and what the
 * cards published before the change still hold.
 */

const CAMPUS = "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg";

/**
 * A media value carrying its own alt text, and a crop the editor drew in the
 * dialog. The trim params ride on the stored URL and survive the transform.
 */
export const RichMediaValues: Story = {
  args: {
    ...ThreeColumn.args,
    heading: "Picked from the media library",
    cards: [
      {
        title: "Smart crop",
        description: "Stored with fit=cover and gravity=auto, so the subject survives the 16:9 box.",
        imageUrl: {
          assetId: "cc682a18-70f0-48a4-b831-6ebf199954b4",
          versionId: "c11b0445-e2c1-4485-82dd-43f66d18d806",
          url: `${CAMPUS}?fit=cover&gravity=auto`,
          alt: "The main quadrangle on a summer morning",
        },
        linkHref: "/academics",
        linkLabel: "Explore the program",
      },
      {
        title: "Custom crop",
        description: "A rectangle drawn in the crop dialog, carried as trim params on the URL.",
        imageUrl: {
          assetId: "cc682a18-70f0-48a4-b831-6ebf199954b4",
          versionId: "c11b0445-e2c1-4485-82dd-43f66d18d806",
          url: `${CAMPUS}?trim.left=600&trim.top=300&trim.width=1400&trim.height=788`,
          alt: "The entrance arch, cropped close",
        },
        linkHref: "/academics",
        linkLabel: "Explore the program",
      },
      {
        title: "No crop",
        description: "Fit in: the whole frame, scaled down to the box.",
        imageUrl: {
          assetId: "cc682a18-70f0-48a4-b831-6ebf199954b4",
          versionId: "c11b0445-e2c1-4485-82dd-43f66d18d806",
          url: `${CAMPUS}?fit=scale-down`,
          alt: "The main quadrangle, uncropped",
        },
        linkHref: "/academics",
        linkLabel: "Explore the program",
      },
    ],
  },
};

/**
 * Cards published before the field was converted still hold a plain URL, and
 * on this site those URLs are not on the media CDN. They keep rendering —
 * see lib/media-image.ts for why that fallback exists and when it can go.
 */
export const LegacyUrlStrings: Story = {
  args: {
    ...ThreeColumn.args,
    heading: "Stored before the field was rich",
  },
};

/** A card with no image at all: the frame is skipped, not left blank. */
export const NoImage: Story = {
  args: {
    ...ThreeColumn.args,
    heading: "Text-only cards",
    cards: cards.map((c) => ({ ...c, imageUrl: "" })),
  },
};
