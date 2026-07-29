/**
 * component-thumbnails.tsx
 *
 * AUTO-GENERATED — do not edit by hand.
 * Run `pnpm generate-thumbnails` to regenerate from puck.config.tsx.
 *
 * Layout is inferred from field definitions (field-signature classifier)
 * with name-based heuristics as fallback. Set DEBUG_THUMBNAILS=1 to
 * see classification decisions.
 *
 * ACCENT is derived from the site's own code, not chosen by hand or by
 * looking at screenshots — see "Palette extraction" in generate-thumbnails.ts.
 * Source for this run: design-system/tokens.ts (colors.crimson — first non-neutral token; no accent/primary/brand/highlight/secondary key present)
 *
 * To customise a thumbnail: edit the generated SVG geometry in the
 * corresponding *Thumb function below, then commit the file. Re-running
 * the generator will overwrite your changes, so note any customisations
 * in a comment so they can be reapplied.
 *
 * ViewBox: 60×40 (3:2). Displayed at any size via CSS — no blur at any DPR.
 */

import React from "react";
import type { ThumbnailMap } from "@pantheon-systems/puck-css";

// ─── Palette ──────────────────────────────────────────────────────────────────

const BG_DARK = "#1e2023";
const BG_PANEL = "#2c3035";
const BG_IMAGE = "#3d4349";
const TEXT_BRIGHT = "rgba(255,255,255,0.82)";
const TEXT_DIM = "rgba(255,255,255,0.40)";
const TEXT_VERY_DIM = "rgba(255,255,255,0.14)";
const ACCENT = "#8b0015"; // auto-derived — see file header
const ACCENT_LIGHT = "rgba(139,0,21,0.16)"; // ACCENT at ~16% — card/highlight fills
const ACCENT_BORDER = "rgba(139,0,21,0.12)"; // ACCENT at ~12% — hairline borders/underlines
const SEP = "rgba(255,255,255,0.12)";
const BG_LIGHT = "#e8e6e2";
const IMG_LIGHT = "#bdbbb7";
const TEXT_ON_LIGHT = "rgba(0,0,0,0.55)";
const TEXT_ON_LIGHT_DIM = "rgba(0,0,0,0.25)";

// ─── Primitives ────────────────────────────────────────────────────────────────

function R({ x = 0, y = 0, w, h, fill, rx = 0, opacity }: {
  x?: number; y?: number; w: number; h: number;
  fill: string; rx?: number; opacity?: number;
}) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} rx={rx} opacity={opacity} />;
}

function T({ x, y, w, h = 2.5, fill = TEXT_BRIGHT, rx = 0.8 }: {
  x: number; y: number; w: number; h?: number; fill?: string; rx?: number;
}) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} rx={rx} />;
}

function Img({ x, y, w, h, fill = BG_IMAGE }: {
  x: number; y: number; w: number; h: number; fill?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={TEXT_VERY_DIM} strokeWidth={0.6} />
      <line x1={x + w} y1={y} x2={x} y2={y + h} stroke={TEXT_VERY_DIM} strokeWidth={0.6} />
    </g>
  );
}

function Btn({ x, y, w = 14, h = 5, fill = ACCENT }: {
  x: number; y: number; w?: number; h?: number; fill?: string;
}) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} rx={2} />;
}

function Thumb({ children }: { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"
      style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {children}
    </svg>
  );
}

// ─── Component wireframes ─────────────────────────────────────────────────────

/** GLUNav — navigation bar */
function GLUNavThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#8B0015";
  const BG_PANEL = "#9b2436";
  const BG_IMAGE = "#a73d4d";
  const BG_LIGHT = "#8B0015";
  const IMG_LIGHT = "#a73d4d";
  const SEP = "rgba(255,255,255,0.18)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
  const TEXT_DIM = "rgba(255,255,255,0.58)";
  const TEXT_VERY_DIM = "rgba(255,255,255,0.24)";
  const TEXT_ON_LIGHT = "rgba(255,255,255,0.92)";
  const TEXT_ON_LIGHT_DIM = "rgba(255,255,255,0.58)";
  const ACCENT = "#C8922A";
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <R w={60} h={14} fill={BG_PANEL} />
      <R x={4} y={4} w={7} h={6} fill={TEXT_BRIGHT} rx={0.5} />
      <line x1={14} y1={2} x2={14} y2={12} stroke={SEP} strokeWidth={0.5} />
      <T x={17} y={5.5} w={7} fill={TEXT_DIM} />
      <T x={27} y={5.5} w={6} fill={TEXT_DIM} />
      <T x={36} y={5.5} w={8} fill={TEXT_DIM} />
      <Btn x={47} y={4} w={9} h={6} />
      <T x={10} y={22} w={40} h={2.5} fill={TEXT_VERY_DIM} />
      <T x={14} y={28} w={32} h={2} fill={TEXT_VERY_DIM} />
    </Thumb>
  );
}

