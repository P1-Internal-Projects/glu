"use client";

import React from "react";
import { createDataListBlock } from "@pantheon-systems/puck-css/fields";
import type {
  ResolvedItem,
  LayoutProps,
} from "@pantheon-systems/puck-css/fields";
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "../../design-system/tokens";
import { Card } from "../../design-system/components/card";
import { Container } from "../../design-system/components/container";
import { Eyebrow } from "../../design-system/components/typography";
import { Section, normalizeBackground } from "../../design-system/components/section";
import type { SectionBackground, LegacySectionBackground } from "../../design-system/components/section";
import { headshotOrSilhouette } from "../../lib/glu-assets";
import { formatEventDate } from "./glu-event-header";
import { GLUProgramCards } from "./glu-program-cards";
import { EYEBROW_AI, withFieldAi } from "../../lib/ai-hints";

/**
 * A GLU-branded view mode for the data list block.
 *
 * Only the card is ours. Binding to a datasource, mapping its fields, and the
 * sort / filter / limit controls all come from the block factory, so this file
 * never fetches anything and never learns where events are stored. That is also
 * what makes the block locale-aware without extra code: a translated page is its
 * own document, so its copy of this block carries its own `locale` filter.
 *
 * The factory renders its own bare `<section>` and an `<h2>` styled by the
 * package's stylesheet, which is why this block used to sit flush against its
 * neighbours with a 1.25rem left-aligned heading while every other GLU section
 * had 5rem of padding, a centred Playfair heading and a container. Rather than
 * restyling those package classes from CSS — the design tokens are TypeScript,
 * so that would mean a second copy of them in a stylesheet — the factory's
 * config is composed: GLU draws the section, the container and the header, and
 * the factory keeps everything it is good at inside them.
 *
 * The presentation options — columns, background, card style, photo shape —
 * are deliberately a small closed set. Each one is a choice the design system
 * already has an answer for, so every combination an editor can pick is one the
 * system has seen; there is no free colour field and no arbitrary width.
 */

export type ListingColumns = "auto" | "2" | "3" | "4";
export type ListingCardStyle = "elevated" | "flat";
export type ListingPhotoShape = "circle" | "rounded";
export type ListingBackground =
  | Extract<SectionBackground, "white" | "offWhite" | "rose" | "crimson">
  | LegacySectionBackground;

/** Shared presentation props the section passes down to every mode. */
export interface ListingPresentation {
  columns?: ListingColumns;
  cardStyle?: ListingCardStyle;
  background?: ListingBackground;
}

/**
 * How the section's presentation reaches the cards.
 *
 * The factory hands a mode component the resolved items, the show/hide flags
 * and the mode's OWN extra fields — nothing else from the block. Columns, card
 * style and background are block-level (they apply to every mode, so declaring
 * them three times over would be the wrong shape), so the section publishes
 * them through context and each mode reads them there. A mode rendered outside
 * the section (Storybook) can still be handed them as props.
 */
const ListingPresentationContext = React.createContext<ListingPresentation>({});

function usePresentation(
  props: ListingPresentation,
): Required<ListingPresentation> {
  const ctx = React.useContext(ListingPresentationContext);
  return {
    columns: props.columns ?? ctx.columns ?? "auto",
    cardStyle: props.cardStyle ?? ctx.cardStyle ?? "elevated",
    background: normalizeBackground(props.background ?? ctx.background ?? "white") as ListingBackground,
  };
}

type EventRaw = {
  eventType?: string;
  startDate?: string;
  startTime?: string;
  location?: string;
  url?: string;
  locale?: string;
};

type PersonRaw = {
  url?: string;
  email?: string;
  phone?: string;
  territory?: string;
  focusArea?: string;
};

function raw<T>(item: ResolvedItem): T {
  return (item._raw ?? {}) as T;
}

