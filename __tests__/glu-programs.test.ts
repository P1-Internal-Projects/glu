import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchProgram,
  fetchPrograms,
  programApiBaseUrl,
  PROGRAM_DATASOURCE,
  PROGRAM_FETCHER,
  PROGRAMS_DATASOURCE,
} from "../lib/glu-programs";

const ORIGINAL = process.env.GLU_PROGRAM_API_BASE_URL;

afterEach(() => {
  process.env.GLU_PROGRAM_API_BASE_URL = ORIGINAL;
  vi.unstubAllGlobals();
});

function stubFetch(impl: (url: string) => unknown) {
  const spy = vi.fn(async (url: string) => impl(url));
  vi.stubGlobal("fetch", spy);
  return spy;
}

const row = (over: Record<string, unknown> = {}) => ({
  code: "ENVS-BS",
  title: "B.S. Environmental Science",
  college: "College of Environmental Science",
  featured: false,
  ...over,
});

describe("programApiBaseUrl", () => {
  it("strips a trailing slash so the path join cannot double it", () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test/";
    expect(programApiBaseUrl()).toBe("https://example.test");
  });

  it("is null when unset, which is what makes the datasource optional", () => {
    delete process.env.GLU_PROGRAM_API_BASE_URL;
    expect(programApiBaseUrl()).toBeNull();
  });
});

describe("fetchPrograms", () => {
  it("returns the API's items", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({ ok: true, json: async () => ({ items: [row()] }) }));
    const items = await fetchPrograms();
    expect(items.map((i) => i.code)).toEqual(["ENVS-BS"]);
  });

  it("calls the catalog endpoint on the configured origin", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    const spy = stubFetch(() => ({ ok: true, json: async () => ({ items: [] }) }));
    await fetchPrograms();
    expect(String(spy.mock.calls[0]?.[0])).toContain("https://example.test/glu-program-api/programs");
  });

  it("sorts featured programs first, then by title", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({
      ok: true,
      json: async () => ({
        items: [
          row({ code: "A", title: "Anthropology", featured: false }),
          row({ code: "Z", title: "Zoology", featured: true }),
          row({ code: "B", title: "Biology", featured: false }),
        ],
      }),
    }));
    expect((await fetchPrograms()).map((i) => i.code)).toEqual(["Z", "A", "B"]);
  });

  // A listing that renders nothing is recoverable; a page that 500s because a
  // third-party CMS was slow or down is not.
  it("returns nothing rather than throwing when the API errors", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({ ok: false, status: 500, json: async () => ({}) }));
    await expect(fetchPrograms()).resolves.toEqual([]);
  });

  it("returns nothing rather than throwing when the fetch itself fails", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNREFUSED"); }));
    await expect(fetchPrograms()).resolves.toEqual([]);
  });

  it("does not call out at all when the base URL is unset", async () => {
    delete process.env.GLU_PROGRAM_API_BASE_URL;
    const spy = stubFetch(() => ({ ok: true, json: async () => ({ items: [row()] }) }));
    expect(await fetchPrograms()).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("survives a payload with no items array", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({ ok: true, json: async () => ({ error: "nope" }) }));
    await expect(fetchPrograms()).resolves.toEqual([]);
  });
});

describe("the datasource definition", () => {
  // The editor's field picker reads these paths; one that does not exist on a
  // row is a token an editor can bind that silently resolves to nothing.
  it("advertises items and the fields the API actually returns", () => {
    const paths = PROGRAMS_DATASOURCE.fields.map((f) => f.path);
    expect(paths).toContain("items");
    for (const key of ["code", "title", "college", "summary", "imageUrl", "degreeLevelLabel"]) {
      expect(paths).toContain(`items[].${key}`);
    }
  });
});

