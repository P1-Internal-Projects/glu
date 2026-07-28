import { NextRequest, NextResponse } from "next/server";
import { PantheonClient, getArticles } from "@pantheon-systems/pcc-react-sdk/server";

function getPantheonClient(): PantheonClient {
  const siteId = process.env.PCC_SITE_ID;
  const token = process.env.PCC_TOKEN;

  if (!siteId) {
    throw new Error("PCC_SITE_ID environment variable is required");
  }

  if (!token) {
    throw new Error("PCC_TOKEN environment variable is required");
  }

  return new PantheonClient({ siteId, token });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const client = getPantheonClient();
    const articles = await getArticles(client);

    const transformedArticles = (articles || [])
      .slice(0, limit)
      .map((article) => {
        const metadata = (article.metadata || {}) as Record<string, unknown>;
        const metadataSlug = metadata.slug as string | undefined;
        const articleSlug =
          article.slug && article.slug !== article.id
            ? article.slug
            : undefined;
        const titleSlug = article.title
          ? article.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 60)
          : undefined;

        const humanReadableSlug =
          metadataSlug || articleSlug || titleSlug || article.id;

        return {
          id: article.id,
          title: article.title || "Untitled",
          slug: humanReadableSlug,
          publishedDate: article.publishedDate,
          tags: article.tags || [],
        };
      });

    return NextResponse.json({
      articles: transformedArticles,
      total: transformedArticles.length,
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
