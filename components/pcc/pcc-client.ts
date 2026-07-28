import { PantheonClient } from "@pantheon-systems/pcc-react-sdk";
import type { Article } from "@pantheon-systems/pcc-react-sdk";

export type { Article };

export interface ArticleMetadata {
  author?: string;
  authorName?: string;
  image?: string;
  featuredImage?: string;
  hero_image?: string;
  dateline?: string;
}

let clientInstance: PantheonClient | null = null;

export function getPantheonClient(): PantheonClient {
  if (clientInstance) return clientInstance;

  const siteId = process.env.PCC_SITE_ID;
  const token = process.env.PCC_TOKEN;

  if (!siteId) {
    throw new Error("PCC_SITE_ID environment variable is required");
  }

  if (!token) {
    throw new Error("PCC_TOKEN environment variable is required");
  }

  clientInstance = new PantheonClient({ siteId, token });
  return clientInstance;
}

export async function fetchArticleById(
  contentId: string
): Promise<Article | null> {
  try {
    const client = getPantheonClient();
    const { getArticle } = await import(
      "@pantheon-systems/pcc-react-sdk/server"
    );
    const article = await getArticle(client, contentId);
    return article || null;
  } catch (error) {
    console.error(`Failed to fetch article ${contentId}:`, error);
    return null;
  }
}

export function extractMetadata(article: Article): ArticleMetadata {
  const metadata = (article.metadata || {}) as Record<string, unknown>;

  const image =
    (metadata.image as string) ||
    (metadata.Image as string) ||
    (metadata.featuredImage as string) ||
    (metadata.FeaturedImage as string) ||
    (metadata.featured_image as string) ||
    (metadata.hero_image as string) ||
    (metadata.heroImage as string) ||
    undefined;

  const author =
    (metadata.author as string) ||
    (metadata.Author as string) ||
    (metadata.authorName as string) ||
    (metadata.AuthorName as string) ||
    (metadata.author_name as string) ||
    undefined;

  const dateline =
    (metadata.dateline as string) ||
    (metadata.Dateline as string) ||
    (metadata.date_line as string) ||
    undefined;

  return {
    author,
    authorName: author,
    image,
    featuredImage: image,
    dateline,
  };
}

export function formatPublishedDate(timestamp: number | null): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