/** GLUHero — full-bleed image with centered heading + CTA (wash color resolved from source) */
function GLUHeroThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#8B0015";
  const BG_PANEL = "#9b2436";
  const BG_IMAGE = "#a73d4d";
  const BG_LIGHT = "#8B0015";
  const IMG_LIGHT = "#a73d4d";
  const SEP = "rgba(255,255,255,0.18)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
  const TEXT_DIM = "rgba(255,255,255,0.58)";
  const TEXT_VERY_DIM = "rgba(255,255,255,0.24)";
  const TEXT_ON_LIGHT = "rgba(255,255,255,0.92)";
  const TEXT_ON_LIGHT_DIM = "rgba(255,255,255,0.58)";
  const ACCENT = "#C8922A";
  return (
    <Thumb>
      <Img x={0} y={0} w={60} h={40} fill="#2a2f34" />
      <defs>
        <linearGradient id="grad-hero-gluhero" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B0015" stopOpacity={0.92} />
          <stop offset="55%" stopColor="#8B0015" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#8B0015" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={60} height={40} fill="url(#grad-hero-gluhero)" />
      <T x={10} y={12} w={40} h={4} fill={TEXT_BRIGHT} />
      <T x={18} y={19} w={24} h={2.5} fill={TEXT_DIM} />
      <Btn x={16} y={27} w={14} />
      <circle cx={30} cy={37} r={1.5} fill={TEXT_DIM} />
    </Thumb>
  );
}

/** GLUPageHero — full-bleed image with centered heading + CTA (wash color resolved from source) */
function GLUPageHeroThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#8B0015";
  const BG_PANEL = "#9b2436";
  const BG_IMAGE = "#a73d4d";
  const BG_LIGHT = "#8B0015";
  const IMG_LIGHT = "#a73d4d";
  const SEP = "rgba(255,255,255,0.18)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
  const TEXT_DIM = "rgba(255,255,255,0.58)";
  const TEXT_VERY_DIM = "rgba(255,255,255,0.24)";
  const TEXT_ON_LIGHT = "rgba(255,255,255,0.92)";
  const TEXT_ON_LIGHT_DIM = "rgba(255,255,255,0.58)";
  const ACCENT = "#C8922A";
  return (
    <Thumb>
      <Img x={0} y={0} w={60} h={40} fill="#2a2f34" />
      <defs>
        <linearGradient id="grad-hero-glupagehero" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B0015" stopOpacity={0.92} />
          <stop offset="55%" stopColor="#8B0015" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#8B0015" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={60} height={40} fill="url(#grad-hero-glupagehero)" />
      <T x={10} y={12} w={40} h={4} fill={TEXT_BRIGHT} />
      <T x={18} y={19} w={24} h={2.5} fill={TEXT_DIM} />
      <Btn x={16} y={27} w={14} />
      <circle cx={30} cy={37} r={1.5} fill={TEXT_DIM} />
    </Thumb>
  );
}

