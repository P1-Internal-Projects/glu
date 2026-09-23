import type { Meta, StoryObj } from "@storybook/nextjs";
import { Section } from "../design-system/components/section";
import { Container } from "../design-system/components/container";
import { H2, Body } from "../design-system/components/typography";

const meta: Meta<typeof Section> = {
  title: "Components/Section",
  component: Section,
};
export default meta;

type Story = StoryObj<typeof Section>;

const Content = () => (
  <Container>
    <H2 style={{ marginBottom: 16 }}>Section Heading</H2>
    <Body>This is body text inside a Section + Container layout showing consistent vertical rhythm and max-width constraints.</Body>
  </Container>
);

export const White: Story = { render: () => <Section background="white"><Content /></Section> };
export const OffWhite: Story = { render: () => <Section background="offWhite"><Content /></Section> };
// `navy` and `lightBlue` are the stored prop values, kept because published
// documents hold them. The colours are crimson and light rose, so the story
// names and the copy say that.
export const Crimson: Story = {
  render: () => (
    <Section background="navy">
      <Container>
        <H2 style={{ marginBottom: 16, color: "white" }}>Crimson Section</H2>
        <Body style={{ color: "rgba(255,255,255,0.85)" }}>White text on crimson for high-contrast sections. The prop value is still <code>navy</code>.</Body>
      </Container>
    </Section>
  ),
};
export const LightRose: Story = { render: () => <Section background="lightBlue"><Content /></Section> };
