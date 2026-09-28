import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUFactGridComponent } from "../components/puck/glu-fact-grid";

/**
 * The supporting detail under a page's main description.
 *
 * On the program detail page every row is bound to the datasource rather than
 * typed in, so these stories are really about the two things the block has to
 * survive: a record that fills every row, and a record that fills almost none.
 * A route template shows the same block for both.
 */
const meta: Meta<typeof GLUFactGridComponent> = {
  title: "Components/GLUFactGrid",
  component: GLUFactGridComponent,
  parameters: { layout: "fullscreen" },
  argTypes: {
    background: { control: "select", options: ["white", "offWhite", "rose"] },
  },
};

export default meta;
type Story = StoryObj<typeof GLUFactGridComponent>;

const PROGRAM_FACTS = [
  { label: "Degree", value: "Master's" },
  { label: "Award", value: "M.S." },
  { label: "College", value: "Graduate School" },
  { label: "Department", value: "School of AI Studies" },
  { label: "Accreditation", value: "ABET" },
  { label: "Program code", value: "AIST-MS" },
  { label: "Career outcomes", value: "AI engineer, Research engineer, ML platform lead" },
];

/** The program detail page's own arrangement. */
export const ProgramDetails: Story = {
  args: {
    eyebrow: "",
    heading: "Program details",
    background: "offWhite",
    facts: PROGRAM_FACTS,
  },
};

export const OnWhite: Story = {
  args: { ...ProgramDetails.args, background: "white" },
};

export const WithEyebrow: Story = {
  args: { ...ProgramDetails.args, eyebrow: "At a glance" },
};

/** No heading at all: a bare grid, for a page that already has one above it. */
export const NoHeading: Story = {
  args: { ...ProgramDetails.args, heading: "" },
};

/**
 * A certificate: no accreditation, no department, no outcomes recorded. The
 * grid reflows to what is there rather than standing empty terms in a row.
 */
export const SparseRecord: Story = {
  args: {
    eyebrow: "",
    heading: "Program details",
    background: "offWhite",
    facts: [
      { label: "Degree", value: "Certificate" },
      { label: "College", value: "College of Engineering" },
      { label: "Program code", value: "DATA-CERT" },
    ],
  },
};

/**
 * Rows arriving from a datasource can be blank. They are dropped rather than
 * rendered as a label with nothing under it.
 */
export const BlankRowsDropped: Story = {
  args: {
    eyebrow: "",
    heading: "Program details",
    background: "offWhite",
    facts: [
      { label: "Degree", value: "Bachelor's" },
      { label: "Accreditation", value: "" },
      { label: "", value: "orphaned" },
      { label: "Program code", value: "ENGL-BA" },
    ],
  },
};

/** Nothing to show renders nothing, not an empty band of background colour. */
export const Empty: Story = {
  args: {
    eyebrow: "",
    heading: "Program details",
    background: "offWhite",
    facts: [],
  },
};
