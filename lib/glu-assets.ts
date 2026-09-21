/**
 * Site-owned default imagery.
 *
 * The counselor silhouette is what a new counselor page shows before a
 * headshot is chosen, and what a listing card shows for a record whose photo
 * is blank. It is a brand asset, not a placeholder service: the profile block
 * and the people cards both read it from here so a change lands in both.
 *
 * It lives in the P1 media library (uploaded 2026-09-21 as
 * glu-counselor-silhouette.png), so an editor can pick it or replace it like
 * any other image; the copy in public/ is the same file for Storybook and for
 * a build that overrides the URL.
 */
export const COUNSELOR_SILHOUETTE_URL =
  process.env.NEXT_PUBLIC_COUNSELOR_SILHOUETTE_URL ||
  "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/65a4264b-30ab-4639-83f3-cda1365cce7b/dd6bc726-8cd3-4355-ab11-7638add735cf-glu-counselor-silhouette.png";

/** The same asset, served from this app, for builds and stories with no CDN. */
export const COUNSELOR_SILHOUETTE_LOCAL = "/images/counselor-silhouette.png";

/** The image to draw for a person record: their photo, or the silhouette. */
export function headshotOrSilhouette(photoUrl: string | undefined | null): string {
  return photoUrl && photoUrl.trim() ? photoUrl : COUNSELOR_SILHOUETTE_URL;
}
