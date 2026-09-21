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
 * Resolve an image field to something renderable.
 *
 * Pass BOTH width and height. The editor's crop intent rides on the URL as
 * `fit`/`gravity` or `trim.*` params, and the transform only acts on them when
 * it has a target aspect ratio — ask for a width alone and a smart crop
 * silently does nothing.
 */
export function resolveMediaImage(
  value: MediaImageValue,
  transform: { width: number; height: number; format?: "auto" | "webp" | "jpeg" | "png" | "avif" },
): ResolvedImage {
  const media = getMediaProps(value ?? null, {
    mediaBaseUrl: MEDIA_BASE,
    transform: { format: "auto", ...transform },
  });

  if (media.src) return { src: media.src, alt: media.alt ?? "", legacy: false };

  // Rejected or absent. A plain string from before the field was converted is
  // still worth rendering; an object whose url the helper refused is not,
  // because that is the case the check exists for.
  const legacyUrl = typeof value === "string" ? value.trim() : "";
  return { src: legacyUrl, alt: "", legacy: Boolean(legacyUrl) };
}
