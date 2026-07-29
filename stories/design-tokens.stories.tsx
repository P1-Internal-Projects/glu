import type { Meta, StoryObj } from "@storybook/nextjs";
import { colors, typography, spacing, shadows, radii } from "../design-system/tokens";

const meta: Meta = {
  title: "Design System/Design Tokens",
};
export default meta;

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: radii.md,
          backgroundColor: value,
          border: "1px solid rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
        <div style={{ fontSize: 12, color: "#4a5568", fontFamily: "monospace" }}>{value}</div>
      </div>
    </div>
  );
}

export const Colors: StoryObj = {
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontFamily: typography.fontHeading, marginBottom: 24 }}>Color Tokens</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
        {Object.entries(colors).map(([name, value]) => (
          <Swatch key={name} name={`colors.${name}`} value={value} />
        ))}
      </div>
    </div>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h2 style={{ fontFamily: typography.fontHeading, marginBottom: 24 }}>Typography Scale</h2>
      {[
        { label: "size6xl — 3.75rem", size: typography.size6xl, font: typography.fontHeading },
        { label: "size5xl — 3rem", size: typography.size5xl, font: typography.fontHeading },
        { label: "size4xl — 2.25rem", size: typography.size4xl, font: typography.fontHeading },
        { label: "size3xl — 1.875rem", size: typography.size3xl, font: typography.fontHeading },
        { label: "size2xl — 1.5rem", size: typography.size2xl, font: typography.fontBody },
        { label: "sizeXl — 1.25rem", size: typography.sizeXl, font: typography.fontBody },
        { label: "sizeLg — 1.125rem", size: typography.sizeLg, font: typography.fontBody },
        { label: "sizeBase — 1rem", size: typography.sizeBase, font: typography.fontBody },
        { label: "sizeSm — 0.875rem", size: typography.sizeSm, font: typography.fontBody },
        { label: "sizeXs — 0.75rem", size: typography.sizeXs, font: typography.fontBody },
      ].map(({ label, size, font }) => (
        <div key={label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #dce5ef" }}>
          <div style={{ fontSize: size, fontFamily: font, lineHeight: 1.2, color: "#1a2744" }}>
            Grand Lakes University
          </div>
          <div style={{ fontSize: 11, color: "#4a5568", marginTop: 4, fontFamily: "monospace" }}>{label}</div>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: StoryObj = {
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontFamily: typography.fontHeading, marginBottom: 24 }}>Spacing Scale</h2>
      {Object.entries(spacing).map(([key, value]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <div style={{ width: value, height: 24, backgroundColor: "#1e6b9b", borderRadius: 2 }} />
          <span style={{ fontSize: 13, fontFamily: "monospace", color: "#4a5568" }}>
            spacing.{key} — {value}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Shadows: StoryObj = {
  render: () => (
    <div style={{ padding: 40, display: "flex", gap: 32, flexWrap: "wrap" as const }}>
      {Object.entries(shadows).map(([name, value]) => (
        <div key={name} style={{ textAlign: "center" as const }}>
          <div
            style={{
              width: 120,
              height: 80,
              backgroundColor: "#ffffff",
              borderRadius: radii.lg,
              boxShadow: value,
              marginBottom: 8,
            }}
          />
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "#4a5568" }}>shadows.{name}</div>
        </div>
      ))}
    </div>
  ),
};

export const Radii: StoryObj = {
  render: () => (
    <div style={{ padding: 40, display: "flex", gap: 32, flexWrap: "wrap" as const, alignItems: "flex-end" }}>
      {Object.entries(radii).map(([name, value]) => (
        <div key={name} style={{ textAlign: "center" as const }}>
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#0d3b6e",
              borderRadius: value,
              marginBottom: 8,
            }}
          />
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "#4a5568" }}>
            {name}<br />{value}
          </div>
        </div>
      ))}
    </div>
  ),
};
