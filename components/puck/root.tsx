import type { ReactNode } from "react";
import { PCCPageProvider } from "../pcc/pcc-page-context";

export const puckRoot = {
  ai: {
    instructions: "Page root. Standard GLU page order: GLUNav → GLUHero (or GLUPageHero for interior) → GLUStatsBar → GLUFeatureSection(s) → GLUCardGrid → GLUTestimonialSlider → GLUCtaBanner → GLUFooter. Set pccContentId only on Content Publisher article pages.",
  },
  fields: {
    title: {
      type: "text" as const,
      label: "Page Title",
      ai: { required: true, instructions: "Page title used for SEO and browser tab." },
    },
    pccContentId: {
      type: "text" as const,
      label: "Content Publisher Article ID",
      ai: { instructions: "PCC article ID — only set on Content Publisher article pages. Leave empty for standard pages." },
    },
  },
  defaultProps: {
    title: "",
    pccContentId: "",
  },
  render: (props: { children?: ReactNode; title?: string; pccContentId?: string }) => {
    const { children, pccContentId, title } = props;
    return (
      <PCCPageProvider contentId={pccContentId || null} articleTitle={title || null}>
        <div className="font-sans antialiased">{children}</div>
      </PCCPageProvider>
    );
  },
};
