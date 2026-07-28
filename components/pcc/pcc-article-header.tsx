"use client";

import React, { useState, useEffect } from "react";
import type { Article } from "@pantheon-systems/pcc-react-sdk";
import { usePCCPage } from "./pcc-page-context";

// ─── Types ───────────────────────────────────────────────────────────

export type BreadcrumbItem = {
  label: string;
  url: string;
};

export interface PCCArticleHeaderPuckProps {
  contentId: string;
  breadcrumbs: BreadcrumbItem[];
  heading: string;
  description: string;
  tags: Array<{ label: string; variant: "filled" | "outline" }>;
  date: string;
  readTime: string;
  showShareButtons: boolean;
  shareUrl: string;
  backgroundType: "image" | "video" | "color";
  backgroundUrl: string;
  backgroundColor: string;
  height: "small" | "medium" | "large";
  className?: string;
}

// ─── Icons ───────────────────────────────────────────────────────────

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polyline points="9,6 15,12 9,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function extractMetadataFromArticle(article: Article) {
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

  const readTime =
    (metadata.readTime as string) ||
    (metadata.read_time as string) ||
    (metadata.ReadTime as string) ||
    undefined;

  const description =
    (metadata.description as string) ||
    (metadata.Description as string) ||
    (metadata.summary as string) ||
    (metadata.Summary as string) ||
    (metadata.excerpt as string) ||
    (metadata.Excerpt as string) ||
    undefined;

  return { image, readTime, description };
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Component Implementation ────────────────────────────────────────

const heightMap = {
  small: "min-h-[400px]",
  medium: "min-h-[500px]",
  large: "min-h-[600px]",
};

export const PCCArticleHeaderPuck: React.FC<PCCArticleHeaderPuckProps> = ({
  contentId: propContentId,
  breadcrumbs,
  heading,
  description,
  tags,
  date,
  readTime,
  showShareButtons,
  shareUrl,
  backgroundType,
  backgroundUrl,
  backgroundColor,
  height,
  className = "",
}) => {
  const { contentId: contextContentId, getCachedArticle } = usePCCPage();
  const contentId = propContentId || contextContentId || "";
  const cachedArticle = contentId ? getCachedArticle(contentId) : null;

  const [article, setArticle] = useState<Article | null>(cachedArticle);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contentId) {
      setArticle(null);
      return;
    }

    if (cachedArticle) {
      setArticle(cachedArticle);
      return;
    }

    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pcc/article?contentId=${encodeURIComponent(contentId)}`);
        if (!response.ok) return;
        const data = await response.json();
        setArticle(data.article);
      } catch {
        // ignore — falls back to manual props
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [contentId, cachedArticle]);

  const isTextContent = (val: unknown): val is string => typeof val === "string" && val.trim() !== "";

  const articleMeta = article ? extractMetadataFromArticle(article) : null;
  const displayHeading = contentId
    ? (article?.title || (isTextContent(heading) ? heading : ""))
    : (isTextContent(heading) ? heading : (article?.title || ""));
  const displayDate = contentId
    ? ((article ? formatDate(article.publishedDate) : "") || date || "")
    : (date || (article ? formatDate(article.publishedDate) : ""));
  const displayReadTime = contentId
    ? (articleMeta?.readTime || readTime || "")
    : (readTime || articleMeta?.readTime || "");
  const displayDescription = contentId
    ? (articleMeta?.description || (isTextContent(description) ? description : ""))
    : (isTextContent(description) ? description : (articleMeta?.description || ""));
  const displayBgUrl = contentId
    ? (articleMeta?.image || backgroundUrl || "")
    : (backgroundUrl || articleMeta?.image || "");
  const displayTags =
    tags.length > 0
      ? tags
      : (article?.tags || []).map((t) => ({ label: t, variant: "outline" as const }));

  const currentShareUrl = shareUrl || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <section
      className={`relative w-full overflow-hidden ${heightMap[height]} ${className}`}
      style={{ backgroundColor }}
    >
      {backgroundType === "image" && displayBgUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayBgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" role="presentation" />
      )}

      {backgroundType === "video" && displayBgUrl && (
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src={displayBgUrl} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-black/30 z-[1]" />

      <div className="absolute inset-0 z-[2] flex flex-col justify-between px-6 py-8 md:px-10 lg:px-[120px] md:py-8">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-white/80">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-1">
                  {index > 0 && <ChevronRightIcon className="text-white/60" />}
                  {index < breadcrumbs.length - 1 ? (
                    <a href={crumb.url} className="hover:text-white transition-colors">{crumb.label}</a>
                  ) : (
                    <span className="text-white/60">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {displayTags.map((tag, index) => (
              <span
                key={index}
                className={`px-4 py-1.5 text-sm font-medium rounded-sm ${
                  tag.variant === "filled"
                    ? "bg-white/20 text-white backdrop-blur-sm"
                    : "bg-transparent text-white/90 border border-white/40"
                }`}
              >
                {tag.label}
              </span>
            ))}
            {displayDate && (
              <>
                <span className="text-white/60">—</span>
                <span className="text-base text-white/80">{displayDate}</span>
              </>
            )}
            {displayReadTime && (
              <>
                <span className="text-white/60">—</span>
                <span className="text-base text-white/80">{displayReadTime}</span>
              </>
            )}
          </div>

          {(displayHeading || loading) && (
            <h1 className="mb-4 max-w-4xl text-3xl font-normal text-white md:text-5xl lg:text-[56px] lg:leading-[1.1]">
              {loading ? <span className="inline-block h-12 w-3/4 animate-pulse rounded bg-white/20" /> : displayHeading}
            </h1>
          )}

          {displayDescription && (
            <p className="max-w-3xl text-lg text-white/90 md:text-xl lg:text-[22px] lg:leading-[1.5]">
              {displayDescription}
            </p>
          )}
        </div>

        {showShareButtons && (
          <div className="flex items-center gap-3">
            <span className="text-base text-white/80">Share</span>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent(displayHeading)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/20"
              aria-label="Share on X"
            >
              <XIcon />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/20"
              aria-label="Share on Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentShareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/20"
              aria-label="Share on LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(displayHeading)}&body=${encodeURIComponent(currentShareUrl)}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/20"
              aria-label="Share via email"
            >
              <EmailIcon />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default PCCArticleHeaderPuck;
