import type { BlogPostsSectionFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { BLOG_POSTS_SECTION_BY_ID } from './queries';

type BlogPostsSectionByIdResponse = {
  blogPostsSectionCollection: {
    items: Array<BlogPostsSectionFragment | null>;
  };
};

/** Fetch a single BlogPostsSection entry by ID (for ID-based live preview). */
export async function getBlogPostsSectionByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<BlogPostsSectionFragment | null> {
  try {
    const data = await fetchGraphQL<BlogPostsSectionByIdResponse>({
      query: BLOG_POSTS_SECTION_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.blogPostsSectionCollection?.items?.[0] ?? null;
    if (!item || item.__typename !== 'BlogPostsSection') return null;
    return item;
  } catch {
    return null;
  }
}