/** GLUStatsBar — 3-column stat/pillar layout */
function GLUStatsBarThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#8B0015";
  const BG_PANEL = "#9b2436";
  const BG_IMAGE = "#a73d4d";
  const BG_LIGHT = "#8B0015";
  const IMG_LIGHT = "#a73d4d";
  const SEP = "rgba(255,255,255,0.18)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
  const TEXT_DIM = "rgba(255,255,255,0.58)";
  const TEXT_VERY_DIM = "rgba(255,255,255,0.24)";
  const TEXT_ON_LIGHT = "rgba(255,255,255,0.92)";
  const TEXT_ON_LIGHT_DIM = "rgba(255,255,255,0.58)";
  const ACCENT = "#C8922A";
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      {[0, 1, 2].map((i) => {
        const cx = 4 + i * 19;
        return (
          <g key={i}>
            <T x={cx} y={10} w={14} h={5} fill={TEXT_ON_LIGHT} />
            <T x={cx} y={18} w={12} h={2} fill={TEXT_ON_LIGHT_DIM} />
            <T x={cx} y={22} w={10} h={2} fill={TEXT_ON_LIGHT_DIM} />
            {i < 2 && (
              <line x1={cx + 17} y1={6} x2={cx + 17} y2={34}
                stroke="rgba(0,0,0,0.12)" strokeWidth={0.5} />
            )}
          </g>
        );
      })}
    </Thumb>
  );
}

/** GLUFeatureSection — image left, text + button right */
function GLUFeatureSectionThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#ffffff";
  const BG_PANEL = "#f0f0f0";
  const BG_IMAGE = "#dbdbdb";
  const BG_LIGHT = "#ffffff";
  const IMG_LIGHT = "#dbdbdb";
  const SEP = "rgba(0,0,0,0.12)";
  const TEXT_BRIGHT = "rgba(0,0,0,0.62)";
  const TEXT_DIM = "rgba(0,0,0,0.36)";
  const TEXT_VERY_DIM = "rgba(0,0,0,0.15)";
  const TEXT_ON_LIGHT = "rgba(0,0,0,0.62)";
  const TEXT_ON_LIGHT_DIM = "rgba(0,0,0,0.36)";
  const ACCENT = "#8b0015";
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <Img x={0} y={0} w={28} h={40} />
      <T x={32} y={8} w={10} h={2} fill={ACCENT} />
      <T x={32} y={13} w={24} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={18} w={20} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={24} w={22} h={1.8} fill={TEXT_DIM} />
      <T x={32} y={27} w={18} h={1.8} fill={TEXT_DIM} />
      <Btn x={32} y={32} w={16} />
    </Thumb>
  );
}

/** GLUCardGrid — 3-column card grid */
function GLUCardGridThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#FFF5F5";
  const BG_PANEL = "#f0e6e6";
  const BG_IMAGE = "#dbd3d3";
  const BG_LIGHT = "#FFF5F5";
  const IMG_LIGHT = "#dbd3d3";
  const SEP = "rgba(0,0,0,0.12)";
  const TEXT_BRIGHT = "rgba(0,0,0,0.62)";
  const TEXT_DIM = "rgba(0,0,0,0.36)";
  const TEXT_VERY_DIM = "rgba(0,0,0,0.15)";
  const TEXT_ON_LIGHT = "rgba(0,0,0,0.62)";
  const TEXT_ON_LIGHT_DIM = "rgba(0,0,0,0.36)";
  const ACCENT = "#8b0015";
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={4} y={3} w={18} h={2.5} fill={TEXT_BRIGHT} />
      {[0, 1, 2].map((i) => {
        const cx = 4 + i * 19;
        return (
          <g key={i}>
            <R x={cx} y={8} w={16} h={28} fill={BG_PANEL} rx={1} />
            <Img x={cx} y={8} w={16} h={12} fill="#32373d" />
            <T x={cx + 2} y={23} w={12} h={2.5} />
            <T x={cx + 2} y={27} w={10} h={2} fill={TEXT_DIM} />
          </g>
        );
      })}
    </Thumb>
  );
}

