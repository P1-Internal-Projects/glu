import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Section, normalizeBackground } from "../design-system/components/section";

describe("normalizeBackground", () => {
  it("passes canonical values through unchanged", () => {
    expect(normalizeBackground("white")).toBe("white");
    expect(normalizeBackground("offWhite")).toBe("offWhite");
    expect(normalizeBackground("rose")).toBe("rose");
    expect(normalizeBackground("crimson")).toBe("crimson");
  });

  it("maps legacy stored values to their current names", () => {
    expect(normalizeBackground("lightBlue")).toBe("rose");
    expect(normalizeBackground("navy")).toBe("crimson");
  });

  it("falls back to white for unknown or missing values", () => {
    expect(normalizeBackground(undefined)).toBe("white");
    expect(normalizeBackground(null)).toBe("white");
    expect(normalizeBackground("something-invented")).toBe("white");
  });
});

describe("Section legacy background rendering", () => {
  const html = (background: Parameters<typeof Section>[0]["background"]) =>
    renderToStaticMarkup(
      <Section background={background}>
        <span>content</span>
      </Section>,
    );

  it("renders navy (legacy) exactly as crimson", () => {
    expect(html("navy")).toBe(html("crimson"));
    expect(html("crimson")).toContain("background-color:#8B0015");
  });

  it("renders lightBlue (legacy) exactly as rose", () => {
    expect(html("lightBlue")).toBe(html("rose"));
    expect(html("rose")).toContain("background-color:#FDECEA");
  });
});
