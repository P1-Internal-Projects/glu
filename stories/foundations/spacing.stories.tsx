import type { Meta, StoryObj } from "@storybook/nextjs";
import { colors, spacing, radii, typography } from "../../design-system/tokens";

const meta: Meta = { title: "Foundations/Spacing" };
export default meta;
type Story = StoryObj;

export const SpacingScale: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        Spacing scale
      </h2>
      <p style={{ maxWidth: 640, color: colors.muted, marginBottom: 24 }}>
        A fixed rem scale (<code>design-system/tokens.ts</code> → <code>spacing</code>), used for
        every padding/margin/gap value across the component library — no arbitrary pixel values in
        component code.
      </p>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {Object.entries(spacing).map(([key, value]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, fontFamily: "monospace", fontSize: "0.75rem", color: colors.muted }}>{key}</div>
            <div style={{ height: 20, width: value, backgroundColor: colors.crimson, borderRadius: 2, flexShrink: 0 }} />
            <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: colors.muted }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 24 }}>
        Border radius
      </h2>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" as const }}>
        {Object.entries(radii).map(([name, value]) => (
          <div key={name} style={{ textAlign: "center" as const }}>
            <div style={{ width: 80, height: 80, backgroundColor: colors.rose, border: `2px solid ${colors.crimson}`, borderRadius: value }} />
            <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: "0.75rem", color: colors.muted }}>
              {name}<br />{value || "0"}
            </div>
          </div>
        ))}
      </div>
      <p style={{ maxWidth: 640, fontSize: "0.8125rem", color: colors.muted, marginTop: 24 }}>
        <code>radii.full</code> is used for every button, badge, testimonial dot, and slideshow
        arrow — the pill shape is the single most repeated silhouette in the GLU library.
      </p>
    </div>
  ),
};
