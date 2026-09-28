"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { ComponentConfig } from "@puckeditor/core";
import { colors, typography, spacing, radii } from "../../design-system/tokens";
import { imageAi } from "../../lib/ai-hints";
import { CAMPUS_BANNER_URL } from "../../lib/glu-assets";
import { resolveMediaImage, type MediaImageValue } from "../../lib/media-image";

export type GLUSlideshowProps = {
  slides: {
    /**
     * A media-library value, or a bare URL from before this field was rich.
     * See lib/media-image.ts for why both shapes have to keep working.
     */
    imageUrl: MediaImageValue;
    heading: string;
    subtext: string;
  }[];
  autoPlay: boolean;
  interval: number;
  height: "md" | "lg" | "xl";
};

const HEIGHT_MAP = { md: "420px", lg: "560px", xl: "700px" };

/**
 * One slide's image, cropped to the band the slideshow actually occupies.
 *
 * The transform is asked for a width AND a height on purpose. The editor's
 * crop rides on the stored URL as fit/gravity or trim params, and the CDN
 * ignores all of them unless it is given a target aspect ratio — so requesting
 * a width alone, or letting the image component size it, makes "Smart crop"
 * and the crop dialog do nothing visible. The height comes from the block's
 * own setting, so a slideshow set to `xl` crops less aggressively than one set
 * to `md`, which is what someone drawing a crop in the editor expects.
 */
function SlideImage({
  image,
  alt,
  height,
  priority,
}: {
  image: MediaImageValue;
  alt: string;
  height: GLUSlideshowProps["height"];
  priority: boolean;
}) {
  const resolved = resolveMediaImage(image, {
    width: 1920,
    height: Number.parseInt(HEIGHT_MAP[height] ?? HEIGHT_MAP.lg, 10),
  });
  if (!resolved.src) return null;
  return (
    <Image
      src={resolved.src}
      // `alt` is the slide's heading, which is a React element in the editor
      // when the Heading field is contentEditable — an `alt` attribute can
      // only take a string.
      alt={resolved.alt || (typeof alt === "string" ? alt : "")}
      fill
      style={{ objectFit: "cover" }}
      sizes="100vw"
      priority={priority}
    />
  );
}

export function GLUSlideshowComponent({ slides, autoPlay, interval, height }: GLUSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (transitioning || index === current) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setTransitioning(false);
      }, 400);
    },
    [current, transitioning]
  );

  const prev = () => goTo((current - 1 + count) % count);
  const next = useCallback(() => goTo((current + 1) % count), [current, count, goTo]);

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    timerRef.current = setTimeout(next, interval * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoPlay, current, interval, next, count]);

  if (!slides.length) return <div />;

  const slide = slides[current];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: HEIGHT_MAP[height] ?? HEIGHT_MAP.lg,
        overflow: "hidden",
        backgroundColor: colors.dark,
      }}
      onMouseEnter={() => { if (timerRef.current) clearTimeout(timerRef.current); }}
      onMouseLeave={() => {
        if (autoPlay && count > 1) timerRef.current = setTimeout(next, interval * 1000);
      }}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== current}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? (transitioning ? 0 : 1) : 0,
            transition: "opacity 0.6s ease",
            pointerEvents: i === current ? "auto" : "none",
          }}
        >
          <SlideImage image={s.imageUrl} alt={s.heading} height={height} priority={i === 0} />
          {/* Dark gradient for legibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(26,5,5,0.85) 0%, rgba(26,5,5,0.4) 50%, rgba(26,5,5,0.1) 100%)",
            }}
          />
        </div>
      ))}

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: `${spacing[8]} ${spacing[10]}`,
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {slide?.heading && (
          <h3
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.size3xl,
              fontWeight: typography.weightBold,
              color: colors.white,
              margin: `0 0 ${spacing[2]}`,
              lineHeight: typography.lineHeightTight,
              maxWidth: 640,
            }}
          >
            {slide.heading}
          </h3>
        )}
        {slide?.subtext && (
          <p
            style={{
              fontFamily: typography.fontBody,
              fontSize: typography.sizeLg,
              color: "rgba(255,255,255,0.8)",
              margin: 0,
              maxWidth: 540,
            }}
          >
            {slide.subtext}
          </p>
        )}
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={prev}
            style={{
              position: "absolute",
              left: spacing[4],
              top: "50%",
              transform: "translateY(-50%)",
              width: 44,
              height: 44,
              borderRadius: radii.full,
              background: "rgba(139,0,21,0.75)",
              border: `1px solid rgba(255,255,255,0.25)`,
              color: colors.white,
              fontSize: "1.25rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              transition: "background 0.2s",
            }}
          >
            ‹
          </button>
          <button
            aria-label="Next slide"
            onClick={next}
            style={{
              position: "absolute",
              right: spacing[4],
              top: "50%",
              transform: "translateY(-50%)",
              width: 44,
              height: 44,
              borderRadius: radii.full,
              background: "rgba(139,0,21,0.75)",
              border: `1px solid rgba(255,255,255,0.25)`,
              color: colors.white,
              fontSize: "1.25rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              transition: "background 0.2s",
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Dot navigation */}
      {count > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: spacing[4],
            right: spacing[6],
            display: "flex",
            gap: spacing[2],
            alignItems: "center",
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                borderRadius: radii.full,
                backgroundColor: i === current ? colors.gold : "rgba(255,255,255,0.45)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.3s ease, background-color 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          top: spacing[4],
          right: spacing[6],
          fontFamily: typography.fontBody,
          fontSize: typography.sizeXs,
          fontWeight: typography.weightSemibold,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.08em",
          background: "rgba(0,0,0,0.3)",
          padding: `${spacing[1]} ${spacing[3]}`,
          borderRadius: radii.full,
          backdropFilter: "blur(4px)",
        }}
      >
        {current + 1} / {count}
      </div>
    </div>
  );
}

