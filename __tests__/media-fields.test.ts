import { describe, expect, it } from "vitest";
import { MEDIA_FIELD_PATTERNS, isMediaFieldName } from "../lib/media-fields";

/**
 * The plugin picks fields by name, so a field gets the picker or a bare text
 * box depending on what it happens to be called. That is easy to get wrong
 * twice over: a new image field silently arrives as a text box, or a pattern
 * grows loose enough to swallow a link field and replace it with an image
 * picker. Both are caught here.
 */
describe("media picker field names", () => {
  // Every image source field on the site's blocks.
  it.each(["photoUrl", "imageUrl", "backgroundImageUrl"])("%s gets the picker", (name) => {
    expect(isMediaFieldName(name)).toBe(true);
  });

  // The defaults must survive being replaced by our list.
  it.each(["logoUrl", "iconUrl", "thumbnailUrl", "mediaUrl"])("%s still matches", (name) => {
    expect(isMediaFieldName(name)).toBe(true);
  });

  // Destinations and alt text are not image sources. Handing an editor an image
  // picker for a link would make the field unusable.
  it.each(["imageAlt", "href", "ctaHref", "url", "registrationUrl", "email"])(
    "%s stays a text field",
    (name) => {
      expect(isMediaFieldName(name)).toBe(false);
    },
  );

  // Puck addresses nested fields as "items.0.photoUrl".
  it("matches on the last path segment, as the plugin does", () => {
    expect(isMediaFieldName("items.0.photoUrl")).toBe(true);
    expect(isMediaFieldName("items.0.href")).toBe(false);
  });

  it("extends the plugin defaults rather than replacing them", () => {
    expect(MEDIA_FIELD_PATTERNS.length).toBeGreaterThan(2);
  });
});
