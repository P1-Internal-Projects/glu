"use client";

import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { colors, typography, spacing, layout } from "../../design-system/tokens";
import { imageAi } from "../../lib/ai-hints";
import { resolveMediaImage, type MediaImageValue } from "../../lib/media-image";

export type GLUVideoProps = {
  source: string;
  title: string;
  size: "fullscreen" | "inline";
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  poster: MediaImageValue;
};

export type ResolvedVideo =
  | { kind: "youtube"; id: string; start: number }
  | { kind: "file"; src: string }
  | { kind: "none" }
  | { kind: "invalid"; reason: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"]);

/** `t=90`, `t=90s`, `t=1m30s`, `start=90` → seconds. */
function parseStart(value: string | null): number {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const m = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

/** Encodes each path segment of an object key, keeping the slashes. */
function encodeKey(key: string): string {
  return key
    .split("/")
    .map((part) => encodeURIComponent(decodeURIComponent(part)))
    .join("/");
}

function s3Url(bucket: string, key: string, region?: string | null): string {
  const host = region ? `s3.${region}.amazonaws.com` : "s3.amazonaws.com";
  // A dotted bucket name breaks the wildcard TLS certificate on the
  // virtual-hosted form, so it goes path-style instead.
  return bucket.includes(".") ? `https://${host}/${bucket}/${encodeKey(key)}` : `https://${bucket}.${host}/${encodeKey(key)}`;
}

/**
 * Turns whatever was pasted into something a player can load.
 *
 * Accepted: a YouTube link in any of its shapes; `gs://bucket/key` and
 * `s3://bucket/key`; the object page URL from the GCS or S3 console, which is
 * what people copy most often; and any other https URL, which is played as a
 * file as-is. A storage object has to be publicly readable (or the URL signed)
 * for a visitor's browser to fetch it.
 */
export function resolveVideoSource(input: string | undefined): ResolvedVideo {
  const raw = (input ?? "").trim();
  if (!raw) return { kind: "none" };

  const gs = raw.match(/^gs:\/\/([^/]+)\/(.+)$/);
  if (gs) return { kind: "file", src: `https://storage.googleapis.com/${gs[1]}/${encodeKey(gs[2] ?? "")}` };

  const s3 = raw.match(/^s3:\/\/([^/]+)\/(.+)$/);
  if (s3) return { kind: "file", src: s3Url(s3[1] ?? "", s3[2] ?? "") };

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { kind: "invalid", reason: "That isn't a link or storage path." };
  }
  if (url.protocol !== "https:") return { kind: "invalid", reason: "Use an https link — the site is served over https, so browsers block anything else." };

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be" || YOUTUBE_HOSTS.has(host)) {
    const parts = url.pathname.split("/").filter(Boolean);
    const id =
      host === "youtu.be"
        ? parts[0]
        : parts[0] === "watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live", "v"].includes(parts[0] ?? "")
            ? parts[1]
            : null;
    if (!id || !YOUTUBE_ID.test(id)) return { kind: "invalid", reason: "Couldn't find a video ID in that YouTube link." };
    return { kind: "youtube", id, start: parseStart(url.searchParams.get("t") ?? url.searchParams.get("start")) };
  }

  // GCS console: console.cloud.google.com/storage/browser/_details/<bucket>/<key>
  if (host === "console.cloud.google.com") {
    const m = url.pathname.match(/^\/storage\/browser\/_details\/([^/]+)\/(.+)$/);
    if (!m) return { kind: "invalid", reason: "Open the file itself in the Cloud Storage console and copy that page's link." };
    return { kind: "file", src: `https://storage.googleapis.com/${m[1]}/${encodeKey(m[2] ?? "")}` };
  }

  // S3 console: <region>.console.aws.amazon.com/s3/object/<bucket>?region=…&prefix=<key>
  if (host === "console.aws.amazon.com" || host.endsWith(".console.aws.amazon.com")) {
    const m = url.pathname.match(/^\/s3\/object\/([^/]+)/);
    const key = url.searchParams.get("prefix");
    if (!m || !key) return { kind: "invalid", reason: "Open the file itself in the S3 console and copy that page's link." };
    return { kind: "file", src: s3Url(m[1] ?? "", key, url.searchParams.get("region")) };
  }

  return { kind: "file", src: url.toString() };
}

function youtubeEmbed(id: string, start: number, opts: Pick<GLUVideoProps, "autoplay" | "muted" | "loop" | "controls">): string {
  const q = new URLSearchParams({
    rel: "0",
    playsinline: "1",
    autoplay: opts.autoplay ? "1" : "0",
    mute: opts.muted ? "1" : "0",
    controls: opts.controls ? "1" : "0",
  });
  // YouTube only loops a single video when it is also its own playlist.
  if (opts.loop) {
    q.set("loop", "1");
    q.set("playlist", id);
  }
  if (start) q.set("start", String(start));
  return `https://www.youtube-nocookie.com/embed/${id}?${q}`;
}

