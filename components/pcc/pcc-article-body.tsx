"use client";

import React, { useState, useEffect } from "react";
import { ArticleRenderer } from "@pantheon-systems/pcc-react-sdk/components";
import type { Article } from "@pantheon-systems/pcc-react-sdk";
import { usePCCPage } from "./pcc-page-context";

export interface PCCArticleBodyPuckProps {
  contentId: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  bodyClassName?: string;
  containerClassName?: string;
  className?: string;
}

const maxWidthStyles = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none",
};

export const PCCArticleBodyPuck: React.FC<PCCArticleBodyPuckProps> = ({
  contentId: propContentId,
  maxWidth = "lg",
  bodyClassName = "",
  containerClassName = "",
  className = "",
}) => {
  const { contentId: contextContentId, getCachedArticle } = usePCCPage();
  const contentId = propContentId || contextContentId || "";
  const cachedArticle = contentId ? getCachedArticle(contentId) : null;

  const [article, setArticle] = useState<Article | null>(cachedArticle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId) {
      setArticle(null);
      setError(null);
      return;
    }

    if (cachedArticle) {
      setArticle(cachedArticle);
      return;
    }

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/pcc/article?contentId=${encodeURIComponent(contentId)}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch article");
        }
        const data = await response.json();
        setArticle(data.article);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch article");
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [contentId, cachedArticle]);

  const defaultBodyClassName = [
    "prose prose-lg max-w-none",
    "prose-headings:font-bold prose-headings:text-black prose-headings:tracking-tight",
    "prose-h1:text-4xl prose-h1:md:text-5xl prose-h1:lg:text-6xl prose-h1:leading-[1.1] prose-h1:mb-8",
    "prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:leading-[1.15] prose-h2:mt-16 prose-h2:mb-6",
    "prose-h3:text-2xl prose-h3:md:text-3xl prose-h3:leading-[1.2] prose-h3:mt-12 prose-h3:mb-4",
    "prose-h4:text-xl prose-h4:md:text-2xl prose-h4:leading-[1.25] prose-h4:mt-8 prose-h4:mb-3",
    "prose-p:text-base prose-p:md:text-lg prose-p:leading-[1.75] prose-p:text-gray-900 prose-p:mb-6",
    "prose-a:text-black prose-a:underline prose-a:underline-offset-2 prose-a:decoration-1 prose-a:hover:no-underline prose-a:transition-all",
    "prose-strong:font-bold prose-strong:text-black prose-em:italic",
    "prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6 prose-ul:space-y-2",
    "prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-6 prose-ol:space-y-2",
    "prose-li:text-base prose-li:md:text-lg prose-li:leading-relaxed prose-li:text-gray-900 prose-li:pl-2",
    "prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-8 prose-blockquote:pr-4",
    "prose-blockquote:py-2 prose-blockquote:my-10 prose-blockquote:not-italic",
    "prose-blockquote:text-xl prose-blockquote:md:text-2xl prose-blockquote:leading-relaxed prose-blockquote:text-gray-800",
    "prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono",
    "prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-none prose-pre:overflow-x-auto prose-pre:my-8",
    "prose-img:rounded-none prose-img:my-10 prose-img:w-full",
    "prose-figure:my-10 prose-figcaption:text-sm prose-figcaption:text-gray-600 prose-figcaption:mt-3 prose-figcaption:text-center",
    "prose-table:w-full prose-table:border-collapse prose-table:my-8",
    "prose-thead:border-b-2 prose-thead:border-black",
    "prose-th:py-4 prose-th:px-4 prose-th:text-left prose-th:font-bold prose-th:text-black",
    "prose-td:py-4 prose-td:px-4 prose-td:border-b prose-td:border-gray-200",
    "prose-hr:border-gray-300 prose-hr:my-12",
    bodyClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const defaultContainerClassName = ["bg-white py-8 md:py-12", containerClassName]
    .filter(Boolean)
    .join(" ");

  if (!contentId) {
    return (
      <div className={`bg-gray-100 p-8 rounded-lg text-center border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-medium">Article Body</p>
          <p className="text-sm mt-1">Enter a Content Publisher Article ID in the settings panel</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white p-8 rounded-lg ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
          <div className="h-4 bg-gray-300 rounded w-4/5" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`bg-red-50 p-8 rounded-lg text-center ${className}`}>
        <p className="text-red-600">{error || `Article content not found (ID: ${contentId})`}</p>
      </div>
    );
  }

  const contentMaxWidth = maxWidthStyles[maxWidth];

  return (
    <div className={`pcc-article-body ${className}`}>
      <div className={`${contentMaxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        <ArticleRenderer
          article={article}
          bodyClassName={defaultBodyClassName}
          containerClassName={defaultContainerClassName}
          renderTitle={() => null}
          __experimentalFlags={{
            disableAllStyles: false,
            preserveImageStyles: true,
          }}
        />
      </div>
    </div>
  );
};

export default PCCArticleBodyPuck;
