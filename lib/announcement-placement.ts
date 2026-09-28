/**
 * Enforces GLU's placement rule for the Announcement Banner on the surface a
 * visitor sees: it is a site-notice strip (news, alert, weather, emergency)
 * that only ever belongs as the very first block on a page, above the hero,
 * and at most once per page.
 *
 * The chatbot and editors sometimes place one mid-page to promote a campaign
 * — that is GLUCtaBanner's job — or add a second one. Rather than rejecting
 * that content outright, the published page silently drops any
 * GLUAnnouncementBanner that is not at index 0, so a visitor never sees a
 * misplaced or duplicated banner. This is deliberately NOT applied inside the
 * editor: an author needs to see what they built, including a misplaced
 * block, in order to fix it (see components/puck/glu-announcement-banner.tsx
 * for the in-editor visual warning).
 */

const ANNOUNCEMENT_BANNER_TYPE = "GLUAnnouncementBanner";

/** The minimal shape this needs from a Puck content block. */
export interface PlacementBlock {
  type?: string;
  [key: string]: unknown;
}

/**
 * Returns `content` with every GLUAnnouncementBanner removed except one at
 * index 0. Order and every other block are left untouched. A banner already
 * at index 0 is kept; one anywhere else — even if it would have been the
 * first *remaining* announcement banner — is dropped, because "first" means
 * "first block on the page," not "first announcement banner."
 */
export function filterMisplacedAnnouncementBanners<T extends PlacementBlock>(
  content: T[] | undefined | null,
): T[] {
  if (!content || content.length === 0) return content ?? [];
  return content.filter((block, index) => {
    if (block?.type !== ANNOUNCEMENT_BANNER_TYPE) return true;
    return index === 0;
  });
}
