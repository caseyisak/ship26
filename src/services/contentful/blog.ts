import { draftMode } from 'next/headers';

import type { AuthorFragment, BlogPostFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { BLOG_POST_BY_ID, BLOG_POST_BY_SLUG, BLOG_POSTS } from './queries';

type RawAuthor = {
  __typename: string;
  sys: { id: string };
  name?: string | null;
  bio?: string | null;
};

type RawBlogPost = {
  __typename: string;
  sys: { id: string };
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  publishDate?: string | null;
  tags?: string[] | null;
  heroImage?: { url?: string; width?: number; height?: number } | null;
  body?: { json: unknown } | null;
  author?: RawAuthor | null;
};

type BlogPostsResponse = {
  blogPostCollection: { items: Array<RawBlogPost | null> };
};

type BlogPostBySlugResponse = {
  blogPostCollection: { items: Array<RawBlogPost | null> };
};

type BlogPostByIdResponse = {
  blogPostCollection: { items: Array<RawBlogPost | null> };
};

function mapAuthor(raw: RawAuthor | null | undefined): AuthorFragment | null {
  if (!raw || raw.__typename !== 'Author') return null;
  return {
    __typename: 'Author',
    sys: { id: raw.sys.id },
    name: raw.name ?? null,
    bio: raw.bio ?? null,
  };
}

function mapBlogPost(raw: RawBlogPost | null): BlogPostFragment | null {
  if (!raw || raw.__typename !== 'BlogPost') return null;
  return {
    __typename: 'BlogPost',
    sys: { id: raw.sys.id },
    title: raw.title ?? null,
    slug: raw.slug ?? null,
    excerpt: raw.excerpt ?? null,
    publishDate: raw.publishDate ?? null,
    tags: raw.tags ?? null,
    heroImage: raw.heroImage ?? null,
    body: raw.body ?? null,
    author: mapAuthor(raw.author),
  };
}

/** Fetch all published blog posts ordered by publishDate DESC. */
export async function getBlogPosts({
  locale = 'en-US',
}: {
  locale?: string;
} = {}): Promise<BlogPostFragment[]> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<BlogPostsResponse>({
      query: BLOG_POSTS,
      variables: { locale, preview: isEnabled },
      preview: isEnabled,
    });
    return (data.blogPostCollection?.items ?? [])
      .map(mapBlogPost)
      .filter((p): p is BlogPostFragment => p !== null);
  } catch {
    return [];
  }
}

/** Fetch a single blog post by slug. */
export async function getBlogPostBySlug({
  slug,
  locale = 'en-US',
}: {
  slug: string;
  locale?: string;
}): Promise<BlogPostFragment | null> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<BlogPostBySlugResponse>({
      query: BLOG_POST_BY_SLUG,
      variables: { slug, locale, preview: isEnabled },
      preview: isEnabled,
    });
    const item = data.blogPostCollection?.items?.[0] ?? null;
    return mapBlogPost(item);
  } catch {
    return null;
  }
}

/** Fetch a single blog post by entry ID (for ID-based live preview). */
export async function getBlogPostByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<BlogPostFragment | null> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<BlogPostByIdResponse>({
      query: BLOG_POST_BY_ID,
      variables: { id: entryId, locale, preview: isEnabled },
      preview: isEnabled,
    });
    const item = data.blogPostCollection?.items?.[0] ?? null;
    return mapBlogPost(item);
  } catch {
    return null;
  }
}

/** Fetch all blog post slugs (for generateStaticParams). */
export async function getBlogPostSlugs({
  locale = 'en-US',
}: {
  locale?: string;
} = {}): Promise<string[]> {
  try {
    const posts = await getBlogPosts({ locale });
    return posts.map((p) => p.slug).filter((s): s is string => Boolean(s));
  } catch {
    return [];
  }
}
