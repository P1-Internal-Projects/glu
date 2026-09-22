import type { Config } from "@puckeditor/core";

import { buttonBlock } from "./components/puck/button-block";
import { dividerBlock } from "./components/puck/divider-block";
import { headingBlock } from "./components/puck/heading-block";
import { imageBlock } from "./components/puck/image-block";
import { gridBlock } from "./components/puck/grid-block";
import { listBlock } from "./components/puck/list-block";
import { mediaFigureBlock } from "./components/puck/media-figure-block";
import { paragraphBlock } from "./components/puck/paragraph-block";
import { quoteBlock } from "./components/puck/quote-block";
import { puckRoot } from "./components/puck/root";
import { spacerBlock } from "./components/puck/spacer-block";
import { welcomeBlock } from "./components/puck/welcome-block";
import { dataListBlock } from "./components/puck/data-list-block";

import { pccConfigs } from "./components/pcc/puck-configs";

import { gluEventHeaderConfig } from "./components/puck/glu-event-header";
import { gluPersonProfileConfig } from "./components/puck/glu-person-profile";
import { gluListing } from "./components/puck/glu-listing";

import { gluHeroConfig } from "./components/puck/glu-hero";
import { gluPageHeroConfig } from "./components/puck/glu-page-hero";
import { gluStatsBarConfig } from "./components/puck/glu-stats-bar";
import { gluFeatureSectionConfig } from "./components/puck/glu-feature-section";
import { gluCardGridConfig } from "./components/puck/glu-card-grid";
import { gluTestimonialSliderConfig } from "./components/puck/glu-testimonial-slider";
import { gluCtaBannerConfig } from "./components/puck/glu-cta-banner";
import { gluAccordionConfig } from "./components/puck/glu-accordion";
import { gluFactGridConfig } from "./components/puck/glu-fact-grid";
import { gluTimelineConfig } from "./components/puck/glu-timeline";
import { gluSlideshowConfig } from "./components/puck/glu-slideshow";
import { gluArticleSectionConfig } from "./components/puck/glu-article-section";

// Off the shelf from components.p1.pantheon.io (`shadcn add @p1/team-grid`).
// The block's code is ours now; its look comes from app/p1-theme.css, which
// resolves the library's --p1-* tokens to GLU's, so it sits in the same
// palette and type as the blocks above without a line of it being edited.
import { TeamGridBlock } from "./components/puck/blocks/team-grid/team-grid.block";
import { withFieldAi } from "./lib/ai-hints";

export const config = {
  root: puckRoot,
  categories: {
    glu: {
      title: "Grand Lakes University",
      components: [
        "GLUHero",
        "GLUPageHero",
        "GLUStatsBar",
        "GLUFactGrid",
        "GLUFeatureSection",
        "GLUCardGrid",
        "GLUTestimonialSlider",
        "GLUCtaBanner",
        "GLUAccordion",
        "GLUTimeline",
        "GLUSlideshow",
        "GLUArticleSection",
      ],
    },
    p1Library: {
      title: "P1 Component Library",
      components: ["P1TeamGrid"],
    },
    pcc: {
      title: "Content Publisher",
      components: ["PCCArticleHeader", "PCCArticleBody"],
    },
    contentTypes: {
      title: "Content Types",
      components: ["GLUEventHeader", "GLUPersonProfile", "GLUListing"],
    },
    typography: {
      title: "Typography",
      components: ["HeadingBlock", "ParagraphBlock", "QuoteBlock", "ListBlock"],
    },
    media: {
      title: "Media",
      components: ["ImageBlock", "MediaFigureBlock"],
    },
    data: {
      title: "Data",
      components: ["GridBlock", "DataListBlock"],
    },
    layout: {
      title: "Layout",
      components: ["DividerBlock", "SpacerBlock"],
    },
    actions: {
      title: "Actions",
      components: ["ButtonBlock"],
    },
    pages: {
      title: "Page Sections",
      components: ["P1WelcomeBlock"],
    },
  },
  components: {
    GLUHero: gluHeroConfig,
    GLUPageHero: gluPageHeroConfig,
    GLUStatsBar: gluStatsBarConfig,
    GLUFactGrid: gluFactGridConfig,
    GLUFeatureSection: gluFeatureSectionConfig,
    GLUCardGrid: gluCardGridConfig,
    GLUTestimonialSlider: gluTestimonialSliderConfig,
    GLUCtaBanner: gluCtaBannerConfig,
    GLUAccordion: gluAccordionConfig,
    GLUTimeline: gluTimelineConfig,
    GLUSlideshow: gluSlideshowConfig,
    GLUArticleSection: gluArticleSectionConfig,
    P1TeamGrid: {
      ...TeamGridBlock,
      label: "P1 Team Grid",
      ai: {
        instructions:
          "Hand-typed team grid (leadership, a department) from the P1 component library. For counselors, use GLUListing bound to gluPeople instead — that one stays in sync with the counselor pages.",
      },
      fields: withFieldAi(TeamGridBlock.fields as Record<string, unknown>, {
        columns: { instructions: "3 for up to six people; 4 for a larger team." },
        shape: { instructions: "circle for headshots; rounded for environmental photos." },
        tone: { instructions: "white, or light directly after a white section." },
        members: {
          instructions: "Real people only, never invented names. Leave avatar blank when there is no photo — the block draws a placeholder.",
        },
      }) as typeof TeamGridBlock.fields,
    },
    ...pccConfigs,
    GLUEventHeader: gluEventHeaderConfig,
    GLUPersonProfile: gluPersonProfileConfig,
    GLUListing: gluListing,
    HeadingBlock: headingBlock,
    ParagraphBlock: paragraphBlock,
    ImageBlock: imageBlock,
    MediaFigureBlock: mediaFigureBlock,
    GridBlock: gridBlock,
    DataListBlock: dataListBlock,
    QuoteBlock: quoteBlock,
    ListBlock: listBlock,
    DividerBlock: dividerBlock,
    SpacerBlock: spacerBlock,
    ButtonBlock: buttonBlock,
    P1WelcomeBlock: welcomeBlock,
  },
} as unknown as Config;

export default config;
