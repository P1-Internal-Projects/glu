import { describe, expect, it, vi } from "vitest";

vi.mock("@pantheon-systems/cpub-react-sdk/server", () => ({
  PCCConvenienceFunctions: {
    getPaginatedArticles: vi.fn(),
    getArticleBySlugOrId: vi.fn(),
  },
}));

// We need to mock the user-remote-datasource-store since loadRemoteDatasourceContext uses it
vi.mock("@pantheon-systems/puck-css/server", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return actual;
});

import type { RemoteDatasourceFetcherParams } from "@pantheon-systems/puck-css/server";
import { REMOTE_DATASOURCE_FETCHERS } from "../lib/remote-datasource-fetchers";

const { PCCConvenienceFunctions } = await import(
  "@pantheon-systems/cpub-react-sdk/server"
);
const mockGetPaginatedArticles = PCCConvenienceFunctions
  .getPaginatedArticles as ReturnType<typeof vi.fn>;
const mockGetArticleBySlugOrId = PCCConvenienceFunctions
  .getArticleBySlugOrId as ReturnType<typeof vi.fn>;

function makeFetcherParams(
  overrides: Partial<RemoteDatasourceFetcherParams> = {},
): RemoteDatasourceFetcherParams {
  return {
    searchParams: {},
    urlParams: {},
    savedPreviewParams: {},
    fetchImpl: vi.fn() as unknown as typeof fetch,
    ...overrides,
  };
}

function getFetcher(id: string) {
  const f = REMOTE_DATASOURCE_FETCHERS.find((f) => f.id === id);
  if (!f) throw new Error(`No fetcher with id "${id}"`);
  return f;
}

/**
 * The registry is what the editor's datasource picker shows, so an accidental
 * re-import of a sample API would surface as a row in front of an editor
 * rather than as a failing render.
 */
describe("the registered fetchers", () => {
  it("are GLU's own collections, its Drupal catalog, and Content Publisher", () => {
    expect(REMOTE_DATASOURCE_FETCHERS.map((f) => f.id).sort()).toEqual([
      "article",
      "article_list",
      "gluEvents",
      "gluPeople",
      // One program, chosen by the `:code` segment of the URL. Backs the route
      // template at academic-programs/:code. Separate from the list below
      // because it is the only fetcher here that reads `urlParams`.
      "gluProgram",
      // The genuinely external source: a Drupal instance this site does not
      // own. Distinct from the SWAPI/Pokemon samples that were removed —
      // those demonstrated nothing about the customer's own systems.
      "gluPrograms",
    ]);
  });
});

describe("article fetcher", () => {
  const fetcher = getFetcher("article");

  it("returns {} when no article id", async () => {
    const result = await fetcher.fetch(makeFetcherParams());
    expect(result).toEqual({});
  });

  it("loads a single article", async () => {
    mockGetArticleBySlugOrId.mockResolvedValueOnce({
      id: "first-article",
      title: "First Article",
    });
    const result = await fetcher.fetch(makeFetcherParams({
      searchParams: { article: "first-article" },
    }));
    expect(result).toEqual({ id: "first-article", title: "First Article" });
    expect(mockGetArticleBySlugOrId).toHaveBeenCalledWith("first-article", {
      contentType: "TEXT_MARKDOWN",
    });
  });
});

describe("article_list fetcher", () => {
  const fetcher = getFetcher("article_list");

  it("maps list payload items to normalized article rows", async () => {
    mockGetPaginatedArticles.mockResolvedValueOnce({
      data: [
        { id: "a1", title: "First Article", slug: "first-article" },
        { id: 2, attributes: { title: "Second Article", slug: "second-article" } },
      ],
    });
    const result = await fetcher.fetch(makeFetcherParams());
    expect(result).toEqual({
      items: [
        { id: "a1", title: "First Article", slug: "first-article", url: undefined },
        { id: "2", title: "Second Article", slug: "second-article", url: undefined },
      ],
    });
  });
});
