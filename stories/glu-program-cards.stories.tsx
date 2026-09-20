import type { Meta, StoryObj } from "@storybook/nextjs";
import type { ResolvedItem } from "@pantheon-systems/puck-css/fields";
import { GLUProgramCards } from "../components/puck/glu-program-cards";
import { colors, layout, spacing, typography } from "../design-system/tokens";

/**
 * The academic program mode: text-only cards, a college filter, and a detail
 * panel that opens beneath the clicked card's row.
 *
 * Fixtures mirror the shape the Drupal catalog returns, so what renders here is
 * what renders on /academic-programs.
 */
const meta: Meta<typeof GLUProgramCards> = {
  title: "Components/GLUProgramCards",
  component: GLUProgramCards,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUProgramCards>;

function program(
  title: string,
  raw: Record<string, unknown>,
  teaser: string,
): ResolvedItem {
  return { title, subtitle: "", teaser, image: "", icon: "", _raw: raw };
}

const PROGRAMS: ResolvedItem[] = [
  program("B.S. Environmental Science", {
    code: "ENVS-BS", college: "College of Environmental Science", department: "Environmental Science",
    degreeType: "B.S.", degreeLevelLabel: "Bachelor's", credits: 124, duration: "4 years",
    deliveryModes: ["On campus"], startTerms: ["Fall", "Spring"], featured: true,
    careerOutcomes: ["Environmental scientist", "Conservation officer", "Sustainability analyst"],
    applyUrl: "/apply?program=ENVS-BS",
    description: "Field-heavy study of ecosystems and climate, with direct access to the Great Lakes watershed. Students work closely with faculty from their first term, and every program carries an advising plan mapped term by term.",
  }, "Field-heavy study of ecosystems and climate, with direct access to the Great Lakes watershed."),
  program("M.Eng. Robotics", {
    code: "ROBO-MENG", college: "College of Engineering", department: "Mechanical Engineering",
    degreeType: "M.Eng.", degreeLevelLabel: "Master's", credits: 30, duration: "18 months",
    deliveryModes: ["On campus", "Hybrid"], startTerms: ["Fall", "Spring"], featured: true,
    careerOutcomes: ["Robotics engineer", "Controls engineer", "Automation lead"],
    applyUrl: "/apply?program=ROBO-MENG",
    description: "A professional master's in autonomous systems: perception, control and manipulation, project-based throughout.",
  }, "A professional master's in autonomous systems: perception, control and manipulation."),
  program("Juris Doctor", {
    code: "LAW-JD", college: "School of Law", department: "Law",
    degreeType: "J.D.", degreeLevelLabel: "Doctoral", credits: 90, duration: "3 years",
    deliveryModes: ["On campus"], startTerms: ["Fall"], accreditation: "ABA", featured: true,
    careerOutcomes: ["Attorney", "Judicial clerk", "Compliance counsel"],
    applyUrl: "/apply?program=LAW-JD",
    description: "The professional law degree, with clinics in environmental, immigration and small business law.",
  }, "The professional law degree, with clinics in environmental, immigration and small business law."),
  program("Certificate in Health Data Analytics", {
    code: "HDAT-CERT", college: "School of Public Health", department: "Biostatistics",
    degreeType: "Cert.", degreeLevelLabel: "Certificate", credits: 12, duration: "2 terms",
    deliveryModes: ["Online"], startTerms: ["Fall", "Spring", "Summer"],
    careerOutcomes: ["Health data analyst", "Clinical informaticist"],
    applyUrl: "/apply?program=HDAT-CERT",
    description: "R, health informatics and applied regression for clinicians and analysts already in the field.",
  }, "R, health informatics and applied regression for clinicians already in the field."),
  program("B.A. English Literature", {
    code: "ENGL-BA", college: "College of Liberal Arts", department: "English",
    degreeType: "B.A.", degreeLevelLabel: "Bachelor's", credits: 120, duration: "4 years",
    deliveryModes: ["On campus"], startTerms: ["Fall", "Spring"],
    careerOutcomes: ["Editor", "Communications manager", "Secondary teacher"],
    applyUrl: "/apply?program=ENGL-BA",
    description: "Close reading, critical theory and the long arc of literature in English, from Beowulf to the contemporary novel.",
  }, "Close reading, critical theory and the long arc of literature in English."),
  program("M.S. Data Science", {
    code: "DATA-MS", college: "Graduate School", department: "Interdisciplinary Studies",
    degreeType: "M.S.", degreeLevelLabel: "Master's", credits: 36, duration: "2 years",
    deliveryModes: ["On campus", "Online", "Hybrid"], startTerms: ["Fall", "Spring"], featured: true,
    careerOutcomes: ["Data scientist", "Machine learning engineer", "Analytics manager"],
    applyUrl: "/apply?program=DATA-MS",
    description: "Statistics, machine learning and data engineering, with a capstone on a sponsor's real dataset.",
  }, "Statistics, machine learning and data engineering, with a capstone on a sponsor's real dataset."),
];

const SHOW = { showTitle: true, showSubtitle: true, showTeaser: true, showImage: false, showIcon: false };

/**
 * How the block reads on a page.
 *
 * The section shell is inlined here rather than imported: GLUListingSection
 * lands with the listing-chrome PR, and this branch should not depend on it.
 * Swap this for the real one once that merges.
 */
export const InPage: Story = {
  name: "In page",
  render: (args) => (
    <section style={{ backgroundColor: colors.offWhite, padding: `${layout.sectionPaddingY} 0` }}>
      <div style={{ maxWidth: layout.containerMax, margin: "0 auto", padding: `0 ${spacing[6]}` }}>
        <div style={{ textAlign: "center", maxWidth: 680, margin: `0 auto ${spacing[12]}` }}>
          <p style={{ fontFamily: typography.fontBody, fontSize: typography.sizeSm, fontWeight: typography.weightSemibold, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.crimson, margin: `0 0 ${spacing[3]}` }}>
            Academics
          </p>
          <h2 style={{ fontFamily: typography.fontHeading, fontSize: typography.size4xl, fontWeight: typography.weightBold, color: colors.dark, lineHeight: typography.lineHeightTight, margin: `0 0 ${spacing[4]}` }}>
            The Full Catalog
          </h2>
          <p style={{ fontFamily: typography.fontBody, fontSize: typography.sizeLg, color: colors.muted, lineHeight: typography.lineHeightRelaxed, margin: 0 }}>
            Every degree and certificate across eight colleges. Filter by college, then open a program for the full detail.
          </p>
        </div>
        <GLUProgramCards {...args} />
      </div>
    </section>
  ),
  args: { items: PROGRAMS, ...SHOW, showCollegeFilter: true },
};

/** The grid on its own, for working on the cards. */
export const Grid: Story = {
  args: { items: PROGRAMS, ...SHOW, showCollegeFilter: true },
};

/** Without the filter — for a page that already scopes to one college. */
export const NoFilter: Story = {
  name: "Filter hidden",
  args: { items: PROGRAMS, ...SHOW, showCollegeFilter: false },
};

/** A single college's worth, where the filter has nothing to offer. */
export const OneCollege: Story = {
  name: "Single college",
  args: {
    items: PROGRAMS.filter((p) => (p._raw as { college?: string }).college === "College of Engineering"),
    ...SHOW,
    showCollegeFilter: true,
  },
};

export const Empty: Story = {
  args: { items: [], ...SHOW, showCollegeFilter: true },
};
