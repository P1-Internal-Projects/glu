import { NextRequest, NextResponse } from "next/server";
import { PantheonClient, getArticle } from "@pantheon-systems/pcc-react-sdk/server";

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
  const contentId = searchParams.get("contentId");

  if (!contentId) {
    return NextResponse.json(
      { error: "contentId parameter is required" },
      { status: 400 }
    );
  }

  try {
    const client = getPantheonClient();
    const article = await getArticle(client, contentId);

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error(`Failed to fetch article with ID ${contentId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
