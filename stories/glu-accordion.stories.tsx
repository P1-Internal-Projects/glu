import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUAccordionComponent } from "../components/puck/glu-accordion";

const meta: Meta<typeof GLUAccordionComponent> = {
  title: "GLU Components/GLUAccordion",
  component: GLUAccordionComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUAccordionComponent>;

export const Default: Story = {
  args: {
    eyebrow: "Admissions FAQ",
    heading: "Frequently Asked Questions",
    background: "offWhite",
    items: [
      { question: "What GPA do I need?", answer: "The middle 50% of admitted students have a GPA between 3.5 and 4.0. We review applications holistically." },
      { question: "Is the SAT/ACT required?", answer: "Grand Lakes University is test-optional through Fall 2027. You may submit scores if they strengthen your application." },
      { question: "When will I receive my decision?", answer: "Early Action applicants hear by December 15. Regular Decision applicants hear by March 1." },
    ],
  },
};
