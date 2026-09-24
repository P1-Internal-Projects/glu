import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUAnnouncementBannerComponent } from "../components/puck/glu-announcement-banner";

const meta: Meta<typeof GLUAnnouncementBannerComponent> = {
  title: "Components/GLUAnnouncementBanner",
  component: GLUAnnouncementBannerComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUAnnouncementBannerComponent>;

// The block's default copy.
const base = {
  title: "Winter Weather Alert!",
  description: "Campus is closed today due to inclement weather.",
  buttonLabel: "learn more",
  buttonHref: "/weather-updates",
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
