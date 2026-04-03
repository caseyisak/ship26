import { notFound } from 'next/navigation';

import { BlogPostsSection } from '@/cms-components/blog-posts-section';
import { getBlogPostsSectionByEntryId } from '@/services/contentful/blog-posts-section';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for BlogPostsSection entries.
 * Set preview URL in Contentful to /api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=blogPostsSection
 */
export default async function PreviewBlogPostsSectionPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const section = await getBlogPostsSectionByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!section) notFound();

  return <BlogPostsSection data={section} />;
}
