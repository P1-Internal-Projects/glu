import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GLUAnnouncementBannerComponent,
  dismissKey,
  type GLUAnnouncementBannerProps,
} from "../components/puck/glu-announcement-banner";

/**
 * Server-rendered checks only (the vitest environment is node). Dismissal
 * itself — the click, localStorage, and staying hidden on reload — is checked
 * in the browser.
 */

const BASE: GLUAnnouncementBannerProps = {
  variant: "news",
  title: "Title",
  description: "Description.",
  buttonLabel: "Learn More",
  buttonHref: "/news",
  background: "default",
  customIcon: null,
  dismissible: false,
};

const html = (props: Partial<GLUAnnouncementBannerProps> & { puck?: { isEditing?: boolean } } = {}) =>
  renderToStaticMarkup(<GLUAnnouncementBannerComponent {...BASE} {...props} />);

describe("GLUAnnouncementBanner", () => {
  it.each(["news", "alert", "weather", "emergency"] as const)("labels the %s variant for screen readers", (variant) => {
    const out = html({ variant });
    expect(out).toContain(`data-variant="${variant}"`);
    expect(out).toMatch(new RegExp(`aria-label="${variant} announcement"`, "i"));
    expect(out).toContain("<svg");
  });

  it("uses the variant's background unless one is chosen", () => {
    expect(html({ variant: "weather" })).toContain("background-color:#6B0010");
    expect(html({ variant: "weather", background: "gold" })).toContain("background-color:#C8922A");
  });

  it("puts dark text on gold, where white would fail contrast", () => {
    expect(html({ variant: "alert" })).toMatch(/background-color:#C8922A;color:#1A0505/);
  });

  it("drops the default icon for a custom one", () => {
    const out = html({ customIcon: "https://media.p1.pantheon.io/icon.png" });
    expect(out).toContain('src="https://media.p1.pantheon.io/icon.png');
    expect(out).not.toContain("<svg");
  });

  it("hides a button with no link on the published page but shows it in the editor", () => {
    expect(html({ buttonHref: "" })).not.toContain("Learn More");
    expect(html({ buttonHref: "", puck: { isEditing: true } })).toContain("Learn More");
    expect(html()).toContain('href="/news"');
  });

  it("renders the close button only when dismissible", () => {
    expect(html()).not.toContain("Dismiss");
    expect(html({ dismissible: true })).toContain('aria-label="Dismiss news announcement"');
  });

  it("keys dismissal on content, so an edited announcement reappears", () => {
    const a = dismissKey(BASE);
    expect(dismissKey({ ...BASE })).toBe(a);
    expect(dismissKey({ ...BASE, title: "New title" })).not.toBe(a);
  });
});