/** GLUTestimonialSlider — full-bleed image with prev/next arrows (canvas color resolved from source) */
function GLUTestimonialSliderThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#8B0015";
  const BG_PANEL = "#9b2436";
  const BG_IMAGE = "#a73d4d";
  const BG_LIGHT = "#8B0015";
  const IMG_LIGHT = "#a73d4d";
  const SEP = "rgba(255,255,255,0.18)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
  const TEXT_DIM = "rgba(255,255,255,0.58)";
  const TEXT_VERY_DIM = "rgba(255,255,255,0.24)";
  const TEXT_ON_LIGHT = "rgba(255,255,255,0.92)";
  const TEXT_ON_LIGHT_DIM = "rgba(255,255,255,0.58)";
  const ACCENT = "#C8922A";
  return (
    <Thumb>
      <Img x={0} y={0} w={60} h={40} fill="#8B0015" />
      <R x={2} y={14} w={8} h={12} fill="rgba(0,0,0,0.45)" rx={1} />
      <polyline points="8,16 4,20 8,24" fill="none"
        stroke={TEXT_BRIGHT} strokeWidth={1.2} strokeLinejoin="round" />
      <R x={50} y={14} w={8} h={12} fill="rgba(0,0,0,0.45)" rx={1} />
      <polyline points="52,16 56,20 52,24" fill="none"
        stroke={TEXT_BRIGHT} strokeWidth={1.2} strokeLinejoin="round" />
      <R x={0} y={32} w={60} h={8} fill="rgba(0,0,0,0.6)" />
      <T x={4} y={35} w={30} h={2} fill={TEXT_DIM} />
    </Thumb>
  );
}

/** GLUCtaBanner — image left, text + button right */
function GLUCtaBannerThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#8B0015";
  const BG_PANEL = "#9b2436";
  const BG_IMAGE = "#a73d4d";
  const BG_LIGHT = "#8B0015";
  const IMG_LIGHT = "#a73d4d";
  const SEP = "rgba(255,255,255,0.18)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
  const TEXT_DIM = "rgba(255,255,255,0.58)";
  const TEXT_VERY_DIM = "rgba(255,255,255,0.24)";
  const TEXT_ON_LIGHT = "rgba(255,255,255,0.92)";
  const TEXT_ON_LIGHT_DIM = "rgba(255,255,255,0.58)";
  const ACCENT = "#C8922A";
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <Img x={0} y={0} w={28} h={40} />
      <T x={32} y={8} w={10} h={2} fill={ACCENT} />
      <T x={32} y={13} w={24} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={18} w={20} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={24} w={22} h={1.8} fill={TEXT_DIM} />
      <T x={32} y={27} w={18} h={1.8} fill={TEXT_DIM} />
      <Btn x={32} y={32} w={16} />
    </Thumb>
  );
}

/** GLUAccordion — heading + horizontal card strip */
function GLUAccordionThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#FFF5F5";
  const BG_PANEL = "#f0e6e6";
  const BG_IMAGE = "#dbd3d3";
  const BG_LIGHT = "#FFF5F5";
  const IMG_LIGHT = "#dbd3d3";
  const SEP = "rgba(0,0,0,0.12)";
  const TEXT_BRIGHT = "rgba(0,0,0,0.62)";
  const TEXT_DIM = "rgba(0,0,0,0.36)";
  const TEXT_VERY_DIM = "rgba(0,0,0,0.15)";
  const TEXT_ON_LIGHT = "rgba(0,0,0,0.62)";
  const TEXT_ON_LIGHT_DIM = "rgba(0,0,0,0.36)";
  const ACCENT = "#8b0015";
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={4} y={4} w={8} h={2} fill={TEXT_DIM} />
      <T x={4} y={8} w={22} h={3} fill={TEXT_BRIGHT} />
      {[0, 1, 2].map((i) => {
        const cx = 4 + i * 19;
        return (
          <g key={i}>
            <Img x={cx} y={14} w={16} h={11} />
            <T x={cx} y={27} w={14} h={2.5} />
            <T x={cx} y={31} w={10} h={2} fill={TEXT_DIM} />
          </g>
        );
      })}
    </Thumb>
  );
}

