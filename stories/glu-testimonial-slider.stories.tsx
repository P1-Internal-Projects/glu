import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUTestimonialSliderComponent, gluTestimonialSliderConfig, type GLUTestimonialSliderProps } from "../components/puck/glu-testimonial-slider";

const meta: Meta<typeof GLUTestimonialSliderComponent> = {
  title: "Components/GLUTestimonialSlider",
  component: GLUTestimonialSliderComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUTestimonialSliderComponent>;

// The block's defaults, which are also what every GLU page using it holds.
const defaults = gluTestimonialSliderConfig.defaultProps as GLUTestimonialSliderProps;

export const Default: Story = {
  args: { eyebrow: defaults.eyebrow, heading: defaults.heading, testimonials: defaults.testimonials },
};

/** A single quote: the prev/next controls and dots have nothing to move between. */
export const SingleTestimonial: Story = {
  args: { ...Default.args, testimonials: defaults.testimonials.slice(0, 1) },
};

/** No photo: the quote card drops the portrait rather than leaving an empty ring. */
export const WithoutPhoto: Story = {
  args: { ...Default.args, testimonials: defaults.testimonials.map((t) => ({ ...t, imageUrl: "" })) },
};
