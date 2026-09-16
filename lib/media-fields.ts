/**
 * Which block fields get the media picker instead of a plain text box.
 *
 * The p1-media plugin decides by field NAME. Its defaults cover `imageUrl`,
 * `backgroundImageUrl` and similar, but not `photoUrl` — so the counselor
 * headshot was the one image on this site an editor had to supply by pasting a
 * URL, with no library, no upload and no crop.
 *
 * `photoUrl` is added here rather than renamed to something the defaults
 * already match, because the prop name is also the datasource field the
 * Counselors listing binds to (`{{ item.photoUrl }}`) and the `gluPeople`
 * record shape. Renaming it would mean migrating published content in order to
 * fix an editor affordance.
 *
 * The picker in this mode stores a plain CDN URL string, which is what keeps
 * the listing binding and the existing headshots working. The richer
 * `p1-media` field type stores an object carrying alt text and dimensions
 * instead — a better field, but it would need those two consumers changed and
 * every current photo re-uploaded, since the render helpers only accept URLs on
 * the configured media origin.
 */

import { DEFAULT_MEDIA_PATTERNS } from "@pantheon-systems/p1-media";

/**
 * Passing `fieldNamePatterns` REPLACES the plugin's defaults rather than adding
 * to them, so they are spread back in. `imageAlt` is deliberately not matched:
 * it holds the alt text, not an image source.
 */
export const MEDIA_FIELD_PATTERNS: RegExp[] = [
  ...DEFAULT_MEDIA_PATTERNS,
  /^photo(?:Url)?$/,
  /PhotoUrl$/,
];

/** Whether a field of this name is rendered as the media picker. */
export function isMediaFieldName(name: string): boolean {
  const bare = name.split(".").pop() ?? name;
  return MEDIA_FIELD_PATTERNS.some((p) => p.test(bare));
}
