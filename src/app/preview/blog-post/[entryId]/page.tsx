import { notFound } from 'next/navigation';

import { BlogPostCms } from '@/cms-components/blog-post';
import { getBlogPostByEntryId } from '@/services/contentful/blog';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for BlogPost entries (no page/slug).
 * Set preview URL in Contentful to /api/enable-draft?secret=kaz&entryId={{entry.sys.id}}&type=blogPost
 */
export default async function PreviewBlogPostPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const post = await getBlogPostByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!post) {
    notFound();
  }

  return <BlogPostCms data={post} />;
}