/** GLUFooter — dark footer with link columns + social circles */
function GLUFooterThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#6B0010";
  const BG_PANEL = "#802431";
  const BG_IMAGE = "#8f3d49";
  const BG_LIGHT = "#6B0010";
  const IMG_LIGHT = "#8f3d49";
  const SEP = "rgba(255,255,255,0.18)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
  const TEXT_DIM = "rgba(255,255,255,0.58)";
  const TEXT_VERY_DIM = "rgba(255,255,255,0.24)";
  const TEXT_ON_LIGHT = "rgba(255,255,255,0.92)";
  const TEXT_ON_LIGHT_DIM = "rgba(255,255,255,0.58)";
  const ACCENT = "#C8922A";
  return (
    <Thumb>
      <R w={60} h={40} fill="#111315" />
      <line x1={0} y1={6} x2={60} y2={6} stroke={SEP} strokeWidth={0.5} />
      <R x={4} y={2} w={8} h={3.5} fill={TEXT_DIM} rx={0.5} />
      {[0, 1, 2].map((col) => {
        const cx = 18 + col * 12;
        return (
          <g key={col}>
            <T x={cx} y={9} w={9} h={2} fill={TEXT_DIM} />
            <T x={cx} y={13} w={7} h={1.5} fill={TEXT_VERY_DIM} />
            <T x={cx} y={16} w={8} h={1.5} fill={TEXT_VERY_DIM} />
            <T x={cx} y={19} w={6} h={1.5} fill={TEXT_VERY_DIM} />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((j) => (
        <circle key={j} cx={5 + j * 6} cy={30} r={2.5}
          fill={BG_PANEL} stroke={SEP} strokeWidth={0.5} />
      ))}
      <line x1={0} y1={35} x2={60} y2={35} stroke={SEP} strokeWidth={0.5} />
      <T x={4} y={37} w={30} h={1.5} fill={TEXT_VERY_DIM} />
    </Thumb>
  );
}

/** GLUTimeline — heading + horizontal card strip */
function GLUTimelineThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#ffffff";
  const BG_PANEL = "#f0f0f0";
  const BG_IMAGE = "#dbdbdb";
  const BG_LIGHT = "#ffffff";
  const IMG_LIGHT = "#dbdbdb";
  const SEP = "rgba(0,0,0,0.12)";
  const TEXT_BRIGHT = "rgba(0,0,0,0.62)";
  const TEXT_DIM = "rgba(0,0,0,0.36)";
  const TEXT_VERY_DIM = "rgba(0,0,0,0.15)";
  const TEXT_ON_LIGHT = "rgba(0,0,0,0.62)";
  const TEXT_ON_LIGHT_DIM = "rgba(0,0,0,0.36)";
  const ACCENT = "#8b0015";
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={4} y={4} w={8} h={2} fill={TEXT_DIM} />
      <T x={4} y={8} w={22} h={3} fill={TEXT_BRIGHT} />
      {[0, 1, 2].map((i) => {
        const cx = 4 + i * 19;
        return (
          <g key={i}>
            <Img x={cx} y={14} w={16} h={11} />
            <T x={cx} y={27} w={14} h={2.5} />
            <T x={cx} y={31} w={10} h={2} fill={TEXT_DIM} />
          </g>
        );
      })}
    </Thumb>
  );
}

/** GLUSlideshow — heading + horizontal card strip */
function GLUSlideshowThumb() {
  // Palette resolved from this component's actual background — see resolveComponentBackground() in generate-thumbnails.ts
  const BG_DARK = "#1A0505";
  const BG_PANEL = "#3a2828";
  const BG_IMAGE = "#514141";
  const BG_LIGHT = "#1A0505";
  const IMG_LIGHT = "#514141";
  const SEP = "rgba(255,255,255,0.18)";
  const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
  const TEXT_DIM = "rgba(255,255,255,0.58)";
  const TEXT_VERY_DIM = "rgba(255,255,255,0.24)";
  const TEXT_ON_LIGHT = "rgba(255,255,255,0.92)";
  const TEXT_ON_LIGHT_DIM = "rgba(255,255,255,0.58)";
  const ACCENT = "#C8922A";
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={4} y={4} w={8} h={2} fill={TEXT_DIM} />
      <T x={4} y={8} w={22} h={3} fill={TEXT_BRIGHT} />
      {[0, 1, 2].map((i) => {
        const cx = 4 + i * 19;
        return (
          <g key={i}>
            <Img x={cx} y={14} w={16} h={11} />
            <T x={cx} y={27} w={14} h={2.5} />
            <T x={cx} y={31} w={10} h={2} fill={TEXT_DIM} />
          </g>
        );
      })}
    </Thumb>
  );
}

