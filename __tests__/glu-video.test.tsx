import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GLUVideoComponent, gluVideoConfig, resolveVideoSource, safeImageHref, type GLUVideoProps } from "../components/puck/glu-video";
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

describe("GLUVideo image mode", () => {
  const IMG = "https://images.example.com/campus.jpg";

  it("spans the full width, pinned to the top, by default", () => {
    const out = html({ mediaType: "image", image: IMG, title: "The quad at dusk" });
    expect(out).toContain(`src="${IMG}"`);
    expect(out).toContain('alt="The quad at dusk"');
    // Natural height from the top edge; the frame's overflow:hidden crops the bottom.
    expect(out).toContain("position:absolute;display:block;top:0;left:0;width:100%;height:auto");
    expect(out).not.toContain("object-fit");
    expect(out).toContain("height:100dvh");
    expect(out).toContain("overflow:hidden");
    expect(out).not.toContain("<video");
    expect(out).not.toContain("<iframe");
  });

  it("puts white behind a width-fitted image and black behind everything else", () => {
    expect(html({ mediaType: "image", image: IMG })).toContain("background-color:#ffffff");
    expect(html({ mediaType: "image", image: IMG, imageFit: "contain" })).toContain("background-color:#000");
    expect(html()).toContain("background-color:#000");
  });

  it("fills and crops all round when fit is cover", () => {
    expect(html({ mediaType: "image", image: IMG, imageFit: "cover" })).toContain("object-fit:cover");
  });

  it("shows the whole image when fit is contain", () => {
    expect(html({ mediaType: "image", image: IMG, imageFit: "contain" })).toContain("object-fit:contain");
  });

  it("runs 16:9 inline like a video", () => {
    expect(html({ mediaType: "image", image: IMG, size: "inline" })).toContain('<div style="width:100%;aspect-ratio:16 / 9');
  });

  it("renders nothing for visitors without an image, and a prompt in the editor", () => {
    expect(html({ mediaType: "image", image: null })).toBe("");
    expect(html({ mediaType: "image", image: null, puck: { isEditing: true } })).toContain("Choose an image");
  });

  it("keeps blocks saved before the option as video", () => {
    const { mediaType: _omit, ...legacy } = { ...BASE, mediaType: undefined };
    expect(renderToStaticMarkup(<GLUVideoComponent {...legacy} />)).toContain("<video");
  });

  it("uses a pasted image URL instead of the library pick", () => {
    const out = html({ mediaType: "image", image: IMG, imageLink: "https://cdn.example.org/slide-1.png", title: "Slide one" });
    expect(out).toContain('src="https://cdn.example.org/slide-1.png"');
    expect(out).not.toContain(IMG);
    expect(out).toContain('alt="Slide one"');
  });

  it("reads storage paths for images the way it does for video", () => {
    expect(html({ mediaType: "image", imageLink: "gs://demo-assets/stills/quad at dusk.jpg" })).toContain(
      'src="https://storage.googleapis.com/demo-assets/stills/quad%20at%20dusk.jpg"',
    );
  });

  it("explains an image link it can't show, in the editor only", () => {
    expect(html({ mediaType: "image", imageLink: "http://example.com/a.jpg" })).toBe("");
    expect(html({ mediaType: "image", imageLink: "http://example.com/a.jpg", puck: { isEditing: true } })).toContain("Can&#x27;t show this image link");
    expect(html({ mediaType: "image", imageLink: "https://youtu.be/dQw4w9WgXcQ", puck: { isEditing: true } })).toContain("That&#x27;s a video link");
  });

  it("offers only the fields for what the block shows", () => {
    const fields = gluVideoConfig.fields as Record<string, unknown>;
    const resolve = (gluVideoConfig as unknown as {
      resolveFields: (d: { props: Partial<GLUVideoProps> }, p: { fields: Record<string, unknown> }) => Record<string, unknown>;
    }).resolveFields;
    const forImage = Object.keys(resolve({ props: { mediaType: "image" } }, { fields }));
    const forVideo = Object.keys(resolve({ props: { mediaType: "video" } }, { fields }));
    expect(forImage).toEqual(["mediaType", "title", "size", "image", "imageLink", "imageFit", "imageHref", "imageNewTab"]);
    expect(forVideo).toEqual(["mediaType", "source", "title", "size", "autoplay", "muted", "loop", "controls", "poster"]);
  });
});

describe("GLUVideo linked image", () => {
  const IMG = "https://images.example.com/campus.jpg";

  it("wraps the image in a link when one is set", () => {
    const out = html({ mediaType: "image", image: IMG, title: "Apply now", imageHref: "/apply" });
    expect(out).toMatch(/<a href="\/apply" style="position:absolute;inset:0;display:block"><img /);
    expect(out).not.toContain("target=");
  });

  it("opens in a new tab safely when asked", () => {
    const out = html({ mediaType: "image", image: IMG, imageHref: "https://pantheon.io", imageNewTab: true });
    expect(out).toContain('href="https://pantheon.io/"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("is not a link when the field is blank or unsafe", () => {
    expect(html({ mediaType: "image", image: IMG })).not.toContain("<a ");
    expect(html({ mediaType: "image", image: IMG, imageHref: "javascript:alert(1)" })).not.toContain("<a ");
  });

  it.each([
    ["/apply", "/apply"],
    ["#programs", "#programs"],
    ["www.grandlakes.edu/visit", "https://www.grandlakes.edu/visit"],
    ["mailto:admissions@grandlakes.edu", "mailto:admissions@grandlakes.edu"],
    ["javascript:alert(1)", null],
    ["data:text/html,hi", null],
    ["//evil.example", null],
    ["", null],
  ])("safeImageHref(%s)", (input, expected) => {
    expect(safeImageHref(input)).toBe(expected);
  });
});
