import type { Meta, StoryObj } from "@storybook/nextjs";
import { Card } from "../design-system/components/card";
import { typography, colors, spacing } from "../design-system/tokens";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <Card>
        <div style={{ padding: spacing[6] }}>
          <p style={{ fontFamily: typography.fontBody, fontSize: typography.sizeLg, fontWeight: 600, color: colors.dark, margin: "0 0 8px" }}>
            Environmental Science
          </p>
          <p style={{ fontFamily: typography.fontBody, fontSize: typography.sizeSm, color: colors.muted, margin: 0 }}>
            Study ecosystems, climate, and sustainability with access to the Great Lakes watershed.
          </p>
        </div>
      </Card>
    </div>
  ),
};

export const NoHover: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <Card hover={false}>
        <div style={{ padding: spacing[6] }}>
          <p style={{ fontFamily: typography.fontBody, margin: 0 }}>Static card — no hover effect</p>
        </div>
      </Card>
    </div>
  ),
};
