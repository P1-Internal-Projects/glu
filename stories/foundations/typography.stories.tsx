import type { Meta, StoryObj } from "@storybook/nextjs";
import { colors, typography } from "../../design-system/tokens";

const meta: Meta = { title: "Foundations/Typography" };
export default meta;
type Story = StoryObj;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "baseline", gap: 24, borderBottom: `1px solid ${colors.border}`, padding: "20px 0" }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em", color: colors.muted }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

export const TypeScale: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        Typography
      </h2>
      <p style={{ maxWidth: 640, color: colors.muted, marginBottom: 32 }}>
        <strong>Playfair Display</strong> (serif, self-hosted via <code>next/font/google</code>) for
        all headings — every GLU heading component references{" "}
        <code>typography.fontHeading</code>. <strong>Inter</strong> (sans) for body copy, nav,
        buttons, and UI chrome via <code>typography.fontBody</code>. No condensed/display secondary
        family — this is a two-font system, unlike Berkeley's three-font stack.
      </p>

      <Row label="size6xl / H1">
        <div style={{ fontFamily: typography.fontHeading, fontSize: typography.size6xl, fontWeight: 700, color: colors.dark, lineHeight: typography.lineHeightTight }}>
          Chart Your Course
        </div>
      </Row>
      <Row label="size4xl / H2">
        <div style={{ fontFamily: typography.fontHeading, fontSize: typography.size4xl, fontWeight: 700, color: colors.dark, lineHeight: typography.lineHeightTight }}>
          Find Your Program at GLU
        </div>
      </Row>
      <Row label="size3xl / H3">
        <div style={{ fontFamily: typography.fontHeading, fontSize: typography.size3xl, fontWeight: 700, color: colors.dark, lineHeight: typography.lineHeightTight }}>
          A Legacy of Excellence
        </div>
      </Row>
      <Row label="sizeXl / H5">
        <div style={{ fontFamily: typography.fontHeading, fontSize: typography.sizeXl, fontWeight: 700, color: colors.dark, lineHeight: typography.lineHeightSnug }}>
          Meet Our Faculty
        </div>
      </Row>
      <Row label="sizeLg / Body">
        <p style={{ fontFamily: typography.fontBody, fontSize: typography.sizeLg, color: colors.dark, lineHeight: typography.lineHeightRelaxed, maxWidth: 560, margin: 0 }}>
          Join 15,000 students at Michigan&rsquo;s flagship research university. Explore 120+
          majors, world-class faculty, and a campus that sits on the shores of the Great Lakes.
        </p>
      </Row>
      <Row label="sizeBase / Body">
        <p style={{ fontFamily: typography.fontBody, fontSize: typography.sizeBase, color: colors.dark, lineHeight: typography.lineHeightRelaxed, maxWidth: 560, margin: 0 }}>
          With 120+ degree programs across 8 colleges, Grand Lakes offers the breadth of a major
          research university with the feel of a close-knit community.
        </p>
      </Row>
      <Row label="sizeSm / Muted">
        <p style={{ fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.muted, lineHeight: typography.lineHeightNormal, margin: 0 }}>
          Applications for Fall 2026 are open. Early Action deadline: November 1.
        </p>
      </Row>
      <Row label="Eyebrow">
        <div style={{ fontFamily: typography.fontBody, fontSize: typography.sizeSm, fontWeight: typography.weightSemibold, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: colors.crimson }}>
          Undergraduate Admissions
        </div>
      </Row>
      <Row label="sizeXs / Caption">
        <span style={{ fontFamily: typography.fontBody, fontSize: typography.sizeXs, color: colors.muted }}>
          © 2025 Grand Lakes University. 1887 University Drive, Grand Lakes, Michigan 48901.
        </span>
      </Row>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white, display: "flex", flexDirection: "column" as const, gap: 12 }}>
      {[
        { label: "normal (400)", weight: typography.weightNormal },
        { label: "medium (500)", weight: typography.weightMedium },
        { label: "semibold (600)", weight: typography.weightSemibold },
        { label: "bold (700)", weight: typography.weightBold },
      ].map((w) => (
        <div key={w.label} style={{ fontSize: "1.25rem", fontWeight: w.weight, color: colors.dark }}>
          {w.label} — Grand Lakes University
        </div>
      ))}
    </div>
  ),
};
