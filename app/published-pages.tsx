/**
 * The app's published-page routes, built once and shared by both route files.
 *
 * One instance on purpose: the factory memoizes per-request work (the CCR query
 * fetchers), and "/" and the catch-all should share that rather than each
 * building their own.
 */

import { createPublishedPage, resolvePageMetadata } from "@pantheon-systems/p1-next-sdk/server";
import { REMOTE_DATASOURCE_FETCHERS } from "../lib/remote-datasource-fetchers";
import { ContentUnavailable } from "../components/content-unavailable";
import { Client } from "./[...puckPath]/client";
import { WelcomeBlock } from "./welcome-block";
import { DEFAULT_LOCALE, localizedPath, readLocaleFromPath } from "../lib/locales";
import { availableLocales } from "../lib/locale-pages";

export const published = createPublishedPage({
  Client,
  Unavailable: ContentUnavailable,
  Fallback: WelcomeBlock,
  fetchers: REMOTE_DATASOURCE_FETCHERS,
  titles: { home: "Grand Lakes University" },
  /**
   * The stored mapping is the SDK's; this adds the language tags on top of it.
   *
   * Alternates are built from the locales a page actually has a published
   * version in, not from the site's market list — advertising an hreflang URL
   * that 404s is worse for a crawler than declaring no alternate at all.
   */
  resolveMetadata: async ({ pageData, path }) =>
    resolvePageMetadata({
      pageData,
      path,
      fetchers: REMOTE_DATASOURCE_FETCHERS,
      transform: async (metadata) => {
        const { rest } = readLocaleFromPath(path);
        const locales = await availableLocales(rest);
        if (locales.length < 2) return metadata;
        return {
          ...metadata,
          alternates: {
            ...metadata.alternates,
            canonical: localizedPath(rest, DEFAULT_LOCALE),
            languages: Object.fromEntries(
              locales.map((tag) => [tag, localizedPath(rest, tag)]),
            ),
          },
        };
      },
    }),
});
