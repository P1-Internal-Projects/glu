import type { Meta, StoryObj } from "@storybook/nextjs";
import { colors, shadows, typography, spacing } from "../../design-system/tokens";

const meta: Meta = { title: "Foundations/Elevation & Borders" };
export default meta;
type Story = StoryObj;

const SHADOWS: { name: keyof typeof shadows; note: string }[] = [
  { name: "sm", note: "Card at rest (design-system/components/card.tsx)" },
  { name: "md", note: "Card on hover — the only interactive elevation change in the library" },
  { name: "lg", note: "Testimonial card panel on the crimson testimonial section" },
  { name: "xl", note: "Defined in tokens but not currently used by any component" },
];

export const Shadows: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        Shadows
      </h2>
      <p style={{ maxWidth: 640, color: colors.muted, marginBottom: 32 }}>
        Every shadow in <code>tokens.ts</code> is crimson-tinted (<code>rgba(139,0,21,…)</code>)
        rather than neutral black — a small but consistent brand touch. GLU is a mostly flat,
        card-and-color-driven system: shadow only appears on the design-system <code>Card</code>{" "}
        primitive and the testimonial panel.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 32 }}>
        {SHADOWS.map((s) => (
          <div key={s.name} style={{ textAlign: "center" as const, width: 180 }}>
            <div style={{ height: 96, width: 140, margin: "0 auto", borderRadius: 8, backgroundColor: colors.white, boxShadow: shadows[s.name] }} />
            <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: colors.dark }}>
              shadows.{s.name}
            </div>
            <div style={{ marginTop: 4, fontSize: "0.75rem", color: colors.muted }}>{s.note}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const BordersAndAccents: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 24 }}>
        Borders & accents
      </h2>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ height: 64, width: 160, background: colors.offWhite, border: `1px solid ${colors.border}` }} />
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: colors.dark }}>colors.border (1px)</div>
            <div style={{ fontSize: "0.75rem", color: colors.muted }}>Card outlines, accordion dividers</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 40, height: 3, background: colors.gold }} />
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: colors.dark }}>Gold accent bar</div>
            <div style={{ fontSize: "0.75rem", color: colors.muted }}>
              Signature under-eyebrow rule in GLUHero — see components/puck/glu-hero.tsx
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 9999, background: colors.crimson, boxShadow: `0 0 0 4px ${colors.offWhite}, 0 0 0 6px ${colors.crimson}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.white, fontFamily: typography.fontHeading, fontSize: "0.75rem", fontWeight: 700 }}>
            1887
          </div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: colors.dark }}>Ring + connecting line</div>
            <div style={{ fontSize: "0.75rem", color: colors.muted }}>
              GLUTimeline&rsquo;s year badges — double box-shadow ring, not a real border
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
