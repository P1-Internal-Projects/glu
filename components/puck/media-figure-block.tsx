import { createMediaFigureBlock } from "@pantheon-systems/p1-media/server";
import { blockPaddingClass } from "./block-padding";
import { imageAi, withFieldAi } from "../../lib/ai-hints";

// CDN origin, not the Worker API URL; defaults to production when unset.
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

const baseMediaFigure = createMediaFigureBlock({
  mediaBaseUrl: MEDIA_BASE,
  transform: { width: 1200, height: 630, format: "webp" },
  className: `m-0 ${blockPaddingClass} [&>img]:block [&>img]:h-auto [&>img]:max-h-[400px] [&>img]:w-full [&>img]:max-w-4xl [&>img]:rounded-lg [&>img]:object-contain`,
  captionClassName: "mt-3 max-w-4xl text-sm text-neutral-600",
});

export const mediaFigureBlock = {
  ...baseMediaFigure,
  ai: {
    instructions:
      "Image from the media library with an optional caption, in body copy. The preferred way to place a standalone image.",
  },
  fields: withFieldAi(baseMediaFigure.fields as Record<string, unknown>, {
    photo: imageAi("The image to show, with its alt text and caption.", { optional: false }),
    loading: { instructions: "lazy unless the image is the first thing on the page." },
  }) as typeof baseMediaFigure.fields,
};
