import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GLUStatsBarComponent, type GLUStatsBarProps } from "../components/puck/glu-stats-bar";

const html = (background: GLUStatsBarProps["background"]) =>
  renderToStaticMarkup(<GLUStatsBarComponent heading="By the numbers" stats={[{ value: "15,000", label: "Students" }]} background={background} />);

describe("GLUStatsBar backgrounds", () => {
  it.each([
    ["crimson", "#8B0015"],
    ["navy", "#8B0015"], // legacy stored value — still renders crimson
    ["crimsonDark", "#6B0010"],
    ["gold", "#C8922A"],
    ["white", "#ffffff"],
  ] as const)("%s renders %s behind the whole bar", (background, hex) => {
    expect(html(background)).toContain(`<section style="background-color:${hex}`);
  });

  it("puts dark text on gold, where white would fail contrast", () => {
    const out = html("gold");
    expect(out).toContain("color:#6B0010"); // numbers
    expect(out).toContain("color:#1A0505"); // labels and heading
  });

  it("draws no separate box behind each number", () => {
    expect(html("white").match(/background-color/g)).toHaveLength(1);
  });
});
