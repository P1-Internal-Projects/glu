import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPrograms, programApiBaseUrl, PROGRAMS_DATASOURCE } from "../lib/glu-programs";

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