export const gluSlideshowConfig = {
  label: "GLU Slideshow",
  ai: {
    instructions: "Image slideshow — use for campus or program galleries. Set height 'lg' or 'xl'; enable autoPlay for ambient effect.",
  },
  fields: {
    slides: {
      type: "array",
      label: "Slides",
      ai: { instructions: "3–5 slides, each a different place or moment." },
      arrayFields: {
        // The rich media field, not a URL box: it stores the asset, its alt
        // text and the crop, which is what puts "Custom…" and the crop dialog
        // in front of an editor. The name stays `imageUrl` so slides already
        // published keep their images — see lib/media-image.ts.
        //
        // `as any` because the plugin registers this field type at runtime,
        // so it is not in Puck's built-in Field union.
        imageUrl: {
          type: "p1-media",
          label: "Image",
          ai: imageAi("Wide landscape photo, at least 1920px. Crop it wide — the slide is a shallow band, not a square.", { optional: false }),
        } as any,
        heading: { type: "text", label: "Heading", contentEditable: true, ai: { required: true, instructions: "2–6 words naming what is shown." } },
        subtext: { type: "textarea", label: "Subtext", contentEditable: true, ai: { instructions: "One sentence of context. Leave blank to show only the heading." } },
      },
      getItemSummary: (item: { heading?: string }, i?: number) => item?.heading || `Item #${(i ?? 0) + 1}`,
    },
    autoPlay: {
      type: "radio",
      label: "Auto-play",
      options: [{ label: "Yes", value: true }, { label: "No", value: false }],
      ai: { instructions: "Yes for an ambient gallery; No when slide text needs to be read." },
    },
    interval: { type: "number", label: "Interval (seconds)", min: 2, max: 30, ai: { instructions: "5–8 seconds." } },
    height: {
      type: "radio",
      label: "Height",
      options: [
        { label: "Medium (420px)", value: "md" },
        { label: "Large (560px)", value: "lg" },
        { label: "Extra-large (700px)", value: "xl" },
      ],
      ai: { instructions: "lg by default; xl only as a home-page opener; md inside a text-heavy page." },
    },
  },
  defaultProps: {
    autoPlay: true,
    interval: 5,
    height: "lg",
    slides: [
      {
        imageUrl: CAMPUS_BANNER_URL,
        heading: "Campus at the Water's Edge",
        subtext: "Our lakeside campus spans 1,400 acres of natural beauty in the heart of Michigan.",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80",
        heading: "World-Class Academics",
        subtext: "120+ degree programs taught by faculty at the forefront of their fields.",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80",
        heading: "Student Life",
        subtext: "200+ clubs, Division I athletics, and a community built on belonging.",
      },
    ],
  },
  render: GLUSlideshowComponent,
} as ComponentConfig<GLUSlideshowProps>;
