import type { Meta, StoryObj } from "@storybook/nextjs";
import { colors, typography } from "../../design-system/tokens";

const meta: Meta = { title: "Foundations/Color Contrast" };
export default meta;
type Story = StoryObj;

/** WCAG 2.x relative luminance + contrast ratio. */
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(fg: string, bg: string): number {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}
function grade(r: number): { label: string; ok: boolean } {
  if (r >= 7) return { label: "AAA", ok: true };
  if (r >= 4.5) return { label: "AA", ok: true };
  if (r >= 3) return { label: "AA large", ok: true };
  return { label: "Fail", ok: false };
}
/** Alpha-composite a translucent white/black over an opaque background (for rgba() text colors). */
function blendOver(alpha: number, fgIsWhite: boolean, bgHex: string): string {
  const bg = bgHex.replace("#", "");
  const [br, bg_, bb] = [0, 2, 4].map((i) => parseInt(bg.slice(i, i + 2), 16));
  const f = fgIsWhite ? 255 : 0;
  const blend = (b: number) => Math.round(f * alpha + b * (1 - alpha));
  return `#${[blend(br), blend(bg_), blend(bb)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Every fg/bg pairing actually used by a GLU component, traced back to its source file. */
const PAIRINGS: { name: string; fg: string; bg: string; usage: string }[] = [
  { name: "Dark on white", fg: colors.dark, bg: colors.white, usage: "Body text, H1–H6 (typography.tsx)" },
  { name: "Crimson on white", fg: colors.crimson, bg: colors.white, usage: "Eyebrow, links, outline button (button.tsx, typography.tsx)" },
  { name: "Muted on white", fg: colors.muted, bg: colors.white, usage: "Body muted variant, captions (typography.tsx)" },
  { name: "Dark on off-white", fg: colors.dark, bg: colors.offWhite, usage: "Section/Card light backgrounds" },
  { name: "Dark on light rose", fg: colors.dark, bg: colors.lightBlue, usage: "GLUAccordion / GLUCardGrid lightBlue variant" },
  { name: "White on crimson", fg: colors.white, bg: colors.crimson, usage: "GLUHero / GLUNav heading & CTA text" },
  { name: "White on crimson dark", fg: colors.white, bg: colors.crimsonDark, usage: "GLUNav mobile menu links (glu-nav.tsx)" },
  { name: "Gold on crimson dark", fg: colors.gold, bg: colors.crimsonDark, usage: "GLUFooter column headings (glu-footer.tsx)" },
  { name: "Dark on gold", fg: colors.dark, bg: colors.gold, usage: "Button primary variant (button.tsx)" },
  { name: "Nav link (85% white) on crimson", fg: blendOver(0.85, true, colors.crimson), bg: colors.crimson, usage: "GLUNav desktop link default state" },
  { name: "Footer link (70% white) on crimson dark", fg: blendOver(0.7, true, colors.crimsonDark), bg: colors.crimsonDark, usage: "GLUFooter column links (glu-footer.tsx)" },
];

export const ApprovedPairings: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        Color contrast
      </h2>
      <p style={{ maxWidth: 680, color: colors.muted, marginBottom: 32 }}>
        Every text/background pairing actually used by a GLU component, with a live-computed WCAG
        contrast ratio (not hand-typed numbers — see <code>luminance()</code>/<code>ratio()</code>{" "}
        above). The two translucent-white rows are alpha-composited over their solid background
        first, since that's the effective color a reader actually sees.
      </p>
      <table style={{ width: "100%", maxWidth: 760, textAlign: "left" as const, fontSize: "0.875rem", borderCollapse: "collapse" as const }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${colors.crimson}`, color: colors.crimson }}>
            <th style={{ padding: "8px 16px 8px 0", fontWeight: 700 }}>Sample</th>
            <th style={{ padding: "8px 16px 8px 0", fontWeight: 700 }}>Usage</th>
            <th style={{ padding: "8px 16px 8px 0", fontWeight: 700 }}>Ratio</th>
            <th style={{ padding: "8px 0", fontWeight: 700 }}>WCAG</th>
          </tr>
        </thead>
        <tbody>
          {PAIRINGS.map((p) => {
            const r = ratio(p.fg, p.bg);
            const g = grade(r);
            return (
              <tr key={p.name} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: "10px 16px 10px 0" }}>
                  <span style={{ display: "inline-block", borderRadius: 4, padding: "6px 12px", fontSize: "0.875rem", fontWeight: 600, color: p.fg, background: p.bg, outline: `1px solid ${colors.border}` }}>
                    {p.name}
                  </span>
                </td>
                <td style={{ padding: "10px 16px 10px 0", fontSize: "0.75rem", color: colors.muted }}>{p.usage}</td>
                <td style={{ padding: "10px 16px 10px 0", fontFamily: "monospace", fontSize: "0.75rem" }}>{r.toFixed(2)}:1</td>
                <td style={{ padding: "10px 0" }}>
                  <span style={{ borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700, background: g.ok ? "#c8f0d8" : "#f8c8c8", color: colors.dark }}>
                    {g.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ maxWidth: 680, fontSize: "0.8125rem", color: colors.muted, marginTop: 24 }}>
        The one pairing worth watching: <strong>Gold on Crimson Dark</strong> (footer column
        headings) lands at the low end of AA. It's only ever used for short, bold, uppercase
        headings (never body copy), which is the correct use case for a borderline-AA pairing —
        but it has no headroom, so don't reuse it for smaller or lighter-weight text.
      </p>
    </div>
  ),
};
