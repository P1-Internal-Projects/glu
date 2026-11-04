import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUEventHeader, gluEventHeaderConfig } from "../components/puck/glu-event-header";

const meta: Meta<typeof GLUEventHeader> = {
  title: "Components/GLUEventHeader",
  component: GLUEventHeader,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUEventHeader>;

// Props as they stand on the live /events/fall-open-house-2026 page.
export const Default: Story = {
  args: {
    eventType: "Open House",
    title: "Fall Open House 2026",
    summary: "Spend a day on the Grand Lakes campus. Tour the residence halls, sit in on a class, and meet faculty from all eight colleges.",
    startDate: "2026-10-17",
    startTime: "9:00 AM",
    endTime: "3:30 PM",
    location: "Hollis Quad, Grand Lakes Campus",
    registrationUrl: "/apply",
    registrationLabel: "Reserve your place",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80",
  },
};

/** A deadline has a start time and no end time, so no range is drawn. */
export const Deadline: Story = {
  args: {
    eventType: "Deadline",
    title: "Early Action Application Deadline",
    summary: "The last day to submit an Early Action application for entry in Fall 2027.",
    startDate: "2026-11-15",
    startTime: "11:59 PM",
    endTime: "",
    location: "Online",
    registrationUrl: "/apply",
    registrationLabel: "Start your application",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80",
  },
};

/**
 * What a page fresh from the Event template shows before anyone fills it in:
 * the block's defaults, with no date, image or registration link.
 */
export const NewFromTemplate: Story = {
  args: { ...gluEventHeaderConfig.defaultProps },
};
