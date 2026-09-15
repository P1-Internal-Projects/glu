"use client";

import React from "react";
import { createDataListBlock } from "@pantheon-systems/puck-css/fields";
import type { ResolvedItem, LayoutProps } from "@pantheon-systems/puck-css/fields";
import { colors, radii, shadows, spacing, typography } from "../../design-system/tokens";
import { formatEventDate } from "./glu-event-header";

/**
 * A GLU-branded view mode for the data list block.
 *
 * Only the card is ours. Binding to a datasource, mapping its fields, and the
 * sort / filter / limit controls all come from the block factory, so this file
 * never fetches anything and never learns where events are stored. That is also
 * what makes the block locale-aware without extra code: a translated page is its
 * own document, so its copy of this block carries its own `locale` filter.
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
  showImage: boolean;
}) {
  const r = raw(item);
  const href = r.url || "";
  const dateLabel = formatEventDate(r.startDate ?? "", r.locale || "en-US");

  const card = (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        boxShadow: shadows.sm,
        overflow: "hidden",
      }}
    >
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
    </article>
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
  columns,
}: LayoutProps & { columns?: number }) {
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
          showImage={showImage}
        />
      ))}
    </div>
  );
}

function PersonCards({ items, showTitle, showSubtitle, showTeaser, showImage }: LayoutProps) {
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
          <article
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              height: "100%",
              padding: spacing[6],
              backgroundColor: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              boxShadow: shadows.sm,
            }}
          >
            {showImage && item.image && (
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
          </article>
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

/**
 * One block, two GLU-branded ways to draw a collection. The mode picker is the
 * factory's; adding a third look means adding an entry here, not another block
 * for editors to choose between.
 */
export const gluListing = createDataListBlock({
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
