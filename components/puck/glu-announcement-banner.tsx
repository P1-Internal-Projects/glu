"use client";

import React, { useEffect, useState } from "react";
import { createUsePuck, type ComponentConfig } from "@puckeditor/core";
import { colors, typography, spacing, radii, layout } from "../../design-system/tokens";
import { buttonLabelAi, imageAi, linkAi } from "../../lib/ai-hints";
import { resolveMediaImage, type MediaImageValue } from "../../lib/media-image";

export type AnnouncementVariant = "news" | "alert" | "weather" | "emergency";

/**
 * The palette colours an editor may put behind the banner, by token name.
 * `default` defers to the variant, so a banner switched from News to
 * Emergency changes colour with it unless the editor has chosen one.
 * Canonical, current stored values.
 */
export type AnnouncementBackground = "default" | "crimson" | "crimsonDark" | "gold" | "dark" | "rose" | "offWhite" | "white";

/** Legacy stored value from before the crimson rebrand — normalizes to `rose`. */
export type LegacyAnnouncementBackground = "lightBlue";

export type GLUAnnouncementBannerProps = {
  variant: AnnouncementVariant;
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  background: AnnouncementBackground | LegacyAnnouncementBackground;
  customIcon: MediaImageValue;
  dismissible: boolean;
};

const VARIANT_LABEL: Record<AnnouncementVariant, string> = {
  news: "News",
  alert: "Alert",
  weather: "Weather",
  emergency: "Emergency",
};

const VARIANT_BACKGROUND: Record<AnnouncementVariant, Exclude<AnnouncementBackground, "default">> = {
  news: "rose",
  alert: "gold",
  weather: "crimsonDark",
  emergency: "crimson",
};

/** Maps the legacy `lightBlue` stored value to its current name: rose. */
function normalizeAnnouncementBackground(
  background: AnnouncementBackground | LegacyAnnouncementBackground,
): AnnouncementBackground {
  return background === "lightBlue" ? "rose" : background;
}

/**
 * Text colour per background. Gold takes dark text: white on #C8922A is
 * about 2.6:1, under the 4.5:1 body-text minimum.
 */
const ON_DARK = new Set<string>(["crimson", "crimsonDark", "dark"]);

function Icon({ variant }: { variant: AnnouncementVariant }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
  switch (variant) {
    case "news":
      // Megaphone
      return (
        <svg {...common}>
          <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      );
    case "alert":
      // Bell
      return (
        <svg {...common}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "weather":
      // Cloud with rain
      return (
        <svg {...common}>
          <path d="M20 16.6A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
          <path d="M8 19v2M8 13v2M12 21v2M12 15v2M16 19v2M16 13v2" />
        </svg>
      );
    case "emergency":
      // Warning triangle
      return (
        <svg {...common}>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );
  }
}

/**
 * The localStorage key a dismissal is remembered under. It is derived from the
 * announcement's content, so editing the message brings the banner back for
 * everyone who dismissed the old one.
 */
export function dismissKey({ variant, title, description }: Pick<GLUAnnouncementBannerProps, "variant" | "title" | "description">): string {
  const text = `${variant}|${title}|${description}`;
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return `glu-announcement-dismissed:${(hash >>> 0).toString(36)}`;
}

function readDismissed(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(key: string) {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Storage blocked: the banner still closes for this page view.
  }
}

/**
 * A typed `usePuck` selector hook, created once at module scope per the
 * package's own guidance (avoids the unselected `usePuck()`'s re-render
 * warning). Only ever used from `PlacementCheck`, which is only ever mounted
 * while `puck.isEditing` is true — i.e. inside `<Puck>` — because calling it
 * outside that provider throws ("usePuck must be used inside <Puck>").
 */
const usePuckSelector = createUsePuck();

/**
 * Renders nothing itself; calls back with whether this banner (by id) sits
 * anywhere but index 0 of the page's top-level content. Split out from the
 * main component so the hook — which requires a `<Puck>` provider — is only
 * ever invoked from the editor, never from the public render path.
 *
 * `isEditing` (from the `puck` render prop) is the only signal this component
 * has that a `<Puck>` provider is actually present, and it can be true in a
 * context with no provider — a unit test or a Storybook story rendering with
 * `puck={{ isEditing: true }}` for other reasons (the codebase's own tests do
 * this; see __tests__/glu-announcement-banner.test.tsx). A render-time
 * try/catch around the hook call handles that case.
 *
 * This is safe despite `react-hooks/rules-of-hooks` normally forbidding a
 * hook in a try/catch: whether a `<Puck>` ancestor exists is fixed by the
 * component tree's structure and cannot change across re-renders of the same
 * mounted instance, so the hook either always throws here or never does —
 * the number of hooks called by this component is stable per instance, which
 * is exactly what the rule exists to guarantee. A React error boundary was
 * tried first, but the legacy synchronous server renderer used by this
 * repo's tests does not retry a boundary's children after a render-phase
 * throw, so it does not actually recover here — only the try/catch does.
 */
function PlacementCheck({
  id,
  children,
}: {
  id: string | undefined;
  children: (misplaced: boolean) => React.ReactNode;
}) {
  let content: unknown[] = [];
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- see the doc comment above: this hook's presence is fixed per mounted instance, never conditional across renders of the same instance.
    content = usePuckSelector((s) => s.appState.data.content) as unknown[];
  } catch {
    // No <Puck> provider in scope — nothing to flag.
    content = [];
  }
  const index = content.findIndex((block) => (block as { props?: { id?: string } })?.props?.id === id);
  // -1 (not found, or no provider to ask) is not flagged — only a confirmed
  // position after the first is.
  const misplaced = index > 0;
  return <>{children(misplaced)}</>;
}

