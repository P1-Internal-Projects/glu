import type { Meta, StoryObj } from "@storybook/nextjs";
import type { ResolvedItem } from "@pantheon-systems/puck-css/fields";
import {
  EventCards,
  GLUListingSection,
  PersonCards,
} from "../components/puck/glu-listing";

/**
 * GLU Listing is a data list block: on a real page the factory binds it to a
 * datasource and resolves the rows. These stories render the presentational
 * halves directly — the section shell and the two card modes — with fixed
 * items, so the chrome and the cards can be reviewed without a backend.
 */
const meta: Meta<typeof GLUListingSection> = {
  title: "Components/GLUListing",
  component: GLUListingSection,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUListingSection>;

/** The block hands each mode resolved items plus the raw record behind them. */
function item(
  resolved: Pick<ResolvedItem, "title" | "subtitle" | "teaser" | "image">,
  raw: Record<string, unknown>,
): ResolvedItem {
  return { icon: "", ...resolved, _raw: raw };
}

const events: ResolvedItem[] = [
  item(
    {
      title: "Fall Open House 2026",
      subtitle: "",
      teaser:
        "Tour the campus, sit in on a class and meet the counselor for your region.",
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    },
    {
      eventType: "Open House",
      startDate: "2026-10-17",
      startTime: "9:00 AM",
      location: "Lakeside Quad",
      url: "/events/fall-open-house-2026",
      locale: "en-US",
    },
  ),
  item(
    {
      title: "Early Action Deadline",
      subtitle: "",
      teaser:
        "Applications submitted by this date receive a decision before the new year.",
      image: "",
    },
    {
      eventType: "Deadline",
      startDate: "2026-11-01",
      location: "Online",
      url: "/events/early-action-deadline",
      locale: "en-US",
    },
  ),
  item(
    {
      title: "Financial Aid Workshop",
      subtitle: "",
      teaser:
        "A walkthrough of the FAFSA, institutional aid and the scholarship timeline.",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    },
    {
      eventType: "Webinar",
      startDate: "2026-11-12",
      startTime: "6:30 PM",
      endTime: "7:30 PM",
      location: "Online",
      url: "/events/financial-aid-workshop",
      locale: "en-US",
    },
  ),
];

const people: ResolvedItem[] = [
  item(
    {
      title: "Marisol Vega",
      subtitle: "Senior Admissions Counselor",
      teaser: "Great Lakes region, first-generation and transfer applicants.",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    },
    { url: "/counselors/marisol-vega" },
  ),
  item(
    {
      title: "Daniel Okonkwo",
      subtitle: "Admissions Counselor",
      teaser: "College of Engineering and the School of AI Studies.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
    { url: "/counselors/daniel-okonkwo" },
  ),
  item(
    {
      title: "Hannah Lindqvist",
      subtitle: "Director, International Admissions",
      teaser: "Qualifications earned outside the United States, visas and funding.",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    },
    { url: "/counselors/hannah-lindqvist" },
  ),
  item(
    {
      title: "Theo Brant",
      subtitle: "Admissions Counselor",
      teaser: "College of Arts and Letters, and applicants still choosing a major.",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    },
    { url: "/counselors/theo-brant" },
  ),
];

const show = {
  showTitle: true,
  showSubtitle: true,
  showTeaser: true,
  showImage: true,
  showIcon: false,
};

export const PeopleCards: Story = {
  args: {
    eyebrow: "Admissions",
    heading: "Meet Your Counselors",
    subtext:
      "Every applicant is assigned a counselor by region. They read your file and are the person to ask.",
    background: "offWhite",
    children: <PersonCards items={people} {...show} />,
  },
};

export const EventCardsStory: Story = {
  name: "Event cards",
  args: {
    eyebrow: "Visit",
    heading: "Upcoming Events",
    subtext: "Open houses, deadlines and webinars across the admissions year.",
    background: "white",
    children: <EventCards items={events} {...show} />,
  },
};

/**
 * With every header field blank the section drops the header rather than
 * leaving its bottom margin behind — the shape used when a listing is dropped
 * straight under another block's heading.
 */
export const WithoutHeader: Story = {
  args: {
    background: "white",
    children: <EventCards items={events} {...show} />,
  },
};

/** What an editor sees before a datasource is bound, or when a filter matches nothing. */
export const Empty: Story = {
  args: {
    eyebrow: "Visit",
    heading: "Upcoming Events",
    background: "offWhite",
    children: <EventCards items={[]} {...show} />,
  },
};