/**
 * The grid template for a column choice.
 *
 * "auto" packs as many cards as fit above a minimum width. A fixed count asks
 * for exactly that many, but through the same auto-fit so that on a phone the
 * floor wins and the grid collapses rather than squeezing four cards into
 * 360px — inline styles have no media queries, and this needs none.
 */
export function gridColumns(
  columns: ListingColumns | undefined,
  minPx: number,
  gap: string,
): string {
  if (!columns || columns === "auto") {
    return `repeat(auto-fit, minmax(min(100%, ${minPx}px), 1fr))`;
  }
  const n = Number(columns);
  const share = `calc((100% - ${gap} * ${n - 1}) / ${n})`;
  return `repeat(auto-fit, minmax(min(100%, max(${Math.round(minPx * 0.85)}px, ${share})), 1fr))`;
}

/** Card chrome for a style choice. "flat" drops the border and shadow so the tint carries the grouping. */
function CardShell({
  cardStyle,
  onDark,
  style,
  children,
}: {
  cardStyle: ListingCardStyle;
  onDark: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (cardStyle === "flat") {
    return (
      <div
        style={{
          backgroundColor: onDark ? "rgba(255,255,255,0.08)" : colors.white,
          borderRadius: radii.lg,
          overflow: "hidden",
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
  return <Card style={style}>{children}</Card>;
}

function EmptyState({
  children,
  onDark,
}: {
  children: React.ReactNode;
  onDark: boolean;
}) {
  return (
    <p
      style={{
        fontFamily: typography.fontBody,
        fontSize: typography.sizeSm,
        color: onDark ? "rgba(255,255,255,0.8)" : colors.muted,
        textAlign: "center",
        padding: spacing[12],
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

type ModeProps = LayoutProps & ListingPresentation & { imagePosition?: string };

function EventCard({
  item,
  showTitle,
  showTeaser,
  showImage,
  cardStyle,
  onDark,
}: {
  item: ResolvedItem;
  showTitle: boolean;
  showTeaser: boolean;
  /** Already combined with the image position by the mode — see `withImage`. */
  showImage: boolean;
  cardStyle: ListingCardStyle;
  onDark: boolean;
}) {
  const r = raw<EventRaw>(item);
  const href = r.url || "";
  const dateLabel = formatEventDate(r.startDate ?? "", r.locale || "en-US");
  const ink = onDark && cardStyle === "flat" ? colors.white : colors.dark;
  const soft =
    onDark && cardStyle === "flat" ? "rgba(255,255,255,0.75)" : colors.muted;

  const card = (
    <CardShell
      cardStyle={cardStyle}
      onDark={onDark}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {showImage && item.image ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "168px",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            height: "6px",
            background: `linear-gradient(90deg, ${colors.crimson} 0%, ${colors.gold} 100%)`,
          }}
        />
      )}

      <div
        style={{
          padding: spacing[5],
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing[2],
            flexWrap: "wrap",
            marginBottom: spacing[3],
          }}
        >
          {r.eventType && (
            <span
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeXs,
                fontWeight: typography.weightSemibold,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: colors.crimson,
                backgroundColor: colors.rose,
                borderRadius: radii.full,
                padding: `${spacing[1]} ${spacing[3]}`,
              }}
            >
              {r.eventType}
            </span>
          )}
          {dateLabel && (
            <span
              style={{
                fontFamily: typography.fontBody,
                fontSize: typography.sizeXs,
                color: soft,
                fontWeight: typography.weightMedium,
              }}
            >
              {dateLabel}
            </span>
          )}
        </div>

        {showTitle && item.title && (
          <h3
            style={{
              fontFamily: typography.fontHeading,
              fontSize: typography.sizeXl,
              fontWeight: typography.weightBold,
              lineHeight: typography.lineHeightSnug,
              color: ink,
              margin: `0 0 ${spacing[2]}`,
            }}
          >
            {item.title}
          </h3>
        )}

        {showTeaser && item.teaser && (
          <p
            style={{
              fontFamily: typography.fontBody,
              fontSize: typography.sizeSm,
              lineHeight: typography.lineHeightRelaxed,
              color: soft,
              margin: `0 0 ${spacing[4]}`,
              flex: 1,
            }}
          >
            {item.teaser}
          </p>
        )}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: spacing[1],
            fontFamily: typography.fontBody,
            fontSize: typography.sizeXs,
            color: soft,
          }}
        >
          {r.startTime && <span>{r.startTime}</span>}
          {r.location && <span>{r.location}</span>}
        </div>
      </div>
    </CardShell>
  );

  if (!href) return card;
  return (
    <a
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        height: "100%",
      }}
    >
      {card}
    </a>
  );
}

