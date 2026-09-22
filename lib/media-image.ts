/**
 * Resolving an image field that may hold either shape.
 *
 * The p1-media plugin offers two kinds of image field. A `text` field whose
 * name matches one of MEDIA_FIELD_PATTERNS gets a library picker but stores a
 * bare URL string, and its crop toggle is limited to "Fit in" and "Smart
 * crop". The `p1-media` field type stores an object — asset, version, alt, and
 * the crop the editor drew — and is the only one that offers "Custom…" and the
 * crop dialog.
 *
 * Moving a field from the first to the second does not migrate what is already
 * published. Those documents still hold strings, and `getMediaProps` rejects a
 * URL that is not https on the media CDN origin: it fails closed with an empty
 * src rather than passing an arbitrary origin through to a render. That check
 * is worth keeping — document content is editable by anyone who can edit the
 * page — but on this site it would have blanked eleven cards across
 * school-of-ai and visit/visitor-guide, whose images are Unsplash URLs from
 * before the media library existed.
 *
 * So this resolves the rich path first and falls back to the legacy string.
 * The fallback is not a new exposure: every other GLU component still renders
 * a stored URL straight into next/image, and Next's own remotePatterns
 * allowlist in next.config.mjs is what bounds which origins can load at all.
 * It is a migration shim all the same. Once the published cards point at
 * library assets, the fallback and this module can go.
 */

import { getMediaProps, type MediaFieldValue } from "@pantheon-systems/p1-media";

/**
 * What a converted image field can hold: a media value, or a legacy URL.
 * `MediaFieldValue` is already `string | MediaValue`; the nullable arms are
 * for a card an editor has cleared or never filled.
 */
export type MediaImageValue = MediaFieldValue | null | undefined;

export interface ResolvedImage {
  /** Empty when there is no usable image, so callers can skip the markup. */
  src: string;
  /** From the media value's metadata. Empty for a legacy string. */
  alt: string;
  /** True when the URL came from the legacy fallback rather than the helper. */
  legacy: boolean;
}

/**
 * The CDN origin that serves media.
 *
 * The default is spelled out rather than left to the package. `getMediaProps`
 * reads `options.mediaBaseUrl` with no fallback of its own and `validateSrc`
 * returns "" the moment it is undefined — so omitting it does not mean
 * "production", it means every rich value renders nothing. This repo sets no
 * NEXT_PUBLIC_MEDIA_BASE_URL, so without this constant the converted field
 * would look broken for exactly the images it was meant to improve.
 * `createMediaFigureBlock` applies the same production default internally; the
 * package does not export it, hence the literal.
 */
const PRODUCTION_MEDIA_BASE = "https://media.p1.pantheon.io";
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || PRODUCTION_MEDIA_BASE;

/**
 * Whether the request has to carry a height for the editor's crop to happen.
 *
 * Only a smart crop does: `fit=cover` means "fill this box and discard the
 * rest", so without a height there is no box and `gravity=auto` has nothing to
 * aim at — the CDN returns the whole frame uncropped.
 *
 * Every other mode already knows its own shape, and a height can only shrink
 * it. "Fit in" (`fit=scale-down`) returns the source ratio either way, and a
 * rectangle from the crop dialog (`trim.*`) is the framing already. Measured
 * against the home page asset, a 2546x1664 original:
 *
 *   scale-down, width 2560 + height 800  ->  1224 x 800   (ratio 1.53)
 *   scale-down, width 2560 alone         ->  2546 x 1664  (ratio 1.53)
 *   trim 2546x1150, width 2560 + h 800   ->  1771 x 800
 *   trim 2546x1150, width 2560 alone     ->  2546 x 1150
 *
 * The ratio is unchanged in each pair, so callers drawing with `object-fit:
 * cover` frame it identically — they just stop upscaling to do it. A trim
 * rectangle wins over `fit` on the same URL, because the rectangle is the more
 * specific instruction.
 */
function needsTargetRatio(value: MediaImageValue): boolean {
  const url = typeof value === "string" ? value : value?.url;
  if (typeof url !== "string") return false;
  if (url.includes("trim.")) return false;
  return /[?&]fit=cover\b/.test(url);
}

/**
 * Asked of the CDN unless a caller says otherwise.
 *
 * The CDN encodes at quality 100 when the param is absent, and next/image
 * re-encodes everything it serves at its own default of 75 — so the untuned
 * request spends a near-lossless download to produce a lossy render. Measured
 * on the home page asset at width 2560: 4873 KB unspecified, 886 KB at 85,
 * 725 KB at 80. 85 is chosen to sit clear of the 75 the optimizer applies
 * afterwards, so the second pass is what sets the visible quality.
 */
const DEFAULT_QUALITY = 85;

/**
 * Resolve an image field to something renderable.
 *
 * Pass BOTH width and height. The width is the real cap on what is fetched;
 * the height reaches the CDN only for a smart crop, which cannot work without
 * it — see `needsTargetRatio` for why sending it the rest of the time costs
 * resolution and buys no framing.
 *
 * Size the width for the widest the image is ever displayed, including on a
 * retina screen, and remember the stored asset is its own ceiling: asking past
 * it upscales rather than sharpens.
 */
export function resolveMediaImage(
  value: MediaImageValue,
  transform: {
    width: number;
    height: number;
    format?: "auto" | "webp" | "jpeg" | "png" | "avif";
    quality?: number;
  },
): ResolvedImage {
  const { height, ...widthOnly } = transform;
  const sized = needsTargetRatio(value) ? transform : widthOnly;

  const media = getMediaProps(value ?? null, {
    mediaBaseUrl: MEDIA_BASE,
    transform: { format: "auto", quality: DEFAULT_QUALITY, ...sized },
  });

  if (media.src) return { src: media.src, alt: media.alt ?? "", legacy: false };

  // Rejected or absent. A plain string from before the field was converted is
  // still worth rendering; an object whose url the helper refused is not,
  // because that is the case the check exists for.
  const legacyUrl = typeof value === "string" ? value.trim() : "";
  return { src: legacyUrl, alt: "", legacy: Boolean(legacyUrl) };
}
