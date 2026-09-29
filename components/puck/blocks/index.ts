import type { Config } from "@puckeditor/core";
import { AccordionBlock } from "./accordion/accordion.block";
import { AnnouncementBlock } from "./announcement/announcement.block";
import { ArticleHeaderBlock } from "./article-header/article-header.block";
import { ButtonBlock } from "./button/button.block";
import { CalloutBlock } from "./callout/callout.block";
import { CardGridBlock } from "./card-grid/card-grid.block";
import { ColumnsBlock } from "./columns/columns.block";
import { ComparisonTableBlock } from "./comparison-table/comparison-table.block";
import { ContainerBlock } from "./container/container.block";
import { CtaBannerBlock } from "./cta/cta.block";
import { DividerBlock } from "./divider/divider.block";
import { EmbedBlock } from "./embed/embed.block";
import { FaqBlock } from "./faq/faq.block";
import { FeatureMediaBlock } from "./feature-media/feature-media.block";
import { FeatureCardsBlock } from "./features/features.block";
import { FigureBlock } from "./figure/figure.block";
import { FooterBlock } from "./footer/footer.block";
import { GalleryBlock } from "./gallery/gallery.block";
import { HeaderBlock } from "./header/header.block";
import { HeadingBlock } from "./heading/heading.block";
import { HeroBlock } from "./hero/hero.block";
import { ImageBlock } from "./image/image.block";
import { LeadCaptureBlock } from "./lead-capture/lead-capture.block";
import { ListBlock } from "./list/list.block";
import { LogoCloudBlock } from "./logos/logos.block";
import { ParagraphBlock } from "./paragraph/paragraph.block";
import { PricingBlock } from "./pricing/pricing.block";
import { PullQuoteBlock } from "./pull-quote/pull-quote.block";
import { QuoteBlock } from "./quote/quote.block";
import { RichTextBlock } from "./rich-text/rich-text.block";
import { SpacerBlock } from "./spacer/spacer.block";
import { StatsBlock } from "./stats/stats.block";
import { StepsBlock } from "./steps/steps.block";
import { TabsBlock } from "./tabs/tabs.block";
import { TestimonialBlock } from "./testimonial/testimonial.block";
import { TimelineBlock } from "./timeline/timeline.block";

/**
 * Blocks installed from the P1 code registry land in this directory and are
 * registered below. `puck.config.tsx` spreads both exports, so it never needs
 * editing. Installing a block prints the exact lines to paste:
 *
 *   pnpm dlx shadcn@latest add @p1/pricing
 *
 *   import { PricingBlock } from "./pricing/pricing.block";
 *   P1Pricing: PricingBlock,  // in p1Blocks
 *
 *   // in p1Categories — create the entry if it does not exist yet:
 *   p1Convert: { title: "P1 Convert", components: ["P1Pricing"] },
 *   // or, if p1Convert already exists, add to its components array (no duplicate key):
 *   // p1Convert: { title: "P1 Convert", components: ["P1Pricing", "P1CTA"] },
 *
 * A block registered in no category still works but stays out of the editor's
 * drawer. Browse everything available in the P1 component catalog; to review our
 * changes to a block you have edited, add `--diff` to the install command.
 */
export const p1Blocks = {
  P1Accordion: AccordionBlock,
  P1Announcement: AnnouncementBlock,
  P1ArticleHeader: ArticleHeaderBlock,
  P1Button: ButtonBlock,
  P1Callout: CalloutBlock,
  P1CardGrid: CardGridBlock,
  P1Columns: ColumnsBlock,
  P1ComparisonTable: ComparisonTableBlock,
  P1Container: ContainerBlock,
  P1CtaBanner: CtaBannerBlock,
  P1Divider: DividerBlock,
  P1Embed: EmbedBlock,
  P1Faq: FaqBlock,
  P1FeatureMedia: FeatureMediaBlock,
  P1FeatureCards: FeatureCardsBlock,
  P1Figure: FigureBlock,
  P1Footer: FooterBlock,
  P1Gallery: GalleryBlock,
  P1Header: HeaderBlock,
  P1Heading: HeadingBlock,
  P1Hero: HeroBlock,
  P1Image: ImageBlock,
  P1LeadCapture: LeadCaptureBlock,
  P1List: ListBlock,
  P1LogoCloud: LogoCloudBlock,
  P1Paragraph: ParagraphBlock,
  P1Pricing: PricingBlock,
  P1PullQuote: PullQuoteBlock,
  P1Quote: QuoteBlock,
  P1RichText: RichTextBlock,
  P1Spacer: SpacerBlock,
  P1Stats: StatsBlock,
  P1Steps: StepsBlock,
  P1Tabs: TabsBlock,
  P1Testimonial: TestimonialBlock,
  P1Timeline: TimelineBlock,
} satisfies Config["components"];

// The drawer groups follow each block's own `meta.categories` from the registry.
export const p1Categories = {
  p1Attention: { title: "P1 Attention", components: ["P1Announcement", "P1Hero"] },
  p1Value: { title: "P1 Value", components: ["P1FeatureMedia", "P1FeatureCards", "P1Steps", "P1Timeline"] },
  p1Showcase: { title: "P1 Showcase", components: ["P1CardGrid", "P1Gallery", "P1Image"] },
  p1Trust: { title: "P1 Trust", components: ["P1LogoCloud", "P1Stats", "P1Testimonial"] },
  p1Convert: { title: "P1 Convert", components: ["P1ComparisonTable", "P1CtaBanner", "P1Faq", "P1LeadCapture", "P1Pricing"] },
  p1Editorial: { title: "P1 Editorial", components: ["P1ArticleHeader", "P1Callout", "P1Embed", "P1Figure", "P1PullQuote", "P1RichText"] },
  p1Content: { title: "P1 Content", components: ["P1Button", "P1Divider", "P1Heading", "P1List", "P1Paragraph", "P1Quote", "P1Spacer"] },
  p1Layout: { title: "P1 Layout", components: ["P1Accordion", "P1Columns", "P1Container", "P1Tabs"] },
  p1Global: { title: "P1 Global", components: ["P1Footer", "P1Header"] },
} satisfies NonNullable<Config["categories"]>;
