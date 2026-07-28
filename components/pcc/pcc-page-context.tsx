"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { Article } from "@pantheon-systems/pcc-react-sdk";

interface PCCCacheContextValue {
  articleCache: Record<string, Article>;
  getCachedArticle: (contentId: string) => Article | null;
}

const defaultCacheValue: PCCCacheContextValue = {
  articleCache: {},
  getCachedArticle: () => null,
};

const PCCCacheContext = createContext<PCCCacheContextValue>(defaultCacheValue);

interface PCCCacheProviderProps {
  children: ReactNode;
  articleCache: Record<string, Article>;
}

export function PCCCacheProvider({
  children,
  articleCache,
}: PCCCacheProviderProps) {
  const getCachedArticle = React.useCallback(
    (id: string): Article | null => {
      return articleCache[id] || null;
    },
    [articleCache]
  );

  const value = React.useMemo(
    () => ({ articleCache, getCachedArticle }),
    [articleCache, getCachedArticle]
  );

  return (
    <PCCCacheContext.Provider value={value}>
      {children}
    </PCCCacheContext.Provider>
  );
}

export function usePCCCache(): PCCCacheContextValue {
  return useContext(PCCCacheContext);
}

interface PCCPageContextValue {
  contentId: string | null;
  articleTitle: string | null;
  articleCache: Record<string, Article>;
  getCachedArticle: (contentId: string) => Article | null;
}

const defaultValue: PCCPageContextValue = {
  contentId: null,
  articleTitle: null,
  articleCache: {},
  getCachedArticle: () => null,
};

const PCCPageContext = createContext<PCCPageContextValue>(defaultValue);

interface PCCPageProviderProps {
  children: ReactNode;
  contentId: string | null;
  articleTitle: string | null;
  articleCache?: Record<string, Article>;
}

export function PCCPageProvider({
  children,
  contentId,
  articleTitle,
  articleCache: propCache,
}: PCCPageProviderProps) {
  const outerCache = usePCCCache();
  const articleCache = React.useMemo(
    () => propCache || outerCache.articleCache || {},
    [propCache, outerCache.articleCache]
  );

  const getCachedArticle = React.useCallback(
    (id: string): Article | null => {
      if (propCache && propCache[id]) {
        return propCache[id];
      }
      return outerCache.getCachedArticle(id);
    },
    [propCache, outerCache]
  );

  const value = React.useMemo(
    () => ({ contentId, articleTitle, articleCache, getCachedArticle }),
    [contentId, articleTitle, articleCache, getCachedArticle]
  );

  return (
    <PCCPageContext.Provider value={value}>
      {children}
    </PCCPageContext.Provider>
  );
}

export function usePCCPage(): PCCPageContextValue {
  return useContext(PCCPageContext);
}

export { PCCPageContext, PCCCacheContext };
export type {
  PCCPageContextValue,
  PCCPageProviderProps,
  PCCCacheContextValue,
  PCCCacheProviderProps,
};
