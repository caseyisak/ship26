import { draftMode } from 'next/headers';

import { fetchGraphQL } from './client';
import { NEWS_ARTICLE_BY_ID, NEWS_ARTICLES_COLLECTION } from './queries';

export type NewsArticleItem = {
  sys: { id: string };
  internalName?: string | null;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  publishedDate?: string | null;
  category?: string | null;
  media?: { url?: string; width?: number; height?: number } | null;
};

type NewsArticleCollectionResponse = {
  newsArticleCollection: {
    total: number;
    items: NewsArticleItem[];
  };
};

export async function getNewsArticles({
  locale = 'en-US',
  limit = 12,
  skip = 0,
}: {
  locale?: string;
  limit?: number;
  skip?: number;
} = {}): Promise<{ items: NewsArticleItem[]; total: number }> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<NewsArticleCollectionResponse>({
      query: NEWS_ARTICLES_COLLECTION,
      variables: { locale, preview: isEnabled, limit, skip },
      preview: isEnabled,
    });
    return {
      items: data.newsArticleCollection?.items ?? [],
      total: data.newsArticleCollection?.total ?? 0,
    };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getNewsArticleByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<NewsArticleItem | null> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<NewsArticleCollectionResponse>({
      query: NEWS_ARTICLE_BY_ID,
      variables: { id: entryId, locale, preview: isEnabled },
      preview: isEnabled,
    });
    return data.newsArticleCollection?.items?.[0] ?? null;
  } catch {
    return null;
  }
}
