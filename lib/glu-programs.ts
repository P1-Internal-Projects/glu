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
import { CAMPUS_BANNER_URL } from "./glu-assets";

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
  /** Long-form description. Present on both the list rows and the detail row. */
  description: string | null;
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

/* ------------------------------------------------------------------ *
 * One program, for the route template at `academic-programs/:code`.
 * ------------------------------------------------------------------ */

export const PROGRAM_DATASOURCE_ID = "gluProgram";

/**
 * The detail payload: the Drupal record, plus the display strings the page
 * actually binds.
 *
 * The derived fields exist because token interpolation is string-only —
 * `toText` in puck-css returns "" for an array or an object, so a heading bound
 * to `{{ gluProgram.deliveryModes }}` would silently render empty. Joining here
 * rather than in a component keeps every field bindable from the editor, which
 * is the point of putting the page in a template at all.
 */
export interface ProgramDetail extends Partial<ProgramRecord> {
  /** A datasource payload: every key is bindable, so the shape stays open. */
  [key: string]: unknown;
  /** False when the code in the URL matched no published program. */
  found: boolean;
  /** Ready-to-bind text for the multi-value fields. */
  deliveryModesText: string;
  startTermsText: string;
  /** One outcome per line, for a List block. */
  careerOutcomesLines: string;
  creditsText: string;
  /** Program image where Drupal has one, the campus banner otherwise. */
  heroImageUrl: string;
  /** The campus banner, always. The page hero uses this so every program
   *  opens on the same branded image and the program's own photo can carry
   *  the section below it rather than appearing twice. */
  bannerImageUrl: string;
  /** Facts for a Stats Bar, already in its `{ value, label }` shape. */
  stats: { value: string; label: string }[];
  /**
   * Section labels, supplied by the datasource rather than typed into the
   * template.
   *
   * A route template renders one document for every program, and for the
   * codes that match nothing at all. It has no conditionals: a block is on the
   * page or it is not. Driving the headings from here is what lets the
   * not-found page drop "Where graduates go" instead of standing an empty
   * bulleted list under it, and lets the closing banner stop inviting an
   * application to a program that does not exist.
   */
  aboutHeading: string;
  outcomesHeading: string;
  ctaHeading: string;
  ctaSubtext: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

/** Shown when the URL carries a code no published program answers to. */
function programNotFound(code: string): ProgramDetail {
  return {
    found: false,
    code,
    title: "Program not found",
    summary:
      "No published program matches this address. It may have been renamed or retired.",
    description:
      "No published program matches this address. The program may have been renamed or retired, or the link that brought you here may be out of date. The full catalogue is the best place to pick up the search.",
    college: "",
    department: "",
    degreeType: "",
    degreeLevelLabel: "",
    accreditation: "",
    applyUrl: "/academic-programs",
    deliveryModesText: "",
    startTermsText: "",
    careerOutcomesLines: "",
    creditsText: "",
    heroImageUrl: CAMPUS_BANNER_URL,
    bannerImageUrl: CAMPUS_BANNER_URL,
    stats: [],
    aboutHeading: "We could not find that program",
    // Empty on purpose: the List block below it has nothing to show, and a
    // heading over an empty list is worse than no heading.
    outcomesHeading: "",
    ctaHeading: "Find the program you are after",
    ctaSubtext:
      "The full catalogue lists every published program, filterable by college and level.",
    ctaPrimaryLabel: "Browse all programs",
    ctaPrimaryHref: "/academic-programs",
    ctaSecondaryLabel: "Talk to admissions",
    ctaSecondaryHref: "/apply",
  };
}

function toDetail(record: ProgramRecord): ProgramDetail {
  const delivery = record.deliveryModes ?? [];
  const terms = record.startTerms ?? [];
  const outcomes = record.careerOutcomes ?? [];

  // Only facts the record actually carries become stats. A "Credits —" tile
  // reads as a data error; an absent tile reads as a program that is measured
  // some other way, which is the truth for the certificates.
  const stats = [
    record.credits ? { value: String(record.credits), label: "Credit hours" } : null,
    record.duration ? { value: record.duration, label: "Typical length" } : null,
    delivery.length ? { value: delivery.join(" / "), label: "Delivery" } : null,
    terms.length ? { value: terms.join(" / "), label: "Starts" } : null,
  ].filter((s): s is { value: string; label: string } => s !== null);

  return {
    ...record,
    found: true,
    deliveryModesText: delivery.join(", "),
    startTermsText: terms.join(", "),
    careerOutcomesLines: outcomes.join("\n"),
    creditsText: record.credits ? `${record.credits} credits` : "",
    heroImageUrl: record.imageUrl || CAMPUS_BANNER_URL,
    bannerImageUrl: CAMPUS_BANNER_URL,
    stats,
    aboutHeading: "About this program",
    outcomesHeading: outcomes.length ? "Where graduates go" : "",
    ctaHeading: "Ready to apply?",
    ctaSubtext:
      "Start your application, or browse the rest of the catalogue to compare programs.",
    ctaPrimaryLabel: "Apply to this program",
    ctaPrimaryHref: record.applyUrl || "/apply",
    ctaSecondaryLabel: "All academic programs",
    ctaSecondaryHref: "/academic-programs",
  };
}

/**
 * One program by its code, or null when the catalog has no such program.
 *
 * Returns null for a miss and for an outage alike: the caller renders the same
 * "not found" page either way, because a detail page that renders half a
 * program is worse than one that admits it has nothing.
 */
export async function fetchProgram(
  code: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<ProgramRecord | null> {
  const base = programApiBaseUrl();
  if (!base || !code) return null;

  try {
    const response = await fetch(
      `${base}/glu-program-api/programs/${encodeURIComponent(code)}`,
      {
        signal,
        headers: { Accept: "application/json" },
        next: { revalidate: 300, tags: [PROGRAMS_DATASOURCE_ID] },
      },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as ProgramRecord & { error?: string };
    return payload?.code ? payload : null;
  } catch {
    return null;
  }
}

/**
 * The detail datasource behind `academic-programs/:code`.
 *
 * With no code at all — the editor canvas on the template itself, or someone
 * visiting the literal `:code` path — it shows a real program rather than an
 * error. Authoring a template against an empty page means guessing at how long
 * a title wraps, and the demo's own preview would read "Program not found".
 * A code that is present but unknown is a different case and does say so.
 */
export const PROGRAM_FETCHER: RemoteDatasourceFetcher = {
  id: PROGRAM_DATASOURCE_ID,
  fetch: async ({ urlParams }) => {
    const code = (urlParams?.code ?? "").trim();

    if (!code) {
      const [sample] = await fetchPrograms({ limit: 1 });
      return sample
        ? { ...toDetail(sample), isSample: true }
        : { ...programNotFound(""), isSample: true };
    }

    const record = await fetchProgram(code);
    return record ? toDetail(record) : programNotFound(code);
  },
};

export const PROGRAM_DATASOURCE: RemoteDatasourceDefinition = {
  id: PROGRAM_DATASOURCE_ID,
  label: "GLU academic program (one)",
  description:
    "A single academic program, chosen by the `:code` segment of the URL. For the detail page at /academic-programs/:code — use `gluPrograms` for a listing of them all.",
  resolution:
    "Fetched server-side from GLU_PROGRAM_API_BASE_URL + /glu-program-api/programs/{code}, where {code} is the route's `:code` param. Cached five minutes. With no code in the URL it shows the first program as a sample, so the template previews against real content.",
  fields: [
    { path: "title", description: "Program name, e.g. B.A. Psychology" },
    { path: "code", description: "Program code from the URL, e.g. PSYC-BA" },
    { path: "summary", description: "Short description, good for a hero or intro" },
    { path: "description", description: "Long description, for the body" },
    { path: "college", description: "Owning college or school" },
    { path: "department", description: "Department" },
    { path: "degreeType", description: "B.S., M.Eng., Ph.D. and so on" },
    { path: "degreeLevelLabel", description: "Bachelor's, Master's, Doctoral, Certificate" },
    { path: "creditsText", description: "Credit hours as text, e.g. '120 credits'" },
    { path: "duration", description: "Typical time to completion" },
    { path: "deliveryModesText", description: "Delivery modes joined for display, e.g. 'On campus, Online'" },
    { path: "startTermsText", description: "Start terms joined for display, e.g. 'Fall, Spring'" },
    { path: "careerOutcomesLines", description: "Career outcomes, one per line. Bind to a List block's Items." },
    { path: "accreditation", description: "Accrediting body, where one applies" },
    { path: "heroImageUrl", description: "Program image, falling back to the campus banner" },
    { path: "bannerImageUrl", description: "The campus banner. For the page hero, so the program's own photo is not shown twice." },
    { path: "applyUrl", description: "Application link, for a CTA" },
    { path: "stats", description: "Credits, length, delivery and start terms as { value, label } rows. Bind to a Stats Bar's Stats." },
    { path: "aboutHeading", description: "Heading for the description section. Changes when the code matches nothing." },
    { path: "outcomesHeading", description: "Heading for the career outcomes list. Empty when there are none, so the heading disappears with the list." },
    { path: "ctaHeading", description: "Heading for the closing banner." },
    { path: "ctaSubtext", description: "Supporting line for the closing banner." },
    { path: "ctaPrimaryLabel", description: "Label for the banner's primary button." },
    { path: "ctaPrimaryHref", description: "Destination for the banner's primary button." },
    { path: "ctaSecondaryLabel", description: "Label for the banner's secondary button." },
    { path: "ctaSecondaryHref", description: "Destination for the banner's secondary button." },
    { path: "found", description: "False when the URL's code matches no program." },
  ],
};