/** CtEvent — image left, text + button right */
function CtEventThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <Img x={0} y={0} w={28} h={40} />
      <T x={32} y={8} w={10} h={2} fill={ACCENT} />
      <T x={32} y={13} w={24} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={18} w={20} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={24} w={22} h={1.8} fill={TEXT_DIM} />
      <T x={32} y={27} w={18} h={1.8} fill={TEXT_DIM} />
      <Btn x={32} y={32} w={16} />
    </Thumb>
  );
}

/** CtCounselor — image left, text + button right */
function CtCounselorThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <Img x={0} y={0} w={28} h={40} />
      <T x={32} y={8} w={10} h={2} fill={ACCENT} />
      <T x={32} y={13} w={24} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={18} w={20} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={24} w={22} h={1.8} fill={TEXT_DIM} />
      <T x={32} y={27} w={18} h={1.8} fill={TEXT_DIM} />
      <Btn x={32} y={32} w={16} />
    </Thumb>
  );
}

/** CtAccolade — image left, text + button right */
function CtAccoladeThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <Img x={0} y={0} w={28} h={40} />
      <T x={32} y={8} w={10} h={2} fill={ACCENT} />
      <T x={32} y={13} w={24} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={18} w={20} h={3} fill={TEXT_BRIGHT} />
      <T x={32} y={24} w={22} h={1.8} fill={TEXT_DIM} />
      <T x={32} y={27} w={18} h={1.8} fill={TEXT_DIM} />
      <Btn x={32} y={32} w={16} />
    </Thumb>
  );
}

/** EventListing — centred article body text column */
function EventListingThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />
      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />
      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />
      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
    </Thumb>
  );
}

/** CounselorListing — centred article body text column */
function CounselorListingThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />
      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />
      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />
      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
    </Thumb>
  );
}

/** AccoladeListing — centred article body text column */
function AccoladeListingThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />
      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />
      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />
      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
    </Thumb>
  );
}

/** HeadingBlock — form control / UI input */
function HeadingBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={4} y={9} w={18} h={2} fill={TEXT_DIM} />
      <R x={4} y={14} w={52} h={10} fill={BG_PANEL} rx={1.5} />
      <T x={8} y={18} w={20} h={2} fill={TEXT_VERY_DIM} />
      <T x={4} y={29} w={28} h={1.5} fill={TEXT_VERY_DIM} />
    </Thumb>
  );
}

/** ParagraphBlock — centred article body text column */
function ParagraphBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />
      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />
      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />
      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
    </Thumb>
  );
}

/** ImageBlock — centered heading */
function ImageBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={8} y={14} w={44} h={4.5} fill={TEXT_BRIGHT} />
      <T x={16} y={21} w={28} h={2.5} fill={TEXT_DIM} />
      <line x1={24} y1={26} x2={36} y2={26} stroke={SEP} strokeWidth={0.8} />
    </Thumb>
  );
}

/** GridBlock — centred article body text column */
function GridBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />
      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />
      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />
      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
    </Thumb>
  );
}

/** QuoteBlock — centred article body text column */
function QuoteBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />
      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />
      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />
      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
    </Thumb>
  );
}

/** ListBlock — form control / UI input */
function ListBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={4} y={9} w={18} h={2} fill={TEXT_DIM} />
      <R x={4} y={14} w={52} h={10} fill={BG_PANEL} rx={1.5} />
      <T x={8} y={18} w={20} h={2} fill={TEXT_VERY_DIM} />
      <T x={4} y={29} w={28} h={1.5} fill={TEXT_VERY_DIM} />
    </Thumb>
  );
}

/** DividerBlock — centered heading */
function DividerBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={8} y={14} w={44} h={4.5} fill={TEXT_BRIGHT} />
      <T x={16} y={21} w={28} h={2.5} fill={TEXT_DIM} />
      <line x1={24} y1={26} x2={36} y2={26} stroke={SEP} strokeWidth={0.8} />
    </Thumb>
  );
}

