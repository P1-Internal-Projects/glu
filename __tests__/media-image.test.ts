import { describe, expect, it } from "vitest";
import { cardImage } from "../lib/media-image";

const SIZE = { width: 800, height: 450 };
const CDN = "https://media.p1.pantheon.io";
const ASSET = `${CDN}/image/site/assets/a1/v1-photo.jpg`;

/**
 * Converting a field from the URL-string picker to the rich `p1-media` type
 * does not migrate what is already published, so the resolver has to serve
 * both shapes. These lock in which one wins and, more importantly, that the
 * legacy path never becomes a way to render an arbitrary origin from a rich
 * value — that is exactly the case getMediaProps's origin check exists for.
 */
describe("cardImage", () => {
  it("resolves a rich media value and keeps its alt text", () => {
    const out = cardImage(
      { assetId: "a1", versionId: "v1", url: ASSET, alt: "A quadrangle in summer" },
      SIZE,
    );
    expect(out.src).toContain("/image/site/assets/a1/v1-photo.jpg");
    expect(out.alt).toBe("A quadrangle in summer");
    expect(out.legacy).toBe(false);
  });

  /**
   * Both dimensions have to reach the URL. The transform only honours the
   * editor's crop when it has a target ratio to crop to, so a width alone
   * would make "Smart crop" and the crop dialog do nothing on screen.
   */
  it("asks the CDN for both dimensions, so a crop actually renders", () => {
    const out = cardImage({ assetId: "a1", versionId: "v1", url: ASSET }, SIZE);
    expect(out.src).toMatch(/[?&]width=800\b/);
    expect(out.src).toMatch(/[?&]height=450\b/);
  });

  it("preserves the crop already on the stored URL", () => {
    const out = cardImage(
      {
        assetId: "a1",
        versionId: "v1",
        url: `${ASSET}?trim.left=10&trim.top=20&trim.width=300&trim.height=200`,
      },
      SIZE,
    );
    expect(out.src).toContain("trim.left=10");
    expect(out.src).toContain("trim.height=200");
  });

  it("renders a legacy URL string from before the field was converted", () => {
    const unsplash = "https://images.unsplash.com/photo-1441974231531?w=800&q=80";
    const out = cardImage(unsplash, SIZE);
    expect(out.src).toBe(unsplash);
    expect(out.legacy).toBe(true);
  });

  /**
   * The fallback is for strings only. A rich value whose url the origin check
   * refused is a value someone edited to point elsewhere, and it stays refused.
   */
  it("does not fall back for a rich value pointing at a foreign origin", () => {
    const out = cardImage(
      { assetId: "a1", versionId: "v1", url: "https://evil.test/tracker.gif" },
      SIZE,
    );
    expect(out.src).toBe("");
  });

  it("returns an empty src for an unset image, so the card skips the markup", () => {
    for (const value of [null, undefined, ""] as const) {
      expect(cardImage(value, SIZE).src).toBe("");
    }
  });
});
