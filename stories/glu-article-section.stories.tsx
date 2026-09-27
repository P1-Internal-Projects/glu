import type { Meta, StoryObj } from "@storybook/nextjs";
import { GLUArticleSectionComponent } from "../components/puck/glu-article-section";
import { blockPaddingClass } from "../components/puck/block-padding";
import { paragraphBlock } from "../components/puck/paragraph-block";
import { headingBlock } from "../components/puck/heading-block";

/**
 * In Puck the `body` prop arrives as a component that draws whatever an editor
 * dropped into the slot. Storybook has no editor, so these stories pass a stand-in
 * that renders the same blocks the slot allows — enough to check the thing the
 * section exists for: that heading, copy and imagery share one column.
 */
const meta: Meta<typeof GLUArticleSectionComponent> = {
  title: "Components/GLUArticleSection",
  component: GLUArticleSectionComponent,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof GLUArticleSectionComponent>;

// The real Paragraph and Heading blocks, so the story shows what an editor gets.
const Copy = () => (
  <>
    {paragraphBlock.render({
      id: "story-p1",
      text: "<p>Montréal has been a university city for nearly two centuries, and the habits of one are everywhere: reading rooms that stay open late, a metro that assumes you are carrying a bag of books, and a rhythm to the academic year that the whole city keeps.</p>",
    })}
    {headingBlock.render({ title: "What changes for students", level: "h3" })}
    {paragraphBlock.render({
      id: "story-p2",
      text: "<p>The campus opens with a first selection of programs and grows from there. Advising, the application process and the standards applied to it are the ones every GLU campus uses.</p>",
    })}
  </>
);

const WithImage = () => (
  <>
    <Copy />
    <figure className={`m-0 ${blockPaddingClass}`}>
      <img
        src="https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg?width=1600&quality=85"
        alt=""
        className="block h-auto w-full rounded-lg"
      />
      <figcaption className="mt-3 text-sm text-neutral-600">
        The campus banner, standing in for a photograph of Montréal.
      </figcaption>
    </figure>
  </>
);

export const ReadingColumn: Story = {
  args: {
    eyebrow: "Why Montréal",
    heading: "A university city already",
    background: "white",
    width: "prose",
    body: Copy,
  },
};

/** The case the section exists for: copy and imagery on the same measure. */
export const WithImagery: Story = {
  args: { ...ReadingColumn.args, body: WithImage },
};

/** Wide widens the column for imagery. Body copy keeps its own readable measure. */
export const WideColumn: Story = {
  args: { ...ReadingColumn.args, width: "wide", body: WithImage },
};

export const Tinted: Story = {
  args: { ...ReadingColumn.args, background: "offWhite" },
};

/** No eyebrow or heading: body copy runs on from the section above. */
export const NoHeader: Story = {
  args: { ...ReadingColumn.args, eyebrow: "", heading: "" },
};
