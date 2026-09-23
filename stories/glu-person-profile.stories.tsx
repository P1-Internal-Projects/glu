import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUPersonProfile } from "../components/puck/glu-person-profile";

/**
 * The counselor record block, as the Counselor template pins it at the top of
 * every counselor page. The first story is what a brand-new page looks like
 * before anyone has typed: the silhouette, the default office and a booking
 * button. It should look finished, not scaffolded — that is the moment the
 * template is judged on.
 */
const meta: Meta<typeof GLUPersonProfile> = {
  title: "Components/GLUPersonProfile",
  component: GLUPersonProfile,
  parameters: { layout: "fullscreen" },
  argTypes: {
    layout: { control: "radio", options: ["split", "centered"] },
    background: { control: "select", options: ["white", "offWhite", "lightBlue", "navy"] },
    photoShape: { control: "radio", options: ["rounded", "circle"] },
  },
};
export default meta;

type Story = StoryObj<typeof GLUPersonProfile>;

const marisol = {
  name: "Marisol Vega",
  pronouns: "she/her",
  role: "Senior Admissions Counselor",
  focusArea: "First-generation and transfer applicants",
  territory: "Michigan, Ohio, Indiana",
  languages: "English, Spanish",
  email: "m.vega@grandlakes.edu",
  phone: "(517) 555-0142",
  officeLocation: "Visitor Center, Room 120",
  officeHours: "Wednesdays 1–4 PM, in person and online",
  bookingUrl: "/visit/open-house",
  bookingLabel: "Schedule a conversation",
  photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
  bio: "Marisol has worked in Grand Lakes admissions for nine years and leads the counseling team for the Great Lakes region. She works most closely with students who are the first in their family to apply to university, and with transfer applicants figuring out how their credits carry.",
  layout: "split" as const,
  background: "offWhite" as const,
  photoShape: "rounded" as const,
};

/** A page the moment it is created from the template: no photo, no bio yet. */
export const FreshFromTemplate: Story = {
  args: {
    name: "New Counselor",
    pronouns: "",
    role: "Admissions Counselor",
    focusArea: "",
    territory: "",
    languages: "English",
    email: "",
    phone: "",
    officeLocation: "Visitor Center, Room 120",
    officeHours: "",
    bookingUrl: "/visit/open-house",
    bookingLabel: "Schedule a conversation",
    photoUrl: "",
    bio: "",
    layout: "split",
    background: "white",
    photoShape: "rounded",
  },
};

export const Split: Story = { args: marisol };

export const Centered: Story = {
  args: { ...marisol, layout: "centered", photoShape: "circle", background: "white" },
};

export const Crimson: Story = {
  // The stored value is `navy`, as on every other GLU section. This component
  // used to spell it `crimson` — the only one that did — which made the same
  // colour two different values depending on the block.
  args: { ...marisol, background: "navy" },
};

/** The silhouette holds the layout when a record has no headshot. */
export const NoPhoto: Story = {
  args: { ...marisol, photoUrl: "", background: "white" },
};