function EventCards({
  items,
  showTitle,
  showTeaser,
  showImage,
  imagePosition,
  ...presentation
}: ModeProps) {
  const { columns, cardStyle, background } = usePresentation(presentation);
  // The factory always renders its "Image position" control when an image field
  // is mapped, and hands the choice down. These modes lay out one way, so the
  // only meaningful choice is whether the image appears at all — but the
  // control still has to be obeyed, or "None" is a switch that does nothing.
  const withImage = showImage && imagePosition !== "none";
  const onDark = background === "crimson";
  if (items.length === 0) {
    return (
      <EmptyState onDark={onDark}>
        No events are scheduled right now.
      </EmptyState>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns(columns, 280, spacing[6]),
        gap: spacing[6],
      }}
    >
      {items.map((item, i) => (
        <EventCard
          key={`${raw<EventRaw>(item).url ?? "item"}-${i}`}
          item={item}
          showTitle={showTitle}
          showTeaser={showTeaser}
          showImage={withImage}
          cardStyle={cardStyle}
          onDark={onDark}
        />
      ))}
    </div>
  );
}

function PersonCards({
  items,
  showTitle,
  showSubtitle,
  showTeaser,
  showImage,
  imagePosition,
  photoShape = "circle",
  showContact = false,
  ...presentation
}: ModeProps & { photoShape?: ListingPhotoShape; showContact?: boolean }) {
  const { columns, cardStyle, background } = usePresentation(presentation);
  const withImage = showImage && imagePosition !== "none";
  const onDark = background === "crimson";
  const flatOnDark = onDark && cardStyle === "flat";
  const ink = flatOnDark ? colors.white : colors.dark;
  const soft = flatOnDark ? "rgba(255,255,255,0.75)" : colors.muted;
  const accent = flatOnDark ? colors.goldLight : colors.crimson;

  if (items.length === 0) {
    return <EmptyState onDark={onDark}>No people to show yet.</EmptyState>;
  }

  const photoSize = photoShape === "circle" ? 112 : 132;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns(columns, 240, spacing[6]),
        gap: spacing[6],
      }}
    >
      {items.map((item, i) => {
        const r = raw<PersonRaw>(item);
        const body = (
          <CardShell
            cardStyle={cardStyle}
            onDark={onDark}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              height: "100%",
              padding: spacing[6],
            }}
          >
            {withImage && (
              <img
                // A record with no photo gets the silhouette rather than a hole
                // in the grid: the row still reads as a person.
                src={headshotOrSilhouette(item.image)}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: `${photoSize}px`,
                  height: `${photoSize}px`,
                  objectFit: "cover",
                  borderRadius: photoShape === "circle" ? radii.full : radii.xl,
                  marginBottom: spacing[4],
                  boxShadow: shadows.sm,
                  // Behind the transparent silhouette; a photo covers it.
                  backgroundColor: flatOnDark ? "rgba(255,255,255,0.12)" : colors.rose,
                }}
              />
            )}
            {showTitle && item.title && (
              <h3
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.sizeLg,
                  fontWeight: typography.weightBold,
                  color: ink,
                  margin: `0 0 ${spacing[1]}`,
                }}
              >
                {item.title}
              </h3>
            )}
            {showSubtitle && item.subtitle && (
              <p
                style={{
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeSm,
                  color: accent,
                  fontWeight: typography.weightSemibold,
                  margin: `0 0 ${spacing[3]}`,
                }}
              >
                {item.subtitle}
              </p>
            )}
            {showTeaser && item.teaser && (
              <p
                style={{
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeSm,
                  lineHeight: typography.lineHeightRelaxed,
                  color: soft,
                  margin: 0,
                }}
              >
                {item.teaser}
              </p>
            )}
            {showContact && (r.email || r.phone) && (
              <div
                style={{
                  marginTop: spacing[4],
                  paddingTop: spacing[4],
                  borderTop: `1px solid ${flatOnDark ? "rgba(255,255,255,0.2)" : colors.border}`,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing[1],
                  fontFamily: typography.fontBody,
                  fontSize: typography.sizeXs,
                  color: soft,
                }}
              >
                {r.email && (
                  <span
                    style={{
                      color: accent,
                      fontWeight: typography.weightMedium,
                    }}
                  >
                    {r.email}
                  </span>
                )}
                {r.phone && <span>{r.phone}</span>}
              </div>
            )}
          </CardShell>
        );
        const href = r.url || "";
        return href ? (
          <a
            key={`${href}-${i}`}
            href={href}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
              height: "100%",
            }}
          >
            {body}
          </a>
        ) : (
          <React.Fragment key={i}>{body}</React.Fragment>
        );
      })}
    </div>
  );
}

