import { draftMode } from 'next/headers';

import type { BlogPostFragment, NewsWrapperFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import {
  BLOG_POST_BY_ID,
  NEWS_WRAPPER_BY_ID,
  NEWS_WRAPPER_POOL,
} from './queries';

type BlogPostByIdResponse = {
  blogPostCollection: { items: Array<{ __typename: string; sys: { id: string }; [key: string]: unknown } | null> };
};

type NewsWrapperByIdResponse = {
  newsWrapperCollection: {
    items: Array<{
      __typename: string;
      sys: { id: string };
      internalName?: string | null;
      labelRt?: { json: Record<string, unknown> } | null;
      titleRt?: { json: Record<string, unknown> } | null;
      descriptionRt?: { json: Record<string, unknown> } | null;
      filterCategory?: string | null;
      sortOrder?: string | null;
      maxItems?: number | null;
      priorityItemsCollection?: { items: Array<{ __typename: string; sys: { id: string } } | null> } | null;
    } | null>;
  };
};

type BlogPoolResponse = {
  blogPostCollection: { items: Array<{ __typename: string; sys: { id: string }; [key: string]: unknown } | null> };
};

/**
 * Resolve priority pinned items by entry ID, preserving order.
 * Uses the existing BLOG_POST_BY_ID query for each pin.
 */
async function resolvePriorityItems(
  ids: string[],
  preview: boolean,
  locale: string,
): Promise<BlogPostFragment[]> {
  if (ids.length === 0) return [];

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const data = await fetchGraphQL<BlogPostByIdResponse>({
          query: BLOG_POST_BY_ID,
          variables: { id, locale, preview },
          preview,
        });
        const item = data.blogPostCollection?.items?.[0];
        if (!item || item.__typename !== 'BlogPost') return null;
        return item as unknown as BlogPostFragment;
      } catch {
        return null;
      }
    }),
  );

  return results.filter((p): p is BlogPostFragment => p !== null);
}

/**
 * Fetch dynamic blog pool with optional category filter and sort order.
 * Over-fetches by 2x maxItems to absorb deduplication.
 * Category filtering is done client-side to avoid GraphQL tag query complexity.
 */
async function fetchDynamicPool(
  filterCategory: string | null | undefined,
  sortOrder: string | null | undefined,
  maxItems: number,
  preview: boolean,
  locale: string,
): Promise<BlogPostFragment[]> {
  try {
    const limit = Math.min(maxItems * 2, 48);
    const order =
      sortOrder === 'oldest_first' ? 'publishDate_ASC' : 'publishDate_DESC';
    const data = await fetchGraphQL<BlogPoolResponse>({
      query: NEWS_WRAPPER_POOL,
      variables: { locale, preview, limit, order },
      preview,
    });
    let items = (data.blogPostCollection?.items ?? [])
      .filter((item): item is NonNullable<typeof item> => item !== null && item.__typename === 'BlogPost')
      .map((item) => item as unknown as BlogPostFragment);

    // Client-side category filter: match against tag IDs
    if (filterCategory) {
      items = items.filter((post) =>
        (post.contentfulMetadata?.tags ?? []).some(
          (tag) => tag.id === filterCategory,
        ),
      );
    }

    return items;
  } catch {
    return [];
  }
}

/**
 * Merge pinned priority items + dynamic pool.
 * 1. Fetch pinned items by ID (preserves order)
 * 2. Fetch dynamic pool filtered + sorted
 * 3. Remove pinned IDs from dynamic results
 * 4. Concatenate: pinned + dynamic
 * 5. Slice to maxItems
 */
async function mergeArticles(
  priorityIds: string[],
  filterCategory: string | null | undefined,
  sortOrder: string | null | undefined,
  maxItems: number,
  preview: boolean,
  locale: string,
): Promise<BlogPostFragment[]> {
  const [pinned, dynamic] = await Promise.all([
    resolvePriorityItems(priorityIds, preview, locale),
    fetchDynamicPool(filterCategory, sortOrder, maxItems, preview, locale),
  ]);

  const pinnedIdSet = new Set(pinned.map((p) => p.sys.id));
  const deduped = dynamic.filter((p) => !pinnedIdSet.has(p.sys.id));
  return [...pinned, ...deduped].slice(0, maxItems);
}

/** Fetch a single newsWrapper entry by entry ID with fully merged article list. */
export async function getNewsWrapperByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<NewsWrapperFragment | null> {
  try {
    const data = await fetchGraphQL<NewsWrapperByIdResponse>({
      query: NEWS_WRAPPER_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });

    const raw = data.newsWrapperCollection?.items?.[0];
    if (!raw || raw.__typename !== 'NewsWrapper') return null;

    const maxItems = raw.maxItems ?? 6;
    const priorityIds = (raw.priorityItemsCollection?.items ?? [])
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item) => item.sys.id);

    const mergedArticles = await mergeArticles(
      priorityIds,
      raw.filterCategory,
      raw.sortOrder,
      maxItems,
      true,
      locale,
    );

    return {
      __typename: 'NewsWrapper',
      sys: raw.sys,
      internalName: raw.internalName ?? null,
      labelRt: raw.labelRt ?? null,
      titleRt: raw.titleRt ?? null,
      descriptionRt: raw.descriptionRt ?? null,
      filterCategory: raw.filterCategory ?? null,
      sortOrder: raw.sortOrder ?? null,
      maxItems,
      priorityItemsCollection: raw.priorityItemsCollection as NewsWrapperFragment['priorityItemsCollection'],
      mergedArticles,
    };
  } catch {
    return null;
  }
}

/** Fetch a newsWrapper for page rendering (respects draft mode). */
export async function getNewsWrapperForPage({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<NewsWrapperFragment | null> {
  try {
    const { isEnabled } = await draftMode();

    const data = await fetchGraphQL<NewsWrapperByIdResponse>({
      query: NEWS_WRAPPER_BY_ID,
      variables: { id: entryId, locale, preview: isEnabled },
      preview: isEnabled,
    });

    const raw = data.newsWrapperCollection?.items?.[0];
    if (!raw || raw.__typename !== 'NewsWrapper') return null;

    const maxItems = raw.maxItems ?? 6;
    const priorityIds = (raw.priorityItemsCollection?.items ?? [])
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item) => item.sys.id);

    const mergedArticles = await mergeArticles(
      priorityIds,
      raw.filterCategory,
      raw.sortOrder,
      maxItems,
      isEnabled,
      locale,
    );

    return {
      __typename: 'NewsWrapper',
      sys: raw.sys,
      internalName: raw.internalName ?? null,
      labelRt: raw.labelRt ?? null,
      titleRt: raw.titleRt ?? null,
      descriptionRt: raw.descriptionRt ?? null,
      filterCategory: raw.filterCategory ?? null,
      sortOrder: raw.sortOrder ?? null,
      maxItems,
      priorityItemsCollection: raw.priorityItemsCollection as NewsWrapperFragment['priorityItemsCollection'],
      mergedArticles,
    };
  } catch {
    return null;
  }
}