function GLUAnnouncementBannerBody({
  variant = "news",
  title,
  description,
  buttonLabel,
  buttonHref,
  background = "default",
  customIcon,
  dismissible,
  isEditing,
  misplaced,
  onDismissClick,
}: GLUAnnouncementBannerProps & {
  isEditing: boolean;
  misplaced: boolean;
  onDismissClick: () => void;
}) {
  const normalizedBg = normalizeAnnouncementBackground(background);
  const bgToken = normalizedBg === "default" ? VARIANT_BACKGROUND[variant] : normalizedBg;
  const onDark = ON_DARK.has(bgToken);
  const fg = onDark ? colors.white : colors.dark;
  // Muted text on gold is ~3:1, so gold keeps full-strength text throughout.
  const fgMuted = onDark ? "rgba(255,255,255,0.85)" : bgToken === "gold" ? colors.dark : colors.muted;
  const accent = onDark ? colors.goldLight : bgToken === "gold" ? colors.dark : colors.crimson;

  // 40px covers the 20px slot at 2x.
  const icon = resolveMediaImage(customIcon, { width: 40, height: 40 });
  const label = VARIANT_LABEL[variant];

  return (
    <section
      aria-label={`${label} announcement`}
      data-variant={variant}
      style={{
        backgroundColor: colors[bgToken],
        color: fg,
        borderBottom: bgToken === "white" || bgToken === "offWhite" ? `1px solid ${colors.border}` : undefined,
        fontFamily: typography.fontBody,
        // Editor-only: a banner that isn't the page's first block is flagged
        // visibly rather than silently allowed — the published page drops it
        // instead (see lib/announcement-placement.ts).
        ...(isEditing && misplaced
          ? { outline: `2px dashed ${colors.error}`, outlineOffset: "-2px" }
          : {}),
      }}
    >
      {isEditing && misplaced && (
        <div
          style={{
            backgroundColor: colors.error,
            color: colors.white,
            fontFamily: typography.fontBody,
            fontSize: typography.sizeXs,
            fontWeight: typography.weightSemibold,
            textAlign: "center" as const,
            padding: `${spacing[1]} ${spacing[3]}`,
          }}
        >
          Announcement banners only show at the top of the page
        </div>
      )}
      <div
        style={{
          maxWidth: layout.containerMax,
          margin: "0 auto",
          padding: `${spacing[2]} ${spacing[4]}`,
          display: "flex",
          alignItems: "center",
          gap: spacing[3],
          minHeight: 44,
        }}
      >
        {/* The message and button wrap on a narrow screen; the close button
            stays pinned to the right of them. */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: spacing[3],
            flexWrap: "wrap" as const,
          }}
        >
          <span style={{ display: "inline-flex", flexShrink: 0, color: accent }}>
            {icon.src ? (
              // A plain <img>: next/image adds nothing at 20px.
              <img src={icon.src} alt="" width={20} height={20} style={{ width: 20, height: 20, objectFit: "contain" }} />
            ) : (
              <Icon variant={variant} />
            )}
          </span>

          <p
            style={{
              flex: "1 1 16rem",
              margin: 0,
              fontSize: typography.sizeSm,
              lineHeight: typography.lineHeightSnug,
            }}
          >
            <span
              style={{
                fontSize: typography.sizeXs,
                fontWeight: typography.weightBold,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                color: accent,
                marginRight: spacing[2],
              }}
            >
              {label}
            </span>
            {title && (
              <strong
                style={{
                  fontWeight: typography.weightSemibold,
                  marginRight: spacing[2],
                }}
              >
                {title}
              </strong>
            )}
            {description && <span style={{ color: fgMuted }}>{description}</span>}
          </p>

          {/* Without a link the button is only drawn in the editor, as a reminder to set one. */}
          {buttonLabel && (buttonHref || isEditing) && (
            <a
              href={buttonHref || undefined}
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                padding: `${spacing[1]} ${spacing[3]}`,
                borderRadius: radii.full,
                border: `1.5px solid ${fg}`,
                color: fg,
                fontSize: typography.sizeXs,
                fontWeight: typography.weightSemibold,
                textDecoration: "none",
                whiteSpace: "nowrap" as const,
                lineHeight: typography.lineHeightTight,
              }}
            >
              {buttonLabel}
            </a>
          )}
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={onDismissClick}
            aria-label={`Dismiss ${label.toLowerCase()} announcement`}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              padding: 0,
              border: "none",
              borderRadius: radii.full,
              background: "transparent",
              color: fg,
              cursor: isEditing ? "default" : "pointer",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              aria-hidden
              focusable={false}
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}