export interface GLUListingSectionProps extends ListingPresentation {
  eyebrow?: string;
  heading?: string;
  subtext?: string;
  align?: "center" | "left";
  children: React.ReactNode;
}

/**
 * The section shell every GLU listing sits in.
 *
 * Deliberately the same shape as GLUCardGrid's header — centred, 680px, eyebrow
 * over a Playfair h2 over muted subtext — because the two blocks sit next to
 * each other on a page and any difference reads as a mistake. The left-aligned
 * variant keeps the same measure and simply stops centring it, for pages where
 * the listing follows a left-aligned feature section.
 *
 * The header is omitted entirely when all three fields are blank, so a listing
 * used as a bare grid does not carry its bottom margin as dead space.
 */
export function GLUListingSection({
  eyebrow,
  heading,
  subtext,
  background = "white",
  columns = "auto",
  cardStyle = "elevated",
  align = "center",
  children,
}: GLUListingSectionProps) {
  const hasHeader = Boolean(eyebrow || heading || subtext);
  const onDark = background === "crimson";
  const presentation = React.useMemo(
    () => ({ columns, cardStyle, background }),
    [columns, cardStyle, background],
  );
  return (
    <ListingPresentationContext.Provider value={presentation}>
      <Section background={background}>
        <Container>
          {hasHeader && (
            <div
              style={{
                textAlign: align,
                maxWidth: 680,
                margin:
                  align === "center"
                    ? `0 auto ${spacing[12]}`
                    : `0 0 ${spacing[12]}`,
              }}
            >
              {eyebrow && (
                <Eyebrow light={onDark} style={{ marginBottom: spacing[3] }}>
                  {eyebrow}
                </Eyebrow>
              )}
              {heading && (
                <h2
                  style={{
                    fontFamily: typography.fontHeading,
                    fontSize: typography.size4xl,
                    fontWeight: typography.weightBold,
                    color: onDark ? colors.white : colors.dark,
                    lineHeight: typography.lineHeightTight,
                    margin: `0 0 ${spacing[4]}`,
                  }}
                >
                  {heading}
                </h2>
              )}
              {subtext && (
                <p
                  style={{
                    fontFamily: typography.fontBody,
                    fontSize: typography.sizeLg,
                    color: onDark ? "rgba(255,255,255,0.8)" : colors.muted,
                    lineHeight: typography.lineHeightRelaxed,
                    margin: 0,
                  }}
                >
                  {subtext}
                </p>
              )}
            </div>
          )}
          {children}
        </Container>
      </Section>
    </ListingPresentationContext.Provider>
  );
}