export function GLUVideoComponent({
  source,
  title,
  size = "fullscreen",
  autoplay,
  muted,
  loop,
  controls,
  poster,
  puck,
}: GLUVideoProps & { puck?: { isEditing?: boolean } }) {
  const isEditing = Boolean(puck?.isEditing);
  const video = resolveVideoSource(source);
  // Don't start playing (with sound, possibly) every time the editor redraws.
  const play = autoplay && !isEditing;
  const label = title || "Video";
  const posterSrc = resolveMediaImage(poster, { width: 1920, height: 1080 }).src || undefined;

  const frame: React.CSSProperties =
    size === "fullscreen"
      ? { width: "100%", height: "100dvh", backgroundColor: "#000", position: "relative", overflow: "hidden" }
      : { width: "100%", aspectRatio: "16 / 9", backgroundColor: "#000", position: "relative", overflow: "hidden" };

  let body: React.ReactNode;
  if (video.kind === "youtube") {
    body = (
      <iframe
        key={`${video.id}-${play}-${muted}-${loop}-${controls}`}
        src={youtubeEmbed(video.id, video.start, { autoplay: play, muted, loop, controls })}
        title={label}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
      />
    );
  } else if (video.kind === "file") {
    body = (
      <video
        key={video.src}
        src={video.src}
        poster={posterSrc}
        aria-label={label}
        autoPlay={play}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        preload="auto"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
      />
    );
  } else {
    // Nothing to play. Visitors get nothing; the editor gets a prompt.
    if (!isEditing) return null;
    body = (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing[2],
          padding: spacing[6],
          textAlign: "center" as const,
          color: colors.white,
          fontFamily: typography.fontBody,
        }}
      >
        <strong style={{ fontSize: typography.sizeLg }}>{video.kind === "none" ? "Paste a video link" : "Can't play this link"}</strong>
        <span style={{ fontSize: typography.sizeSm, opacity: 0.8, maxWidth: 520 }}>
          {video.kind === "invalid"
            ? video.reason
            : "A YouTube link, a gs:// or s3:// path, a Cloud Storage or S3 console link, or any https link to an .mp4 or .webm file."}
        </span>
      </div>
    );
  }

  if (size === "fullscreen") return <div style={frame}>{body}</div>;

  return (
    <div style={{ maxWidth: layout.containerMax, margin: "0 auto", padding: `${spacing[8]} ${spacing[4]}` }}>
      <div style={frame}>{body}</div>
    </div>
  );
}

const yesNo = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export const gluVideoConfig = {
  label: "GLU Video",
  ai: {
    instructions:
      "A single video. Use size fullscreen on a page whose Page Layout is Full-screen, to show only the video; inline to put a video within a normal page.",
  },
  fields: {
    source: {
      type: "text",
      label: "Video link or storage path",
      ai: {
        stream: false,
        required: true,
        instructions:
          "A YouTube link, a gs://bucket/file.mp4 or s3://bucket/file.mp4 path, or an https link to a video file. Only use a link the user supplied — never invent one.",
      },
    },
    title: {
      type: "text",
      label: "Title (for screen readers)",
      ai: { instructions: "What the video is, e.g. 'Product demo: publishing a page'." },
    },
    size: {
      type: "radio",
      label: "Size",
      options: [
        { label: "Fill the screen", value: "fullscreen" },
        { label: "Inline (16:9)", value: "inline" },
      ],
      ai: { instructions: "fullscreen on a Full-screen page layout; inline on a standard page." },
    },
    autoplay: {
      type: "radio",
      label: "Autoplay",
      options: yesNo,
      ai: { instructions: "true for a full-screen demo page. Autoplay is off inside the editor either way." },
    },
    muted: {
      type: "radio",
      label: "Start muted",
      options: yesNo,
      ai: { instructions: "Browsers only autoplay muted video. Set false only if autoplay is off, or the viewer will click play anyway." },
    },
    loop: { type: "radio", label: "Loop", options: yesNo, ai: { instructions: "false unless asked to loop." } },
    controls: { type: "radio", label: "Show controls", options: yesNo, ai: { instructions: "true, so the viewer can pause, unmute and scrub." } },
    // `as any` because the plugin registers this field type at runtime, so it
    // is not in Puck's built-in Field union.
    poster: {
      type: "p1-media",
      label: "Poster image (optional, video files only)",
      ai: imageAi("Still frame shown before a video file starts. Not used for YouTube, which draws its own."),
    } as any,
  },
  defaultProps: {
    source: "",
    title: "",
    size: "fullscreen",
    autoplay: true,
    muted: true,
    loop: false,
    controls: true,
    poster: null,
  },
  render: GLUVideoComponent,
} as ComponentConfig<GLUVideoProps>;