export function GLUAnnouncementBannerComponent(
  props: GLUAnnouncementBannerProps & { puck?: { isEditing?: boolean }; id?: string },
) {
  const { variant = "news", title, description, dismissible, puck, id } = props;
  const isEditing = Boolean(puck?.isEditing);
  const key = dismissKey({ variant, title, description });
  const [dismissed, setDismissed] = useState(false);

  // Read after mount: storage is not available on the server, and reading it
  // during render would make the first client render disagree with the HTML.
  useEffect(() => {
    if (dismissible && !isEditing) setDismissed(readDismissed(key));
  }, [dismissible, isEditing, key]);

  if (dismissed) return null;

  const onDismissClick = () => {
    // In the editor the button is shown but inert, so the block can't vanish
    // from the canvas while it is being edited.
    if (isEditing) return;
    writeDismissed(key);
    setDismissed(true);
  };

  // The placement check needs `<Puck>` context, which only exists in the
  // editor — so it (and its hook) is only ever mounted when isEditing.
  if (!isEditing) {
    return (
      <GLUAnnouncementBannerBody
        {...props}
        isEditing={false}
        misplaced={false}
        onDismissClick={onDismissClick}
      />
    );
  }

  return (
    <PlacementCheck id={id}>
      {(misplaced) => (
        <GLUAnnouncementBannerBody
          {...props}
          isEditing
          misplaced={misplaced}
          onDismissClick={onDismissClick}
        />
      )}
    </PlacementCheck>
  );
}

export const gluAnnouncementBannerConfig = {
  label: "GLU Announcement Banner",
  ai: {
    instructions:
      "PLACEMENT RULES: this is a site-notice strip only — news, an alert, a weather closure, or an emergency. It is NEVER used to promote a campaign, an event or a page; that is GLUCtaBanner's job (a gold GLUCtaBanner directly after the hero). It must always be the very first block on the page (content[0]), above the hero — never anywhere else, and never a second one on the same page. At most one per page. " +
      "Thin one-line announcement strip. Keep it to a single line of text on desktop.",
  },
  fields: {
    variant: {
      type: "select",
      label: "Type",
      options: [
        { label: "News", value: "news" },
        { label: "Alert", value: "alert" },
        { label: "Weather", value: "weather" },
        { label: "Emergency", value: "emergency" },
      ],
      ai: {
        instructions:
          "These four are the only values — there is no \"announcement\" or \"promo\" variant. news for general campus news; alert for a deadline or service change; weather for closures or delays due to weather; emergency only for an active safety situation. To promote a campaign, event or page, use GLUCtaBanner instead, not this component.",
      },
    },
    title: {
      type: "text",
      label: "Title",
      contentEditable: true,
      ai: {
        required: true,
        instructions: "3–8 words stating the announcement, e.g. 'Campus closed Friday'.",
      },
    } as any,
    description: {
      type: "textarea",
      label: "Description",
      contentEditable: true,
      ai: {
        instructions: "One short sentence of detail. Leave blank if the title says it all.",
      },
    } as any,
    buttonLabel: {
      type: "text",
      label: "Button Label",
      contentEditable: true,
      ai: buttonLabelAi("Read More", { optional: true }),
    } as any,
    buttonHref: {
      type: "text",
      label: "Button Link",
      ai: linkAi("Where the button goes. On the published page the button only shows when both a label and a link are set.", {
        optional: true,
      }),
    },
    background: {
      type: "select",
      label: "Background",
      options: [
        { label: "Default for type", value: "default" },
        { label: "Crimson", value: "crimson" },
        { label: "Deep Crimson", value: "crimsonDark" },
        { label: "Gold", value: "gold" },
        { label: "Near Black", value: "dark" },
        { label: "Light Rose", value: "rose" },
        { label: "Off-White", value: "offWhite" },
        { label: "White", value: "white" },
      ],
      ai: {
        instructions: "Leave on default unless asked for a specific colour.",
      },
    },
    // `as any` because the plugin registers this field type at runtime, so it
    // is not in Puck's built-in Field union.
    customIcon: {
      type: "p1-media",
      label: "Custom Icon (optional)",
      ai: imageAi("A small square icon to replace the type's default icon. Shown at 20px."),
    } as any,
    dismissible: {
      type: "radio",
      label: "Dismissible",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
      ai: {
        instructions: "false for emergency announcements, so visitors can't hide them; true otherwise.",
      },
    },
  },
  defaultProps: {
    variant: "weather",
    title: "Winter Weather Alert!",
    description: "Campus is closed today due to inclement weather.",
    buttonLabel: "learn more",
    buttonHref: "/weather-updates",
    background: "default",
    customIcon: null,
    dismissible: false,
  },
  render: GLUAnnouncementBannerComponent,
} as ComponentConfig<GLUAnnouncementBannerProps>;
