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

const PATHS_TTL_MS = 30_000;
const PAGE_CONCURRENCY = 10;
const READ_DEADLINE_MS = 7_800;

let client: P1ContentClient | null | undefined;

function contentClient(): P1ContentClient | null {
  if (client !== undefined) return client;
  const baseUrl = process.env.NEXT_PUBLIC_CSS_BASE_URL;
  const siteId = process.env.NEXT_PUBLIC_CSS_SITE_ID;
  const apiToken = process.env.CSS_API_KEY;
  client =
    baseUrl && siteId && apiToken
      ? new P1ContentClient({
          baseUrl,
          siteId,
          apiToken,
          ...(process.env.NEXT_PUBLIC_CSS_BRANCH_ID
            ? { branchId: process.env.NEXT_PUBLIC_CSS_BRANCH_ID }
            : {}),
        })
      : null;
  if (client) void publishedPaths(client).catch(() => {});
  return client;
}

let sharedPaths: { promise: Promise<{ path: string }[]>; at: number } | null = null;

function publishedPaths(c: P1ContentClient): Promise<{ path: string }[]> {
  if (sharedPaths && Date.now() - sharedPaths.at < PATHS_TTL_MS) return sharedPaths.promise;
  const promise = c.getPagePaths().then((r) => r.pages);
  const entry = { promise, at: Date.now() };
  sharedPaths = entry;
  promise.catch(() => {
    if (sharedPaths === entry) sharedPaths = null;
  });
  return promise;
}

let running = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (running >= PAGE_CONCURRENCY) await new Promise<void>((resolve) => waiting.push(resolve));
  running++;
  try {
    return await task();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

function beforeDeadline<T>(promise: Promise<T>, deadline: number): Promise<T | null> {
  const remaining = Math.max(0, deadline - Date.now());
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), remaining);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
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

  const deadline = Date.now() + READ_DEADLINE_MS;
  const paths = await beforeDeadline(publishedPaths(client), deadline);
  if (!paths) return [];

  const matches = paths
    .map((p) => p.path.replace(/^\/+/, ""))
    .filter((p) => {
      const { rest } = splitLocalePath(p);
      return rest === prefix || rest.startsWith(`${prefix}/`);
    })
    .slice(0, limit);

  const records = await Promise.all(
    matches.map(async (path): Promise<CollectionRecord | null> => {
      const page = await beforeDeadline(
        withSlot(async () => (Date.now() < deadline ? client.getPage(path) : null)),
        deadline,
      );
      const props = propsOfPinnedBlock(page?.data as Record<string, unknown>, blockType);
      if (!props) return null;
      const { locale, rest } = splitLocalePath(path);
      return { ...props, url: `/${path}`, canonicalUrl: `/${rest}`, locale };
    }),
  );

  return records.filter((r): r is CollectionRecord => r !== null);
}