const IMAGE_TOP_OR_NONE = [
  { label: "Top", value: "top" },
  { label: "None", value: "none" },
];

/**
 * One block, three GLU-branded ways to draw a collection. The mode picker is the
 * factory's; adding a fourth look means adding an entry here, not another block
 * for editors to choose between.
 */
const baseListing = createDataListBlock({
  label: "GLU Listing",
  modes: {
    eventCards: {
      label: "Event cards",
      component: EventCards,
      imagePositions: IMAGE_TOP_OR_NONE,
    },
    peopleCards: {
      label: "People cards",
      component: PersonCards,
      imagePositions: IMAGE_TOP_OR_NONE,
      fields: {
        photoShape: {
          type: "radio",
          label: "Photo shape",
          options: [
            { label: "Circle", value: "circle" },
            { label: "Rounded", value: "rounded" },
          ],
        },
        showContact: {
          type: "radio",
          label: "Contact details",
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false },
          ],
        },
      },
      defaultProps: { photoShape: "circle", showContact: false },
    },
    // Text-only by design — see glu-program-cards.tsx. It offers no image
    // position because it renders no image; the factory still requires the
    // key, so it carries the single honest option rather than pretending.
    programCards: {
      label: "Program cards",
      component: GLUProgramCards,
      imagePositions: [{ label: "None", value: "none" }],
      fields: {
        showCollegeFilter: {
          type: "radio",
          label: "College filter",
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false },
          ],
        },
      },
      defaultProps: { showCollegeFilter: true },
    },
  },
});

// Rendered as a component rather than called as a function: it is Puck's render
// for the block, and treating it as a child keeps it a render boundary of its
// own instead of inlining its work into this one.
const BaseListingRender = baseListing.render as React.ComponentType<
  Record<string, unknown>
>;

const BACKGROUND_OPTIONS = [
  { label: "White", value: "white" },
  { label: "Off White", value: "offWhite" },
  { label: "Light Rose", value: "rose" },
  { label: "Crimson", value: "crimson" },
];

const COLUMN_OPTIONS = [
  { label: "Fit to width", value: "auto" },
  { label: "2 columns", value: "2" },
  { label: "3 columns", value: "3" },
  { label: "4 columns", value: "4" },
];

/**
 * The factory's config, wrapped in GLU's section chrome.
 *
 * `heading` is the factory's own field and is reused rather than duplicated —
 * an editor would not thank us for two boxes labelled Heading. It is drawn by
 * `GLUListingSection` and blanked on the way down, so the package never renders
 * its own `<h2>`; everything else about the block is untouched.
 */
