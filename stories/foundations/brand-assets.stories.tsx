import type { Meta, StoryObj } from "@storybook/nextjs";
import { colors, typography } from "../../design-system/tokens";
import { GLULogo } from "../../design-system/components/glu-logo";

const meta: Meta = { title: "Foundations/Brand Assets" };
export default meta;
type Story = StoryObj;

export const Wordmark: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        GLU shield & wordmark
      </h2>
      <p style={{ maxWidth: 680, color: colors.muted, marginBottom: 8 }}>
        Unlike Berkeley (a real institution with a published brand guide), GLU is a fictional demo
        university — there is no brand.glu.edu to cite. What follows is descriptive, not
        prescriptive: how the <code>GLULogo</code> component is actually implemented and used
        across the site today, not an invented style guide.
      </p>
      <p style={{ maxWidth: 680, color: colors.muted, marginBottom: 32 }}>
        <code>design-system/components/glu-logo.tsx</code> is a single inline SVG (a shield with
        three stars and a monogram &ldquo;G&rdquo;, plus a &ldquo;GRAND LAKES / UNIVERSITY&rdquo;
        wordmark) — not a bitmap asset. <code>color</code> and <code>width</code> are the only
        props; height is derived to hold the 340:80 aspect ratio.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 720, marginBottom: 32 }}>
        <figure style={{ margin: 0 }}>
          <div style={{ display: "flex", height: 144, alignItems: "center", justifyContent: "center", borderRadius: 8, background: colors.crimson }}>
            <GLULogo color={colors.white} width={220} />
          </div>
          <figcaption style={{ marginTop: 8, fontSize: "0.75rem", color: colors.muted }}>
            <code>color={"{colors.white}"}</code> on crimson — as used in GLUNav (width 160) and
            GLUFooter (width 180)
          </figcaption>
        </figure>
        <figure style={{ margin: 0 }}>
          <div style={{ display: "flex", height: 144, alignItems: "center", justifyContent: "center", borderRadius: 8, background: colors.white, border: `1px solid ${colors.border}` }}>
            <GLULogo color={colors.crimson} width={220} />
          </div>
          <figcaption style={{ marginTop: 8, fontSize: "0.75rem", color: colors.muted }}>
            <code>color={"{colors.crimson}"}</code> on white — used in the Storybook{" "}
            <code>GLULogo</code> stories; not currently used on any live page
          </figcaption>
        </figure>
      </div>

      <h3 style={{ fontFamily: typography.fontHeading, fontSize: "1.25rem", fontWeight: 600, color: colors.dark, marginBottom: 12 }}>
        What the code actually enforces
      </h3>
      <ul style={{ maxWidth: 640, paddingLeft: 20, color: colors.dark, fontSize: "0.875rem", lineHeight: 1.7 }}>
        <li>Two live contexts only: white-on-crimson (GLUNav) and white-on-crimson-dark (GLUFooter).</li>
        <li>No minimum clear-space, no lockup variants, no do/don&rsquo;t rules exist in code — anyone extending this component should establish those deliberately rather than assume they&rsquo;re implied.</li>
        <li>The monogram &ldquo;G&rdquo; uses <code>var(--font-heading)</code> (Playfair Display) directly inside the SVG — one of only two places in the codebase a CSS custom property is used for font selection rather than the <code>typography</code> token object.</li>
      </ul>
    </div>
  ),
};
