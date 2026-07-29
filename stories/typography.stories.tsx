import type { Meta, StoryObj } from "@storybook/nextjs";
import { H1, H2, H3, H4, H5, H6, Body, Eyebrow, Caption, Label } from "../design-system/components/typography";

const meta: Meta = {
  title: "Design System/Typography",
};
export default meta;

export const Headings: StoryObj = {
  render: () => (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <H1>H1 — Discover Your Future at Grand Lakes</H1>
      <H2>H2 — Colleges & Schools</H2>
      <H3>H3 — College of Engineering</H3>
      <H4>H4 — Department of Computer Science</H4>
      <H5>H5 — Program Requirements</H5>
      <H6>H6 — Course Listings</H6>
    </div>
  ),
};

export const BodyText: StoryObj = {
  render: () => (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
      <Body size="lg">Large — Grand Lakes University is a public research institution dedicated to excellence in teaching, research, and community engagement.</Body>
      <Body>Base — Founded in 1887, GLU serves more than 15,000 students across eight colleges and over 120 undergraduate programs.</Body>
      <Body size="sm">Small — Applications for Fall 2025 are now open. Early Action deadline: November 1.</Body>
      <Body muted>Muted — This text uses the secondary muted color for less prominent information.</Body>
    </div>
  ),
};

export const Labels: StoryObj = {
  render: () => (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <Eyebrow>Eyebrow — Admissions</Eyebrow>
      <Label>Label — Application Deadline</Label>
      <Caption>Caption — All deadlines are 11:59 PM Eastern Time</Caption>
    </div>
  ),
};
