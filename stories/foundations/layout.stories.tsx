import type { Meta, StoryObj } from "@storybook/nextjs";
import { colors, layout, breakpoints, typography } from "../../design-system/tokens";

const meta: Meta = { title: "Foundations/Layout" };
export default meta;
type Story = StoryObj;

export const ContainerAndSection: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        Container & section rhythm
      </h2>
      <p style={{ maxWidth: 640, color: colors.muted, marginBottom: 32 }}>
        GLU doesn&rsquo;t have a Berkeley-style multi-column section-builder — every page is a
        vertical stack of full-width Puck components, each internally centering its own content in
        a single shared <code>Container</code> primitive.
      </p>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
        <div>
          <div style={{ marginBottom: 6, fontFamily: "monospace", fontSize: "0.75rem", color: colors.muted }}>
            layout.containerMax — {layout.containerMax}
          </div>
          <div style={{ maxWidth: layout.containerMax, height: 32, background: `${colors.crimson}22`, outline: `1px solid ${colors.crimson}66` }} />
        </div>
        <div>
          <div style={{ marginBottom: 6, fontFamily: "monospace", fontSize: "0.75rem", color: colors.muted }}>
            layout.sectionPaddingY — {layout.sectionPaddingY} (vertical padding on every Section)
          </div>
          <div style={{ background: colors.offWhite, paddingTop: layout.sectionPaddingY, paddingBottom: layout.sectionPaddingY, textAlign: "center" as const, fontSize: "0.75rem", color: colors.muted }}>
            content
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 6, fontFamily: "monospace", fontSize: "0.75rem", color: colors.muted }}>
            layout.navHeight — {layout.navHeight} (fixed, sticky top:0)
          </div>
          <div style={{ height: layout.navHeight, background: colors.crimson, display: "flex", alignItems: "center", paddingLeft: 16, color: colors.white, fontSize: "0.75rem" }}>
            GLUNav
          </div>
        </div>
      </div>
    </div>
  ),
};

export const GridPatterns: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 24 }}>
        Grid patterns in use
      </h2>
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 8, fontSize: "0.8125rem", color: colors.muted }}>
          GLUCardGrid — 3 or 4 equal columns (<code>columns</code> prop)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 48, background: colors.rose, borderRadius: 6 }} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ marginBottom: 8, fontSize: "0.8125rem", color: colors.muted }}>
          GLUFooter — brand column (2fr) + N link columns (1fr each)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8 }}>
          <div style={{ height: 48, background: colors.crimsonDark, borderRadius: 6 }} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 48, background: `${colors.crimsonDark}88`, borderRadius: 6 }} />
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Breakpoints: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        Breakpoints
      </h2>
      <p style={{ maxWidth: 640, color: colors.muted, marginBottom: 24 }}>
        Defined in tokens for reference; components mostly hand-roll their own single mobile
        breakpoint (<code>@media (max-width: 640px)</code>) rather than using the full scale below.
      </p>
      <table style={{ width: "100%", maxWidth: 320, textAlign: "left" as const, fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${colors.crimson}`, color: colors.crimson }}>
            <th style={{ padding: "8px 24px 8px 0" }}>Token</th>
            <th style={{ padding: "8px 0" }}>Min width</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(breakpoints).map(([name, px]) => (
            <tr key={name} style={{ borderBottom: `1px solid ${colors.border}` }}>
              <td style={{ padding: "8px 24px 8px 0", fontFamily: "monospace", fontSize: "0.75rem" }}>{name}</td>
              <td style={{ padding: "8px 0", fontFamily: "monospace", fontSize: "0.75rem", color: colors.muted }}>{px}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
