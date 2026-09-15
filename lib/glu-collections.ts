/**
 * Reading template-bound pages back as structured records.
 *
 * P1 generates a datasource and a query for every content-type template, but
 * that query is fixed at `includeMetadata: true, includeSnapshot: false` and is
 * not editable through the API — so it returns a page's title and path and
 * nothing else. A listing that shows a date, a place and a type needs the
 * fields themselves, so this module reads the pages instead: list the published
 * paths under a prefix, fetch each page, and pull the props off the one pinned
 * component that carries the record.
 *
 * The template is still what guarantees this works. It pins exactly one record
 * component onto every page created from it, so "find the block of this type"
 * has one answer rather than being a guess about how an author laid the page out.
 */

import { P1ContentClient } from "@pantheon-systems/css-client";
import { LOCALE_PREFIXES, DEFAULT_LOCALE } from "./locales";

/** A page read back as a record, with the routing facts the listing needs. */
export type CollectionRecord = Record<string, unknown> & {
  /** Public path of the page this record came from, leading slash included. */
  url: string;
  /** Path with any locale prefix removed — the same value across translations. */
  canonicalUrl: string;
  /** BCP-47 tag for the language this page is written in. */
  locale: string;
};

function contentClient(): P1ContentClient | null {
  const baseUrl = process.env.NEXT_PUBLIC_CSS_BASE_URL;
  const siteId = process.env.NEXT_PUBLIC_CSS_SITE_ID;
  const apiToken = process.env.CSS_API_KEY;
  if (!baseUrl || !siteId || !apiToken) return null;
  return new P1ContentClient({
    baseUrl,
    siteId,
    apiToken,
    ...(process.env.NEXT_PUBLIC_CSS_BRANCH_ID
      ? { branchId: process.env.NEXT_PUBLIC_CSS_BRANCH_ID }
      : {}),
  });
}

/** Split `es/events/open-house` into its locale and the path without the prefix. */
export function splitLocalePath(path: string): { locale: string; rest: string } {
  const clean = path.replace(/^\/+/, "");
  const [head, ...tail] = clean.split("/");
  const locale = head ? LOCALE_PREFIXES[head] : undefined;
  return locale ? { locale, rest: tail.join("/") } : { locale: DEFAULT_LOCALE, rest: clean };
}

function propsOfPinnedBlock(
  data: Record<string, unknown> | undefined,
  blockType: string,
): Record<string, unknown> | null {
  const content = (data?.content ?? []) as { type?: string; props?: Record<string, unknown> }[];
  const block = Array.isArray(content) ? content.find((c) => c?.type === blockType) : undefined;
  return block?.props ?? null;
}

/**
 * Every published page under `prefix`, in any locale, read back as a record.
 *
 * A page that is published but carries no record block is skipped rather than
 * returned half-empty: a listing row with no title and no date is worse than an
 * absent one, and it would hide the authoring mistake behind a blank card.
 */
export async function readCollection(
  prefix: string,
  blockType: string,
  { limit = 60 }: { limit?: number } = {},
): Promise<CollectionRecord[]> {
  const client = contentClient();
  if (!client) return [];

  let paths: { path: string }[];
  try {
    paths = (await client.getPagePaths()).pages;
  } catch {
    return [];
  }

  const matches = paths
    .map((p) => p.path.replace(/^\/+/, ""))
    .filter((p) => {
      const { rest } = splitLocalePath(p);
      return rest === prefix || rest.startsWith(`${prefix}/`);
    })
    .slice(0, limit);

  const records = await Promise.all(
    matches.map(async (path): Promise<CollectionRecord | null> => {
      try {
        const page = await client.getPage(path);
        const props = propsOfPinnedBlock(page?.data as Record<string, unknown>, blockType);
        if (!props) return null;
        const { locale, rest } = splitLocalePath(path);
        return { ...props, url: `/${path}`, canonicalUrl: `/${rest}`, locale };
      } catch {
        return null;
      }
    }),
  );

  return records.filter((r): r is CollectionRecord => r !== null);
}
