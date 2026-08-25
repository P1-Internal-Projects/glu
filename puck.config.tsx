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

import { ctEventConfig } from "./components/puck/ct-event";
import { ctCounselorConfig } from "./components/puck/ct-counselor";
import { ctAccoladeConfig } from "./components/puck/ct-accolade";
import { eventListingConfig } from "./components/puck/event-listing";
import { counselorListingConfig } from "./components/puck/counselor-listing";
import { accoladeListingConfig } from "./components/puck/accolade-listing";

import { gluNavConfig } from "./components/puck/glu-nav";
import { gluHeroConfig } from "./components/puck/glu-hero";
import { gluPageHeroConfig } from "./components/puck/glu-page-hero";
import { gluStatsBarConfig } from "./components/puck/glu-stats-bar";
import { gluFeatureSectionConfig } from "./components/puck/glu-feature-section";
import { gluCardGridConfig } from "./components/puck/glu-card-grid";
import { gluTestimonialSliderConfig } from "./components/puck/glu-testimonial-slider";
import { gluCtaBannerConfig } from "./components/puck/glu-cta-banner";
import { gluAccordionConfig } from "./components/puck/glu-accordion";
import { gluFooterConfig } from "./components/puck/glu-footer";
import { gluTimelineConfig } from "./components/puck/glu-timeline";
import { gluSlideshowConfig } from "./components/puck/glu-slideshow";

export const config = {
  root: puckRoot,
  categories: {
    glu: {
      title: "Grand Lakes University",
      components: [
        "GLUNav",
        "GLUHero",
        "GLUPageHero",
        "GLUStatsBar",
        "GLUFeatureSection",
        "GLUCardGrid",
        "GLUTestimonialSlider",
        "GLUCtaBanner",
        "GLUAccordion",
        "GLUTimeline",
        "GLUSlideshow",
        "GLUFooter",
      ],
    },
    pcc: {
      title: "Content Publisher",
      components: ["PCCArticleHeader", "PCCArticleBody"],
    },
    contentTypes: {
      title: "Content Types",
      components: ["CtEvent", "CtCounselor", "CtAccolade", "EventListing", "CounselorListing", "AccoladeListing"],
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
    GLUNav: gluNavConfig,
    GLUHero: gluHeroConfig,
    GLUPageHero: gluPageHeroConfig,
    GLUStatsBar: gluStatsBarConfig,
    GLUFeatureSection: gluFeatureSectionConfig,
    GLUCardGrid: gluCardGridConfig,
    GLUTestimonialSlider: gluTestimonialSliderConfig,
    GLUCtaBanner: gluCtaBannerConfig,
    GLUAccordion: gluAccordionConfig,
    GLUFooter: gluFooterConfig,
    GLUTimeline: gluTimelineConfig,
    GLUSlideshow: gluSlideshowConfig,
    ...pccConfigs,
    CtEvent: ctEventConfig,
    CtCounselor: ctCounselorConfig,
    CtAccolade: ctAccoladeConfig,
    EventListing: eventListingConfig,
    CounselorListing: counselorListingConfig,
    AccoladeListing: accoladeListingConfig,
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