export const gluListing = {
  ...baseListing,
  ai: {
    instructions:
      "A collection of records from a datasource, drawn as GLU cards. Bind `items` to `{{ gluPeople.items }}`, `{{ gluEvents.items }}` or `{{ gluPrograms.items }}` and pick the matching view mode. Use `background: crimson` at most once per page, for emphasis. `columns: auto` is right unless the design needs a fixed count.",
  },
  fields: {
    // The factory's binding, mapping and collection fields, annotated for the
    // agent: which datasource pairs with which mode, and which `{{ item.x }}`
    // paths each one exposes. These hints are the contract the fetchers keep.
    ...withFieldAi(baseListing.fields as Record<string, unknown>, {
      heading: { instructions: "Section heading, e.g. 'Meet Your Counselors' or 'Upcoming Events'." },
      datasourceId: {
        stream: false,
        instructions: "gluPeople (counselors), gluEvents (events) or gluPrograms (academic programs). Must match viewMode.",
      },
      viewMode: { instructions: "peopleCards for gluPeople, eventCards for gluEvents, programCards for gluPrograms." },
      titleField: { stream: false, instructions: "{{ item.name }} for people; {{ item.title }} for events and programs." },
      subtitleField: {
        stream: false,
        instructions: "{{ item.role }} for people; {{ item.eventType }} for events; {{ item.degreeType }} for programs.",
      },
      teaserField: { stream: false, instructions: "{{ item.focusArea }} for people; {{ item.summary }} for events and programs." },
      imageField: {
        stream: false,
        instructions: "{{ item.photoUrl }} for people; {{ item.imageUrl }} for events. Blank for programs (text-only cards).",
      },
      iconField: { exclude: true },
      imagePosition: { instructions: "top to show images, none to hide them." },
      imageLoading: { instructions: "lazy unless this is the first section on the page." },
      groupBy: { instructions: "Leave blank; grouping is not used on GLU pages." },
      startAt: { instructions: "1." },
      status: { instructions: "Published." },
      sortBy: {
        stream: false,
        instructions: "{{ item.name }} for people, {{ item.startDate }} for events, {{ item.title }} for programs.",
      },
      sortDir: { instructions: "asc." },
      filterField: {
        stream: false,
        instructions: "{{ item.locale }} — always, paired with filterContains, so a page lists only records in its own language.",
      },
      filterContains: { stream: false, instructions: "The page's locale tag: en-US, es-US or fr-CA." },
      maxItems: { instructions: "0 for the whole collection; 3 or 4 for a teaser beneath another section." },
      photoShape: { instructions: "circle for a roster; rounded to echo a profile page above." },
      showContact: { instructions: "Show for a directory page; hide when cards link to profile pages." },
      showCollegeFilter: { instructions: "Show on the full catalog page; hide for a short teaser." },
    }),
    eyebrow: { type: "text", label: "Eyebrow", contentEditable: true, ai: EYEBROW_AI },
    subtext: {
      type: "textarea",
      label: "Subtext",
      contentEditable: true,
      ai: { instructions: "1–2 sentences under the heading. Leave blank if the heading is enough." },
    },
    align: {
      type: "radio",
      label: "Header alignment",
      options: [
        { label: "Center", value: "center" },
        { label: "Left", value: "left" },
      ],
      ai: { instructions: "center, matching the other GLU sections; left only after a left-aligned feature section." },
    },
    columns: {
      type: "select",
      label: "Columns",
      options: COLUMN_OPTIONS,
      ai: { instructions: "auto unless the design needs a fixed count; 4 for a full roster, 3 for events." },
    },
    cardStyle: {
      type: "radio",
      label: "Card style",
      options: [
        { label: "Elevated", value: "elevated" },
        { label: "Flat", value: "flat" },
      ],
      ai: { instructions: "elevated on white; flat on a tinted or crimson background." },
    },
    background: {
      type: "select",
      label: "Background",
      options: BACKGROUND_OPTIONS,
      ai: { instructions: "Alternate with neighbouring sections. crimson at most once per page, for emphasis." },
    },
  },
  defaultProps: {
    ...baseListing.defaultProps,
    eyebrow: "",
    subtext: "",
    align: "center",
    columns: "auto",
    cardStyle: "elevated",
    background: "white",
  },
  // The grouper reads this to lay the sidebar out; without an entry a field is
  // dropped into neither group and an editor cannot find it.
  _fieldGroups: {
    ...baseListing._fieldGroups,
    eyebrow: "content",
    subtext: "content",
    align: "layout",
    columns: "layout",
    cardStyle: "layout",
    background: "layout",
  },
  render: (props: Record<string, unknown>) => (
    <GLUListingSection
      eyebrow={props.eyebrow as string | undefined}
      heading={props.heading as string | undefined}
      subtext={props.subtext as string | undefined}
      align={props.align as GLUListingSectionProps["align"]}
      background={props.background as ListingBackground | undefined}
      columns={props.columns as ListingColumns | undefined}
      cardStyle={props.cardStyle as ListingCardStyle | undefined}
    >
      <BaseListingRender {...props} heading="" />
    </GLUListingSection>
  ),
};

export { EventCards, PersonCards };
