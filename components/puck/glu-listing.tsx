"use client";

import React from "react";
import { createDataListBlock } from "@pantheon-systems/puck-css/fields";
import type { ResolvedItem, LayoutProps } from "@pantheon-systems/puck-css/fields";
import { colors, radii, spacing, typography } from "../../design-system/tokens";
import { Card } from "../../design-system/components/card";
import { Container } from "../../design-system/components/container";
import { Eyebrow } from "../../design-system/components/typography";
import { Section } from "../../design-system/components/section";
import type { SectionBackground } from "../../design-system/components/section";
import { formatEventDate } from "./glu-event-header";

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
 */

type EventRaw = {
  eventType?: string;
  startDate?: string;
  startTime?: string;
  location?: string;
  url?: string;
  locale?: string;
};

function raw(item: ResolvedItem): EventRaw {
  return (item._raw ?? {}) as EventRaw;
}

function EventCard({
  item,
  showTitle,
  showTeaser,
  showImage,
}: {
  item: ResolvedItem;
  showTitle: boolean;
  showTeaser: boolean;
  /** Already combined with the image position by the mode — see `withImage`. */
  showImage: boolean;
}) {
  const r = raw(item);
  const href = r.url || "";
  const dateLabel = formatEventDate(r.startDate ?? "", r.locale || "en-US");

  const card = (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {showImage && item.image ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "168px", objectFit: "cover", display: "block" }}
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

      <div style={{ padding: spacing[5], display: "flex", flexDirection: "column", flex: 1 }}>
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
                backgroundColor: colors.lightBlue,
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
                color: colors.muted,
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
              color: colors.dark,
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
              color: colors.muted,
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
            color: colors.muted,
          }}
        >
          {r.startTime && <span>{r.startTime}</span>}
          {r.location && <span>{r.location}</span>}
        </div>
      </div>
    </Card>
  );

  if (!href) return card;
  return (
    <a
      href={href}
      style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
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
  columns,
}: LayoutProps & { imagePosition?: string; columns?: number }) {
  // The factory always renders its "Image position" control when an image field
  // is mapped, and hands the choice down. These modes lay out one way, so the
  // only meaningful choice is whether the image appears at all — but the
  // control still has to be obeyed, or "None" is a switch that does nothing.
  const withImage = showImage && imagePosition !== "none";
  if (items.length === 0) {
    return (
      <p
        style={{
          fontFamily: typography.fontBody,
          fontSize: typography.sizeSm,
          color: colors.muted,
          textAlign: "center",
          padding: spacing[12],
          margin: 0,
        }}
      >
        No events are scheduled right now.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`,
        gap: spacing[6],
        maxWidth: columns ? `${columns * 400}px` : undefined,
      }}
    >
      {items.map((item, i) => (
        <EventCard
          key={`${raw(item).url ?? "item"}-${i}`}
          item={item}
          showTitle={showTitle}
          showTeaser={showTeaser}
          showImage={withImage}
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
}: LayoutProps & { imagePosition?: string }) {
  const withImage = showImage && imagePosition !== "none";
  if (items.length === 0) {
    return (
      <p
        style={{
          fontFamily: typography.fontBody,
          fontSize: typography.sizeSm,
          color: colors.muted,
          textAlign: "center",
          padding: spacing[12],
          margin: 0,
        }}
      >
        No people to show yet.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
        gap: spacing[6],
      }}
    >
      {items.map((item, i) => {
        const r = raw(item);
        const body = (
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              height: "100%",
              padding: spacing[6],
            }}
          >
            {withImage && item.image && (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: "104px",
                  height: "104px",
                  objectFit: "cover",
                  borderRadius: radii.full,
                  marginBottom: spacing[4],
                }}
              />
            )}
            {showTitle && item.title && (
              <h3
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.sizeLg,
                  fontWeight: typography.weightBold,
                  color: colors.dark,
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
                  color: colors.crimson,
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
                  color: colors.muted,
                  margin: 0,
                }}
              >
                {item.teaser}
              </p>
            )}
          </Card>
        );
        const href = r.url || "";
        return href ? (
          <a
            key={`${href}-${i}`}
            href={href}
            style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
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

export interface GLUListingSectionProps {
  eyebrow?: string;
  heading?: string;
  subtext?: string;
  background?: Extract<SectionBackground, "white" | "offWhite" | "lightBlue">;
  children: React.ReactNode;
}

/**
 * The section shell every GLU listing sits in.
 *
 * Deliberately the same shape as GLUCardGrid's header — centred, 680px, eyebrow
 * over a Playfair h2 over muted subtext — because the two blocks sit next to
 * each other on a page and any difference reads as a mistake.
 *
 * The header is omitted entirely when all three fields are blank, so a listing
 * used as a bare grid does not carry its bottom margin as dead space.
 */
export function GLUListingSection({
  eyebrow,
  heading,
  subtext,
  background = "white",
  children,
}: GLUListingSectionProps) {
  const hasHeader = Boolean(eyebrow || heading || subtext);
  return (
    <Section background={background}>
      <Container>
        {hasHeader && (
          <div style={{ textAlign: "center", maxWidth: 680, margin: `0 auto ${spacing[12]}` }}>
            {eyebrow && <Eyebrow style={{ marginBottom: spacing[3] }}>{eyebrow}</Eyebrow>}
            {heading && (
              <h2
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: typography.size4xl,
                  fontWeight: typography.weightBold,
                  color: colors.dark,
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
                  color: colors.muted,
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
  );
}

/**
 * One block, two GLU-branded ways to draw a collection. The mode picker is the
 * factory's; adding a third look means adding an entry here, not another block
 * for editors to choose between.
 */
const baseListing = createDataListBlock({
  label: "GLU Listing",
  modes: {
    eventCards: {
      label: "Event cards",
      component: EventCards,
      imagePositions: [
        { label: "Top", value: "top" },
        { label: "None", value: "none" },
      ],
    },
    peopleCards: {
      label: "People cards",
      component: PersonCards,
      imagePositions: [
        { label: "Top", value: "top" },
        { label: "None", value: "none" },
      ],
    },
  },
});

// Rendered as a component rather than called as a function: it is Puck's render
// for the block, and treating it as a child keeps it a render boundary of its
// own instead of inlining its work into this one.
const BaseListingRender = baseListing.render as React.ComponentType<Record<string, unknown>>;

const BACKGROUND_OPTIONS = [
  { label: "White", value: "white" },
  { label: "Off white", value: "offWhite" },
  { label: "Light blue", value: "lightBlue" },
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
  fields: {
    ...baseListing.fields,
    eyebrow: { type: "text", label: "Eyebrow" },
    subtext: { type: "textarea", label: "Subtext" },
    background: { type: "select", label: "Background", options: BACKGROUND_OPTIONS },
  },
  defaultProps: {
    ...baseListing.defaultProps,
    eyebrow: "",
    subtext: "",
    background: "white",
  },
  // The grouper reads this to lay the sidebar out; without an entry a field is
  // dropped into neither group and an editor cannot find it.
  _fieldGroups: {
    ...baseListing._fieldGroups,
    eyebrow: "content",
    subtext: "content",
    background: "layout",
  },
  render: (props: Record<string, unknown>) => (
    <GLUListingSection
      eyebrow={props.eyebrow as string | undefined}
      heading={props.heading as string | undefined}
      subtext={props.subtext as string | undefined}
      background={props.background as GLUListingSectionProps["background"]}
    >
      <BaseListingRender {...props} heading="" />
    </GLUListingSection>
  ),
};

export { EventCards, PersonCards };
