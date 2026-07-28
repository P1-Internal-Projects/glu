import React from "react";
import {
  PCCArticleHeaderPuck,
  type PCCArticleHeaderPuckProps,
} from "./pcc-article-header";
import {
  PCCArticleBodyPuck,
  type PCCArticleBodyPuckProps,
} from "./pcc-article-body";

type PuckInternalProps = {
  editMode?: boolean;
  puck?: unknown;
  id?: string;
};

function filterPuckProps<T extends PuckInternalProps>(
  props: T
): Omit<T, keyof PuckInternalProps> {
  const { editMode, puck, id, ...rest } = props;
  return rest;
}

export type PCCProps = {
  PCCArticleHeader: PCCArticleHeaderPuckProps;
  PCCArticleBody: PCCArticleBodyPuckProps;
};

export const pccConfigs = {
  PCCArticleHeader: {
    label: "Article Header",
    ai: {
      instructions: "Use on Content Publisher (PCC) article pages. Providing a contentId auto-fills the heading, date, description, tags, and background image from the CMS article — you only need to set breadcrumbs manually. Without contentId, all fields must be filled manually.",
    },
    fields: {
      contentId: {
        type: "text" as const,
        label: "Content Publisher Article ID (optional — auto-fills title, date, tags)",
        ai: { instructions: "PCC article ID. When provided, heading, date, description, backgroundUrl, and tags are auto-populated from the CMS. Leave empty for manual content." },
      },
      breadcrumbs: {
        type: "array" as const,
        label: "Breadcrumbs",
        getItemSummary: (item: { label: string }) => item.label || "Crumb",
        arrayFields: {
          label: { type: "text" as const, contentEditable: true, ai: { required: true, instructions: "Breadcrumb label. Examples: 'Home', 'Newsroom'" } },
          url: { type: "text" as const, ai: { stream: false, instructions: "Relative path for this breadcrumb. Example: /en/newsroom" } },
        },
        defaultItemProps: {
          label: "Page",
          url: "/",
        },
      },
      heading: { type: "text" as const, label: "Headline", contentEditable: true, ai: { instructions: "Article headline. Auto-filled from PCC if contentId is set." } },
      description: { type: "textarea" as const, label: "Description", contentEditable: true, ai: { instructions: "Article subtitle or summary. Auto-filled from PCC if contentId is set." } },
      tags: {
        type: "array" as const,
        label: "Tags",
        getItemSummary: (item: { label: string }) => item.label || "Tag",
        arrayFields: {
          label: { type: "text" as const, contentEditable: true },
          variant: {
            type: "select" as const,
            options: [
              { label: "Filled", value: "filled" },
              { label: "Outline", value: "outline" },
            ],
          },
        },
        defaultItemProps: {
          label: "Tag",
          variant: "outline" as const,
        },
      },
      date: { type: "text" as const, label: "Date (auto-filled from article if empty)", ai: { instructions: "Publication date. Auto-filled from PCC if contentId is set. Format: '27 August 2025'" } },
      readTime: { type: "text" as const, label: "Read time (e.g. '3 min read')", ai: { instructions: "Read time estimate. Examples: '3 min read', '5 min read'" } },
      showShareButtons: {
        type: "radio" as const,
        label: "Show Share Buttons",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      shareUrl: { type: "text" as const, label: "Share URL (defaults to current page)", ai: { stream: false, instructions: "Absolute URL to share. Leave empty to use the current page URL." } },
      backgroundType: {
        type: "select" as const,
        label: "Background Type",
        options: [
          { label: "Image", value: "image" },
          { label: "Video", value: "video" },
          { label: "Solid color", value: "color" },
        ],
      },
      backgroundUrl: { type: "text" as const, label: "Background Image/Video URL (auto-filled from article)", ai: { stream: false, instructions: "Absolute URL to the header background image or video. Auto-filled from PCC article if contentId is set." } },
      backgroundColor: { type: "text" as const, label: "Background Color", ai: { stream: false, instructions: "Hex color fallback when backgroundType is 'color'. Default: '#545960'." } },
      height: {
        type: "select" as const,
        label: "Height",
        options: [
          { label: "Small (400px)", value: "small" },
          { label: "Medium (500px)", value: "medium" },
          { label: "Large (600px)", value: "large" },
        ],
      },
    },
    defaultProps: {
      contentId: "",
      breadcrumbs: [
        { label: "Home", url: "/" },
        { label: "Newsroom", url: "/newsroom" },
      ],
      heading: "",
      description: "",
      tags: [],
      date: "",
      readTime: "",
      showShareButtons: true,
      shareUrl: "",
      backgroundType: "image" as const,
      backgroundUrl: "",
      backgroundColor: "#545960",
      height: "large" as const,
    },
    render: (props: PCCArticleHeaderPuckProps & PuckInternalProps) => (
      <PCCArticleHeaderPuck {...filterPuckProps(props)} />
    ),
  },
  PCCArticleBody: {
    label: "Article Body",
    ai: {
      instructions: "Renders the rich text body of a Content Publisher article. Always pair with PCCArticleHeader on the same page. Use 'lg' maxWidth for standard articles. The contentId must match the one in the PCCArticleHeader.",
    },
    fields: {
      contentId: {
        type: "text" as const,
        label: "Content Publisher Article ID (optional)",
        ai: { instructions: "PCC article ID — must match the contentId in the paired PCCArticleHeader on this page." },
      },
      maxWidth: {
        type: "select" as const,
        label: "Content Width",
        options: [
          { label: "Small (576px)", value: "sm" },
          { label: "Medium (672px)", value: "md" },
          { label: "Large (896px) - Recommended", value: "lg" },
          { label: "Extra Large (1152px)", value: "xl" },
          { label: "Full Width", value: "full" },
        ],
      },
      bodyClassName: {
        type: "text" as const,
        label: "Body CSS Classes (optional)",
      },
      containerClassName: {
        type: "text" as const,
        label: "Container CSS Classes (optional)",
      },
    },
    defaultProps: {
      contentId: "",
      maxWidth: "lg" as const,
      bodyClassName: "",
      containerClassName: "",
    },
    render: (props: PCCArticleBodyPuckProps & PuckInternalProps) => (
      <PCCArticleBodyPuck {...filterPuckProps(props)} />
    ),
  },
};

export default pccConfigs;
