/**
 * Site-owned default imagery.
 *
 * The counselor silhouette is what a new counselor page shows before a
 * headshot is chosen, and what a listing card shows for a record whose photo
 * is blank. It is a brand asset, not a placeholder service: the profile block
 * and the people cards both read it from here so a change lands in both.
 *
 * It lives in the P1 media library (uploaded 2026-09-21 as
 * glu-counselor-silhouette-transparent.png), so an editor can pick it or replace it like
 * any other image; the copy in public/ is the same file for Storybook and for
 * a build that overrides the URL.
 */
export const COUNSELOR_SILHOUETTE_URL =
  process.env.NEXT_PUBLIC_COUNSELOR_SILHOUETTE_URL ||
  "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/c5b087cc-ed91-4bee-8fa4-6f453d89572e/21449e76-9d0d-4564-a708-0716c51e42c9-glu-counselor-silhouette-transparent.png";

/** The same asset, served from this app, for builds and stories with no CDN. */
export const COUNSELOR_SILHOUETTE_LOCAL = "/images/counselor-silhouette.png";

/** The image to draw for a person record: their photo, or the silhouette. */
export function headshotOrSilhouette(photoUrl: string | undefined | null): string {
  return photoUrl && photoUrl.trim() ? photoUrl : COUNSELOR_SILHOUETTE_URL;
}

/**
 * The campus photograph used as the home page banner.
 *
 * Also the fallback hero for a program detail page, since the catalog carries
 * an image for only some programs. Uploaded to the media library as
 * glu-hero.jpeg.
 */
export const CAMPUS_BANNER_URL =
  "https://media.p1.pantheon.io/image/92f403e4-b910-4a1d-bb22-7e2c02edf5c3/assets/cc682a18-70f0-48a4-b831-6ebf199954b4/c11b0445-e2c1-4485-82dd-43f66d18d806-glu-hero.jpeg";
