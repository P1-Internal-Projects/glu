import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUVideoComponent } from "../components/puck/glu-video";

const meta: Meta<typeof GLUVideoComponent> = {
  title: "Components/GLUVideo",
  component: GLUVideoComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUVideoComponent>;

// Stories start with no link: there is no GLU video to point them at. Paste a
// YouTube link or a public gs:// / s3:// path into `source` in the controls.
const base = {
  source: "",
  title: "Demo video",
  autoplay: false,
  muted: true,
  loop: false,
  controls: true,
  poster: null,
  puck: { isEditing: true },
};

export const FullScreen: Story = { args: { ...base, size: "fullscreen" } };
export const Inline: Story = { args: { ...base, size: "inline" } };
export const InvalidLink: Story = { args: { ...base, size: "inline", source: "http://example.com/video.mp4" } };

// Image mode needs a library pick or an https URL in `image`; this one uses a
// public Unsplash photo the site already shows on Campus Life.
const photo = "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80";
export const ImageFullScreen: Story = {
  args: { ...base, mediaType: "image", size: "fullscreen", image: photo, imageFit: "cover", title: "Grand Lakes campus" },
};
export const ImageWholeFrame: Story = {
  args: { ...base, mediaType: "image", size: "inline", image: photo, imageFit: "contain", title: "Grand Lakes campus" },
};