/** SpacerBlock — form control / UI input */
function SpacerBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={4} y={9} w={18} h={2} fill={TEXT_DIM} />
      <R x={4} y={14} w={52} h={10} fill={BG_PANEL} rx={1.5} />
      <T x={8} y={18} w={20} h={2} fill={TEXT_VERY_DIM} />
      <T x={4} y={29} w={28} h={1.5} fill={TEXT_VERY_DIM} />
    </Thumb>
  );
}

/** ButtonBlock — form control / UI input */
function ButtonBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <T x={4} y={9} w={18} h={2} fill={TEXT_DIM} />
      <R x={4} y={14} w={52} h={10} fill={BG_PANEL} rx={1.5} />
      <T x={8} y={18} w={20} h={2} fill={TEXT_VERY_DIM} />
      <T x={4} y={29} w={28} h={1.5} fill={TEXT_VERY_DIM} />
    </Thumb>
  );
}

/** P1WelcomeBlock — centred article body text column */
function P1WelcomeBlockThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />
      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />
      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />
      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
    </Thumb>
  );
}

/** PCCArticleHeader — navigation bar */
function PCCArticleHeaderThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_DARK} />
      <R w={60} h={14} fill={BG_PANEL} />
      <R x={4} y={4} w={7} h={6} fill={TEXT_BRIGHT} rx={0.5} />
      <line x1={14} y1={2} x2={14} y2={12} stroke={SEP} strokeWidth={0.5} />
      <T x={17} y={5.5} w={7} fill={TEXT_DIM} />
      <T x={27} y={5.5} w={6} fill={TEXT_DIM} />
      <T x={36} y={5.5} w={8} fill={TEXT_DIM} />
      <Btn x={47} y={4} w={9} h={6} />
      <T x={10} y={22} w={40} h={2.5} fill={TEXT_VERY_DIM} />
      <T x={14} y={28} w={32} h={2} fill={TEXT_VERY_DIM} />
    </Thumb>
  );
}

/** PCCArticleBody — centred article body text column */
function PCCArticleBodyThumb() {
  return (
    <Thumb>
      <R w={60} h={40} fill={BG_LIGHT} />
      <T x={10} y={4} w={40} h={3} fill={TEXT_ON_LIGHT} />
      <T x={10} y={9} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={13} w={36} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={17} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <R x={10} y={22} w={2} h={10} fill={IMG_LIGHT} rx={1} />
      <T x={14} y={23} w={34} h={2} fill={TEXT_ON_LIGHT} />
      <T x={14} y={27} w={30} h={2} fill={TEXT_ON_LIGHT_DIM} />
      <T x={10} y={35} w={40} h={2} fill={TEXT_ON_LIGHT_DIM} />
    </Thumb>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const THUMBNAIL_MAP: ThumbnailMap = {
  GLUNav: GLUNavThumb,
  GLUHero: GLUHeroThumb,
  GLUPageHero: GLUPageHeroThumb,
  GLUStatsBar: GLUStatsBarThumb,
  GLUFeatureSection: GLUFeatureSectionThumb,
  GLUCardGrid: GLUCardGridThumb,
  GLUTestimonialSlider: GLUTestimonialSliderThumb,
  GLUCtaBanner: GLUCtaBannerThumb,
  GLUAccordion: GLUAccordionThumb,
  GLUFooter: GLUFooterThumb,
  GLUTimeline: GLUTimelineThumb,
  GLUSlideshow: GLUSlideshowThumb,
  CtEvent: CtEventThumb,
  CtCounselor: CtCounselorThumb,
  CtAccolade: CtAccoladeThumb,
  EventListing: EventListingThumb,
  CounselorListing: CounselorListingThumb,
  AccoladeListing: AccoladeListingThumb,
  HeadingBlock: HeadingBlockThumb,
  ParagraphBlock: ParagraphBlockThumb,
  ImageBlock: ImageBlockThumb,
  GridBlock: GridBlockThumb,
  QuoteBlock: QuoteBlockThumb,
  ListBlock: ListBlockThumb,
  DividerBlock: DividerBlockThumb,
  SpacerBlock: SpacerBlockThumb,
  ButtonBlock: ButtonBlockThumb,
  P1WelcomeBlock: P1WelcomeBlockThumb,
  PCCArticleHeader: PCCArticleHeaderThumb,
  PCCArticleBody: PCCArticleBodyThumb,
};
