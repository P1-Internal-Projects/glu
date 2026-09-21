import type { RemoteDatasourceDefinition } from "@pantheon-systems/puck-css/server";
import { GLU_COLLECTION_DATASOURCES } from "./glu-datasources";

/**
 * The datasources the editor offers, beyond GLU's own collections.
 *
 * `urlParams` is supplied by the route matcher rather than a fetcher, and the
 * two `article` rows come from Content Publisher. The starter kit's SWAPI and
 * Pokemon samples were removed — they were the only entries here that pointed
 * at a third-party API, and having them in the picker alongside the real
 * collections is what made the list hard to read.
 */

export const REMOTE_DATASOURCE_REGISTRY: RemoteDatasourceDefinition[] = [
  ...GLU_COLLECTION_DATASOURCES,
  {
    id: "urlParams",
    label: "Route URL params",
    description:
      "Captured params from route templates (for example the blog template's `/blog/:year/:month/:slug`). Available to all templates.",
    resolution:
      "Derived from concrete URL path matches and editor preview params; query params with the same key override preview values.",
    fields: [{ path: "id", description: "Example route param value" }],
  },
  {
    id: "article",
    label: "Article detail",
    description:
      "Single Content Publisher article resolved from query/preview/route params.",
    resolution:
      "Resolved from `?article=...`, `?articleId=...`, `?slug=...`, then `?id=...`; then preview params; then route params (`:article`, `:articleId`, `:slug`, `:id`). Loaded using `PCCConvenienceFunctions.getArticleBySlugOrId` from `@pantheon-systems/cpub-react-sdk/server`.",
    fields: [
      { path: "id", description: "Article identifier." },
      { path: "title", description: "Article title." },
      { path: "slug", description: "Slug/path alias if present." },
      {
        path: "body",
        description: "Body/content payload (shape depends on API).",
      },
      { path: "url", description: "Canonical article URL if present." },
    ],
  },
  {
    id: "article_list",
    label: "Articles list",
    description:
      "Article list from Content Publisher, loaded every request for list rendering.",
    resolution:
      "Fetched every request using `PCCConvenienceFunctions.getPaginatedArticles` from `@pantheon-systems/cpub-react-sdk/server`.",
    fields: [
      {
        path: "items",
        description:
          "Array of normalized `{ id, title, slug?, url? }` rows. Use `{{ article_list.items }}` to hydrate array/list blocks.",
      },
      { path: "items[].id", description: "Article identifier" },
      { path: "items[].title", description: "Article title" },
      { path: "items[].slug", description: "Slug/path alias" },
      { path: "items[].url", description: "Canonical article URL" },
    ],
  },
];
