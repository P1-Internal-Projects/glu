import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUAnnouncementBannerComponent } from "../components/puck/glu-announcement-banner";

const meta: Meta<typeof GLUAnnouncementBannerComponent> = {
  title: "Components/GLUAnnouncementBanner",
  component: GLUAnnouncementBannerComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUAnnouncementBannerComponent>;

// Placeholder copy: the banner has no source content to draw on.
const base = {
  title: "Announcement title",
  description: "A short description of the announcement.",
  buttonLabel: "Learn More",
  buttonHref: "#",
  background: "default" as const,
  customIcon: null,
  dismissible: true,
};

export const News: Story = { args: { ...base, variant: "news" } };
export const Alert: Story = { args: { ...base, variant: "alert" } };
export const Weather: Story = { args: { ...base, variant: "weather" } };
export const Emergency: Story = { args: { ...base, variant: "emergency", dismissible: false } };
export const CustomBackground: Story = { args: { ...base, variant: "news", background: "crimsonDark" } };
export const TitleOnly: Story = { args: { ...base, variant: "alert", description: "", buttonLabel: "" } };
