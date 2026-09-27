import type { Meta, StoryObj } from "@storybook/nextjs";
import { headingBlock } from "../components/puck/heading-block";
import { paragraphBlock } from "../components/puck/paragraph-block";
import { quoteBlock } from "../components/puck/quote-block";
import { listBlock } from "../components/puck/list-block";

/**
 * The body-copy blocks — Heading, Paragraph, Quote and Text List — that go
 * inside a GLUArticleSection. They came with the starter kit and are styled
 * from the GLU tokens (design-system/components/body-copy.ts), so these
 * stories are the reference for how long-form copy should look.
 *
 * Placeholder copy only: these blocks carry no content of their own.
 */
const meta: Meta = { title: "Components/Body Copy", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

export const Headings: Story = {
  render: () => (
    <>
      {headingBlock.render({ title: "Heading level 2", level: "h2" })}
      {headingBlock.render({ title: "Heading level 3", level: "h3" })}
      {headingBlock.render({ title: "Heading level 4", level: "h4" })}
    </>
  ),
};

export const Paragraph: Story = {
  render: () =>
    paragraphBlock.render({
      id: "story-paragraph",
      text: "<p>Body copy in a paragraph, with <strong>bold text</strong>, <em>emphasis</em> and <a href=\"#\">a link</a>.</p><ul><li>A list inside rich text</li><li>Second item</li></ul>",
    }),
};

export const Quote: Story = {
  render: () => quoteBlock.render({ quote: "A short pull quote from the page.", attribution: "Name, Role" }),
};

export const TextList: Story = {
  render: () => (
    <>
      {listBlock.render({ ordered: false, items: "First item\nSecond item\n[A linked item](/apply)" })}
      {listBlock.render({ ordered: true, items: "First step\nSecond step\nThird step" })}
    </>
  ),
};
