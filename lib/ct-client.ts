/**
 * Server-side helper for reading and writing content type collections in CSS.
 * Only call from API routes or server components — uses CSS_API_KEY.
 */

const BASE = (process.env.NEXT_PUBLIC_CSS_BASE_URL ?? "").replace(/\/$/, "");
const SITE_ID = process.env.NEXT_PUBLIC_CSS_SITE_ID ?? "";
const API_KEY = process.env.CSS_API_KEY ?? "";

async function cssApi(path: string, init: RequestInit = {}, authToken?: string): Promise<unknown> {
  const authHeaders: Record<string, string> = authToken
    ? { "Authorization": `Bearer ${authToken}` }
    : { "X-API-Key": API_KEY };

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? `CSS API ${res.status}`);
  }

  return body;
}

async function getMainBranchId(authToken?: string): Promise<string> {
  const data = (await cssApi(`/api/sites/${SITE_ID}/branches`, {}, authToken)) as {
    branches: { id: string; isMain: boolean }[];
  };
  const main = data.branches?.find((b) => b.isMain);
  if (!main) throw new Error("No main branch found");
  return main.id;
}

// ─── Generic record type ──────────────────────────────────────────────────────

export type CTRecord = Record<string, unknown> & { id: string };

// ─── Generic read/write (used by the dynamic API route) ───────────────────────

export async function getRecords(cssPath: string): Promise<CTRecord[]> {
  try {
    const res = await fetch(
      `${BASE}/api/sites/${SITE_ID}/content/${cssPath}`,
      { headers: { "X-API-Key": API_KEY }, cache: "no-store" },
    );
    if (!res.ok) return [];
    const page = (await res.json()) as { data?: { records?: CTRecord[] } };
    return page?.data?.records ?? [];
  } catch {
    return [];
  }
}

export async function saveRecords(cssPath: string, records: CTRecord[], authToken?: string): Promise<void> {
  const branchId = await getMainBranchId(authToken);

  const allDocs = (await cssApi(`/api/sites/${SITE_ID}/branches/${branchId}/documents`, {}, authToken)) as {
    documents: { id: string; path: string }[];
  };
  const existing = allDocs.documents?.find((d) => d.path === cssPath);
  let documentId: string;
  if (existing) {
    documentId = existing.id;
  } else {
    const created = (await cssApi(
      `/api/sites/${SITE_ID}/branches/${branchId}/documents`,
      { method: "POST", body: JSON.stringify({ path: cssPath }) },
      authToken,
    )) as { document: { id: string } };
    documentId = created.document.id;
  }

  await cssApi(
    `/api/sites/${SITE_ID}/branches/${branchId}/documents/${documentId}/versions`,
    { method: "POST", body: JSON.stringify({ snapshot: { records } }) },
    authToken,
  );

  await cssApi(
    `/api/sites/${SITE_ID}/branches/${branchId}/documents/${documentId}/publish`,
    { method: "POST" },
    authToken,
  );
}

// ─── Typed Event wrappers (keep EventListing component working unchanged) ─────

export type EventRecord = CTRecord & {
  title: string;
  eventType: string;
  description: string;
  location: string;
  date: string;
  time: string;
  registrationLink: string;
  imageUrl: string;
};

export async function getEvents(): Promise<EventRecord[]> {
  return getRecords("_ct/events") as Promise<EventRecord[]>;
}

export async function saveEvents(records: EventRecord[]): Promise<void> {
  return saveRecords("_ct/events", records);
}
