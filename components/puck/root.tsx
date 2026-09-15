import type { ReactNode } from "react";
import {
  createSeoRootFields,
  DEFAULT_EDITOR_ROOT_TITLE,
} from "@pantheon-systems/puck-css/seo";
import { PCCPageProvider } from "../pcc/pcc-page-context";
import { SiteChrome } from "../site-chrome";

/**
 * The root config: this site's own fields, plus the page-metadata fields.
 *
 * Title and description are GLU's to change — they are the site's content. The
 * `_meta` field set is not composed here by hand: it writes a stored shape the
 * head tags read back, so it comes from the package that owns that shape and
 * versions with it. (The stored keys — ogTitle, ogDescription, ogType, ogImage,
 * ogLocale, twitterCard, twitterTitle, twitterImage — are unchanged from the
 * hand-written set GLU carried through starter kit 0.12, so existing page
 * metadata is read back as-is.)
 */

const buildFields = (rootProps?: Record<string, unknown>) => ({
  title: {
    type: "text" as const,
    label: "Page Title",
    ai: { required: true, instructions: "Page title used for SEO and browser tab." },
  },
  description: { type: "textarea" as const, label: "Page Description" },
  // GLU-specific: Content Publisher article pages bind their body through this id.
  pccContentId: {
    type: "text" as const,
    label: "Content Publisher Article ID",
    ai: {
      instructions:
        "PCC article ID — only set on Content Publisher article pages. Leave empty for standard pages.",
    },
  },
  ...createSeoRootFields(rootProps),
});

export const puckRoot = {
  ai: {
    instructions:
      "Page root. The site nav and footer render automatically and are NOT blocks — never add them. Page body order: GLUHero (or GLUPageHero for interior) → GLUStatsBar → GLUFeatureSection(s) → GLUCardGrid → GLUTestimonialSlider → GLUCtaBanner. Set pccContentId only on Content Publisher article pages.",
  },
  fields: buildFields(),
  /**
   * Passing the live root props is what lets the metadata fields show what an
   * empty one will inherit — the fields slice subscribes to the root node, so
   * changing the title re-resolves the placeholders.
   */
  resolveFields: (data: { props?: Record<string, unknown> }) =>
    buildFields(data.props ?? {}),
  defaultProps: {
    title: DEFAULT_EDITOR_ROOT_TITLE,
    pccContentId: "",
  },
  /**
   * The nav and footer are rendered here, not placed on pages.
   *
   * That is what makes them fixed: they hold no slot in the content array, so
   * the editor has nothing to select, move, delete or reword, and every page in
   * every language draws the same chrome from lib/site-chrome.ts. It also means
   * the editor canvas shows the real page rather than a bare content column.
   *
   * `locale` is not an editable field. It is passed in by the published route
   * and otherwise derived from the path, so it never becomes something an
   * author can set to the wrong value.
   */
  render: (props: {
    children?: ReactNode;
    title?: string;
    pccContentId?: string;
    locale?: string;
  }) => {
    const { children, pccContentId, title, locale } = props;
    return (
      <PCCPageProvider contentId={pccContentId || null} articleTitle={title || null}>
        <div className="font-sans antialiased">
          <SiteChrome locale={locale}>{children}</SiteChrome>
        </div>
      </PCCPageProvider>
    );
  },
};
