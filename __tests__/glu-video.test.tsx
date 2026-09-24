import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GLUVideoComponent, resolveVideoSource, type GLUVideoProps } from "../components/puck/glu-video";
import { SiteChrome } from "../components/site-chrome";

describe("resolveVideoSource", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ", 0],
    ["https://youtu.be/dQw4w9WgXcQ?t=90", "dQw4w9WgXcQ", 90],
    ["youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s", "dQw4w9WgXcQ", 90],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ", 0],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ?start=5", "dQw4w9WgXcQ", 5],
    ["https://m.youtube.com/live/dQw4w9WgXcQ", "dQw4w9WgXcQ", 0],
  ])("reads the YouTube id from %s", (input, id, start) => {
    expect(resolveVideoSource(input)).toEqual({ kind: "youtube", id, start });
  });

  it.each([
    ["gs://demo-videos/2026/p1 demo.mp4", "https://storage.googleapis.com/demo-videos/2026/p1%20demo.mp4"],
    [
      "https://console.cloud.google.com/storage/browser/_details/demo-videos/2026/p1%20demo.mp4?project=x",
      "https://storage.googleapis.com/demo-videos/2026/p1%20demo.mp4",
    ],
    ["s3://demo-videos/p1.mp4", "https://demo-videos.s3.amazonaws.com/p1.mp4"],
    ["s3://demo.videos/p1.mp4", "https://s3.amazonaws.com/demo.videos/p1.mp4"],
    [
      "https://us-west-2.console.aws.amazon.com/s3/object/demo-videos?region=us-west-2&bucketType=general&prefix=clips/p1.mp4",
      "https://demo-videos.s3.us-west-2.amazonaws.com/clips/p1.mp4",
    ],
    ["https://storage.googleapis.com/demo-videos/p1.mp4", "https://storage.googleapis.com/demo-videos/p1.mp4"],
  ])("turns %s into a playable URL", (input, src) => {
    expect(resolveVideoSource(input)).toEqual({ kind: "file", src });
  });

  it("rejects what can't play", () => {
    expect(resolveVideoSource("")).toEqual({ kind: "none" });
    expect(resolveVideoSource("http://example.com/a.mp4").kind).toBe("invalid");
    expect(resolveVideoSource("javascript:alert(1)").kind).toBe("invalid");
    expect(resolveVideoSource("https://www.youtube.com/watch?v=short").kind).toBe("invalid");
    expect(resolveVideoSource("https://console.cloud.google.com/storage/browser/demo-videos").kind).toBe("invalid");
  });
});

const BASE: GLUVideoProps = {
  source: "gs://demo-videos/p1.mp4",
  title: "P1 demo",
  size: "fullscreen",
  autoplay: true,
  muted: true,
  loop: false,
  controls: true,
  poster: null,
};
const html = (props: Partial<GLUVideoProps> & { puck?: { isEditing?: boolean } } = {}) =>
  renderToStaticMarkup(<GLUVideoComponent {...BASE} {...props} />);

describe("GLUVideo", () => {
  it("plays a file in a <video>, autoplaying muted", () => {
    const out = html();
    expect(out).toContain('<video src="https://storage.googleapis.com/demo-videos/p1.mp4"');
    expect(out).toMatch(/autoPlay=""/);
    expect(out).toContain('muted=""');
    expect(out).toContain("height:100dvh");
  });

  it("embeds YouTube with autoplay and mute set", () => {
    const out = html({ source: "https://youtu.be/dQw4w9WgXcQ", loop: true });
    expect(out).toContain("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?");
    expect(out).toContain("autoplay=1");
    expect(out).toContain("mute=1");
    expect(out).toContain("playlist=dQw4w9WgXcQ");
  });

  it("does not autoplay inside the editor", () => {
    expect(html({ puck: { isEditing: true } })).not.toMatch(/autoPlay=""/);
  });

  it("renders nothing for visitors without a link, and a prompt in the editor", () => {
    expect(html({ source: "" })).toBe("");
    expect(html({ source: "", puck: { isEditing: true } })).toContain("Paste a video link");
  });
});

describe("SiteChrome bare", () => {
  it("drops the nav, footer and skip link but keeps <main>", () => {
    const out = renderToStaticMarkup(
      <SiteChrome locale="en-US" bare>
        <p>video</p>
      </SiteChrome>,
    );
    expect(out).toContain('<main id="main-content"><p>video</p></main>');
    expect(out).not.toContain("<nav");
    expect(out).not.toContain("<footer");
    expect(out).not.toContain("Skip to main content");
  });
});

describe("GLUVideo inline", () => {
  it("runs the full width at 16:9, not held to the content column", () => {
    const out = renderToStaticMarkup(<GLUVideoComponent {...BASE} size="inline" />);
    expect(out).toMatch(/^<div style="width:100%;aspect-ratio:16 \/ 9/);
    expect(out).not.toContain("max-width");
  });
});
