/**
 * The academic program catalog, read from Drupal.
 *
 * This is the site's one genuinely external datasource: events and counselors
 * are P1 pages read back through `readCollection`, whereas programs live in a
 * Drupal instance and arrive over HTTP. It exists to demonstrate that a P1 page
 * can bind a listing to a system of record it does not own.
 *
 * The fetcher runs on the server during render, so the browser never talks to
 * Drupal and CORS never enters into it. A failure returns an empty list rather
 * than throwing: a listing that renders nothing is recoverable, a page that
 * 500s because a third-party CMS was slow is not.
 */

import type { RemoteDatasourceDefinition, RemoteDatasourceFetcher } from "@pantheon-systems/puck-css/server";

export const PROGRAMS_DATASOURCE_ID = "gluPrograms";

/** Matches the row shape returned by /glu-program-api/programs. */
export interface ProgramRecord {
  code: string;
  title: string;
  college: string | null;
  department: string | null;
  degreeType: string | null;
  degreeLevel: string | null;
  degreeLevelLabel: string | null;
  summary: string | null;
  credits: number | null;
  duration: string | null;
  deliveryModes: string[];
  startTerms: string[];
  careerOutcomes: string[];
  accreditation: string | null;
  imageUrl: string | null;
  applyUrl: string | null;
  featured: boolean;
  url: string;
  changed: string;
}

/**
 * Where the catalog lives. Server-only, so deliberately not NEXT_PUBLIC_: the
 * base URL is not a secret, but nothing in the browser should be reaching for
 * it, and marking it public would invite exactly that.
 */
export function programApiBaseUrl(): string | null {
  const raw = process.env.GLU_PROGRAM_API_BASE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

/**
 * Programs, sorted for display: featured first, then alphabetically.
 *
 * The API already sorts by title; featured is applied here rather than asking
 * the API for it, so the ordering stays a presentation decision on this side.
 */
export async function fetchPrograms(
  { limit = 100, signal }: { limit?: number; signal?: AbortSignal } = {},
): Promise<ProgramRecord[]> {
  const base = programApiBaseUrl();
  if (!base) return [];

  let payload: { items?: ProgramRecord[] };
  try {
    const response = await fetch(`${base}/glu-program-api/programs?limit=${limit}`, {
      signal,
      headers: { Accept: "application/json" },
      // The catalog changes rarely and a stale program is harmless, so this is
      // cached rather than fetched per render. Matches the endpoint's own
      // five-minute max-age.
      next: { revalidate: 300, tags: [PROGRAMS_DATASOURCE_ID] },
    });
    if (!response.ok) return [];
    payload = (await response.json()) as { items?: ProgramRecord[] };
  } catch {
    return [];
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return String(a.title ?? "").localeCompare(String(b.title ?? ""));
  });
}

export const PROGRAMS_DATASOURCE: RemoteDatasourceDefinition = {
  id: PROGRAMS_DATASOURCE_ID,
  label: "GLU academic programs",
  description:
    "The academic program catalog, read live from Drupal over its REST API. One record per published program.",
  resolution:
    "Fetched server-side from GLU_PROGRAM_API_BASE_URL + /glu-program-api/programs on render, cached for five minutes. Featured programs sort first, then alphabetically by title.",
  fields: [
    { path: "items", description: "Every published program. Bind with {{ gluPrograms.items }}." },
    { path: "items[].code", description: "Program code, e.g. AIST-MS" },
    { path: "items[].title", description: "Program name" },
    { path: "items[].college", description: "Owning college or school" },
    { path: "items[].department", description: "Department" },
    { path: "items[].degreeType", description: "B.S., M.Eng., Ph.D. and so on" },
    { path: "items[].degreeLevelLabel", description: "Bachelor's, Master's, Doctoral, Certificate" },
    { path: "items[].degreeLevel", description: "Machine value of the level, for filtering" },
    { path: "items[].summary", description: "Short description for listing cards" },
    { path: "items[].credits", description: "Credit hours" },
    { path: "items[].duration", description: "Typical time to completion" },
    { path: "items[].deliveryModes", description: "On campus, Online, Hybrid" },
    { path: "items[].startTerms", description: "Terms the program admits into" },
    { path: "items[].careerOutcomes", description: "Roles graduates move into" },
    { path: "items[].accreditation", description: "Accrediting body, where one applies" },
    { path: "items[].imageUrl", description: "Card image" },
    { path: "items[].applyUrl", description: "Application link" },
    { path: "items[].featured", description: "Whether the program is promoted" },
    { path: "items[].url", description: "Path of this program's detail page" },
  ],
};

export const PROGRAMS_FETCHER: RemoteDatasourceFetcher = {
  id: PROGRAMS_DATASOURCE_ID,
  fetch: async () => ({ items: await fetchPrograms() }),
};
