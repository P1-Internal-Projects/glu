import type { Meta, StoryObj } from "@storybook/nextjs";
import { colors, typography } from "../../design-system/tokens";

const meta: Meta = { title: "Foundations/Colors" };
export default meta;
type Story = StoryObj;

interface Swatch {
  name: string;
  tokenPath: string;
  hex: string;
}

function SwatchGrid({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h3 style={{ fontFamily: typography.fontHeading, fontSize: "1.25rem", fontWeight: 600, color: colors.crimson, marginBottom: 12 }}>
        {title}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {swatches.map((s) => (
          <div key={s.name} style={{ overflow: "hidden", borderRadius: 8, border: `1px solid ${colors.border}` }}>
            <div style={{ background: s.hex, height: 88 }} />
            <div style={{ background: colors.white, padding: 12 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: colors.dark }}>{s.name}</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: colors.muted }}>{s.hex}</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.6875rem", color: colors.muted, opacity: 0.8 }}>
                {s.tokenPath}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const Palette: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 24 }}>
        GLU color palette
      </h2>
      <p style={{ maxWidth: 640, fontSize: "0.875rem", color: colors.muted, marginBottom: 32 }}>
        These are the exact values exported from <code>design-system/tokens.ts</code> — every GLU
        component imports <code>colors</code> from this single source. There is no separate
        brand-guideline document for this fictional university; this palette <em>is</em> the source
        of truth.
      </p>
      <SwatchGrid
        title="Primary — Crimson"
        swatches={[
          { name: "Crimson", tokenPath: "colors.crimson", hex: colors.crimson },
          { name: "Crimson Dark", tokenPath: "colors.crimsonDark", hex: colors.crimsonDark },
          { name: "Crimson Light", tokenPath: "colors.crimsonLight", hex: colors.crimsonLight },
        ]}
      />
      <SwatchGrid
        title="Accent — Gold"
        swatches={[
          { name: "Gold", tokenPath: "colors.gold", hex: colors.gold },
          { name: "Gold Dark", tokenPath: "colors.goldDark", hex: colors.goldDark },
          { name: "Gold Light", tokenPath: "colors.goldLight", hex: colors.goldLight },
        ]}
      />
      <SwatchGrid
        title="Secondary"
        swatches={[{ name: "Blue", tokenPath: "colors.blue", hex: colors.blue }]}
      />
      <SwatchGrid
        title="Neutrals & surfaces"
        swatches={[
          { name: "White", tokenPath: "colors.white", hex: colors.white },
          { name: "Off White", tokenPath: "colors.offWhite", hex: colors.offWhite },
          { name: "Light Rose", tokenPath: "colors.lightBlue", hex: colors.lightBlue },
          { name: "Border", tokenPath: "colors.border", hex: colors.border },
        ]}
      />
      <SwatchGrid
        title="Text"
        swatches={[
          { name: "Dark (body/headings)", tokenPath: "colors.dark", hex: colors.dark },
          { name: "Muted", tokenPath: "colors.muted", hex: colors.muted },
        ]}
      />
      <SwatchGrid
        title="Status"
        swatches={[
          { name: "Success", tokenPath: "colors.success", hex: colors.success },
          { name: "Error", tokenPath: "colors.error", hex: colors.error },
        ]}
      />
      <p style={{ maxWidth: 640, fontSize: "0.8125rem", color: colors.muted, marginTop: 8 }}>
        Note: <code>colors.navy</code> was renamed to <code>colors.crimson</code> on 2026-07-29 —
        the value (<code>#8B0015</code>) is a deep crimson, not navy blue. Puck field option values
        like <code>background: "navy"</code> on GLUStatsBar/GLUCtaBanner were left as-is (already
        serialized into published pages); only the internal token name changed.
      </p>
    </div>
  ),
};
