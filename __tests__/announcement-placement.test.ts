import { describe, expect, it } from "vitest";
import { filterMisplacedAnnouncementBanners, type PlacementBlock } from "../lib/announcement-placement";

const banner = (id: string): PlacementBlock => ({ type: "GLUAnnouncementBanner", props: { id } });
const hero = (id: string): PlacementBlock => ({ type: "GLUPageHero", props: { id } });
const section = (id: string): PlacementBlock => ({ type: "GLUFeatureSection", props: { id } });

describe("filterMisplacedAnnouncementBanners", () => {
  it("keeps a banner at index 0", () => {
    const content = [banner("a"), hero("h"), section("s")];
    expect(filterMisplacedAnnouncementBanners(content)).toEqual(content);
  });

  it("drops a banner that is not first", () => {
    const content = [hero("h"), banner("a"), section("s")];
    expect(filterMisplacedAnnouncementBanners(content)).toEqual([hero("h"), section("s")]);
  });

  it("keeps only the first banner and drops any later ones, even a second one", () => {
    const content = [banner("a"), hero("h"), banner("b"), banner("c")];
    expect(filterMisplacedAnnouncementBanners(content)).toEqual([banner("a"), hero("h")]);
  });

  it("drops a banner at index 0 too if it is not literally first — i.e. never lets a later one count as first", () => {
    // A banner that is second overall should never be treated as "the first
    // announcement banner" and kept; "first" means "first block on the page."
    const content = [hero("h"), banner("a")];
    expect(filterMisplacedAnnouncementBanners(content)).toEqual([hero("h")]);
  });

  it("leaves content with no banners untouched", () => {
    const content = [hero("h"), section("s")];
    expect(filterMisplacedAnnouncementBanners(content)).toEqual(content);
  });

  it("handles empty, undefined and null content", () => {
    expect(filterMisplacedAnnouncementBanners([])).toEqual([]);
    expect(filterMisplacedAnnouncementBanners(undefined)).toEqual([]);
    expect(filterMisplacedAnnouncementBanners(null)).toEqual([]);
  });
});