describe("fetchProgram", () => {
  it("asks for the single-program route, with the code escaped", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    const spy = stubFetch(() => ({ ok: true, json: async () => row({ code: "A B" }) }));
    await fetchProgram("A B");
    expect(String(spy.mock.calls[0]?.[0])).toBe(
      "https://example.test/glu-program-api/programs/A%20B",
    );
  });

  it("is null for an unknown code, so the page can say so rather than render half a program", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({ ok: false, status: 404, json: async () => ({ error: "nope" }) }));
    expect(await fetchProgram("NOPE-XX")).toBeNull();
  });

  it("is null when the catalog is unreachable", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => {
      throw new Error("offline");
    });
    expect(await fetchProgram("ENVS-BS")).toBeNull();
  });

  it("is null without a code, rather than fetching the collection by accident", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    const spy = stubFetch(() => ({ ok: true, json: async () => row() }));
    expect(await fetchProgram("")).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("the gluProgram fetcher", () => {
  const params = (code?: string) =>
    ({
      urlParams: code === undefined ? {} : { code },
      searchParams: {},
      savedPreviewParams: {},
      fetchImpl: fetch,
    }) as never;

  it("reads the route's :code param", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    const spy = stubFetch(() => ({ ok: true, json: async () => row({ code: "PSYC-BA" }) }));
    const out = await PROGRAM_FETCHER.fetch(params("PSYC-BA"));
    expect(String(spy.mock.calls[0]?.[0])).toContain("/programs/PSYC-BA");
    expect(out.found).toBe(true);
    expect(out.code).toBe("PSYC-BA");
  });

  /**
   * Arrays interpolate to "" — puck-css's toText only stringifies primitives —
   * so a heading bound to the raw field would silently render empty. These
   * derived fields are the whole reason the detail page can bind every value.
   */
  it("flattens the multi-value fields into bindable text", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({
      ok: true,
      json: async () =>
        row({
          deliveryModes: ["On campus", "Online"],
          startTerms: ["Fall", "Spring"],
          careerOutcomes: ["Analyst", "Ranger"],
          credits: 120,
        }),
    }));
    const out = await PROGRAM_FETCHER.fetch(params("ENVS-BS"));
    expect(out.deliveryModesText).toBe("On campus, Online");
    expect(out.startTermsText).toBe("Fall, Spring");
    expect(out.careerOutcomesLines).toBe("Analyst\nRanger");
    expect(out.creditsText).toBe("120 credits");
  });

  it("builds stats only from facts the record carries", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({
      ok: true,
      json: async () => row({ credits: 30, duration: null, deliveryModes: [], startTerms: [] }),
    }));
    const out = await PROGRAM_FETCHER.fetch(params("ENVS-BS"));
    expect(out.stats).toEqual([{ value: "30", label: "Credit hours" }]);
  });

  it("says so for a code that matches nothing", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({ ok: false, status: 404, json: async () => ({}) }));
    const out = await PROGRAM_FETCHER.fetch(params("NOPE-XX"));
    expect(out.found).toBe(false);
    expect(out.title).toBe("Program not found");
  });

  /**
   * The editor renders the template itself at `/p1/academic-programs/:code`,
   * where there is no code to capture. Showing a real program there is what
   * lets someone lay the page out against content instead of against blanks.
   */
  it("falls back to a sample program when the URL carries no code", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({ ok: true, json: async () => ({ items: [row({ code: "SAMPLE-BS" })] }) }));
    const out = await PROGRAM_FETCHER.fetch(params());
    expect(out.isSample).toBe(true);
    expect(out.code).toBe("SAMPLE-BS");
    expect(out.found).toBe(true);
  });
});

/**
 * The field list is the editor's autocomplete for `{{ gluProgram.… }}`, so a
 * documented path the fetcher never sets is a binding that silently renders
 * empty on the published page.
 */
describe("PROGRAM_DATASOURCE field docs", () => {
  it("documents only paths the fetcher actually returns", async () => {
    process.env.GLU_PROGRAM_API_BASE_URL = "https://example.test";
    stubFetch(() => ({
      ok: true,
      json: async () =>
        row({
          summary: "s",
          description: "d",
          department: "dept",
          degreeType: "B.S.",
          degreeLevelLabel: "Bachelor's",
          duration: "4 years",
          accreditation: "ABET",
          applyUrl: "/apply",
          imageUrl: "https://img.test/a.jpg",
          credits: 120,
          deliveryModes: ["On campus"],
          startTerms: ["Fall"],
          careerOutcomes: ["Analyst"],
        }),
    }));
    const payload = await PROGRAM_FETCHER.fetch({
      urlParams: { code: "ENVS-BS" },
      searchParams: {},
      savedPreviewParams: {},
      fetchImpl: fetch,
    } as never);

    for (const { path } of PROGRAM_DATASOURCE.fields) {
      expect(Object.keys(payload)).toContain(path);
    }
  });
});
