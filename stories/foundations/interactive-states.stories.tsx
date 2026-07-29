import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { colors, typography, radii, spacing } from "../../design-system/tokens";
import { Button } from "../../design-system/components/button";

const meta: Meta = { title: "Foundations/Interactive States" };
export default meta;
type Story = StoryObj;

function NavLinkDemo() {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ background: colors.crimson, padding: "16px 24px", display: "inline-block" }}>
      <a
        href="#demo"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          fontFamily: typography.fontBody,
          fontSize: typography.sizeSm,
          fontWeight: typography.weightSemibold,
          color: hover ? colors.gold : "rgba(255,255,255,0.85)",
          textDecoration: "none",
          transition: "color 0.2s",
        }}
      >
        Academics {hover ? "(hover)" : "(rest — hover me)"}
      </a>
    </div>
  );
}

function AccordionDemo() {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      style={{ display: "flex", alignItems: "center", gap: 16, background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      <span
        style={{
          width: 24, height: 24, borderRadius: radii.full, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem", transition: "background-color 0.2s",
          backgroundColor: open ? colors.crimson : colors.lightBlue,
          color: open ? colors.white : colors.crimson,
        }}
      >
        {open ? "−" : "+"}
      </span>
      <span style={{ fontFamily: typography.fontBody, fontSize: typography.sizeLg, fontWeight: typography.weightSemibold, color: colors.dark }}>
        {open ? "Click to collapse" : "Click to expand"}
      </span>
    </button>
  );
}

export const NavAndAccordion: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        Nav links & accordion
      </h2>
      <p style={{ maxWidth: 640, color: colors.muted, marginBottom: 32 }}>
        Both of these are real, working state — not screenshots. GLUNav swaps link color to gold on
        hover via JS mouse handlers (not CSS <code>:hover</code>); GLUAccordion swaps the +/− icon
        background between light-rose and crimson.
      </p>
      <div style={{ marginBottom: 32 }}>
        <NavLinkDemo />
      </div>
      <AccordionDemo />
    </div>
  ),
};

export const ButtonVariants: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.white }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.crimson, marginBottom: 8 }}>
        Button variants
      </h2>
      <p style={{ maxWidth: 640, color: colors.muted, marginBottom: 24 }}>
        <code>design-system/components/button.tsx</code> defines four variants at rest. It does{" "}
        <strong>not</strong> define a distinct hover or focus-visible style — hover feedback comes
        entirely from the browser&rsquo;s default <code>cursor: pointer</code>, and keyboard focus
        falls back to whatever the browser/OS renders by default. That's an honest gap, not a
        deliberate design choice — flagging it here rather than inventing a polished treatment that
        doesn&rsquo;t exist in the code.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </div>
  ),
};

export const CarouselControls: Story = {
  render: () => (
    <div style={{ fontFamily: typography.fontBody, padding: 32, background: colors.crimson }}>
      <h2 style={{ fontFamily: typography.fontHeading, fontSize: "1.875rem", fontWeight: 600, color: colors.white, marginBottom: 8 }}>
        Carousel dot navigation
      </h2>
      <p style={{ maxWidth: 640, color: "rgba(255,255,255,0.8)", marginBottom: 24 }}>
        Shared pattern between GLUTestimonialSlider and GLUSlideshow: the active dot widens to a
        pill (24–28px) and turns gold; inactive dots stay small (8px) and translucent white.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: i === 1 ? 28 : 8,
              height: 8,
              borderRadius: radii.full,
              backgroundColor: i === 1 ? colors.gold : "rgba(255,255,255,0.45)",
              transition: "width 0.3s ease, background-color 0.3s ease",
            }}
          />
        ))}
        <span style={{ marginLeft: 12, fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>
          ← dot 2 of 4 is active
        </span>
      </div>
    </div>
  ),
};
