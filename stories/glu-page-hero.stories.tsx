import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUPageHeroComponent } from "../components/puck/glu-page-hero";

const meta: Meta<typeof GLUPageHeroComponent> = {
  title: "Components/GLUPageHero",
  component: GLUPageHeroComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUPageHeroComponent>;

// Props as they stand on the live How to Apply page.
export const Default: Story = {
  args: {
    eyebrow: "Undergraduate Admissions",
    heading: "How to Apply",
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Admissions", href: "/apply" },
    ],
    backgroundImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80",
  },
};

/** Three levels deep, as on the School of AI Studies page. */
export const DeepBreadcrumbs: Story = {
  args: {
    eyebrow: "School of AI Studies",
    heading: "Prepare for the Age of AI",
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Academics", href: "/academics" },
      { label: "School of AI Studies", href: "/school-of-ai" },
    ],
    backgroundImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80",
  },
};

/** Landing pages like Scholarships leave the breadcrumb list empty. */
export const NoBreadcrumbs: Story = {
  args: { ...Default.args, eyebrow: "Financial Aid", heading: "Your Merit, Recognized", breadcrumbs: [] },
};

/**
 * A media-library pick is an object rather than a URL string; the hero must
 * take both (passing the object straight to <Image> was a crash).
 */
export const RichMediaValue: Story = {
  args: {
    ...Default.args,
    heading: "Cropped in the media library",
    backgroundImageUrl: {
      assetId: "cc682a18-70f0-48a4-b831-6ebf199954b4",
      versionId: "c11b0445-e2c1-4485-82dd-43f66d18d806",
      url: "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg",
      alt: "",
    },
  },
};

/** No image: the crimson gradient alone. */
export const NoImage: Story = {
  args: { ...Default.args, backgroundImageUrl: "" },
};
