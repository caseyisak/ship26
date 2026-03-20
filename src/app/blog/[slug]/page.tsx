import { notFound } from 'next/navigation';

import {
  getBlogPostBySlug,
  getBlogPostSlugs,
} from '@/services/contentful/blog';

import { BlogPostLive } from './blog-post-live';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug({ slug });

  if (!post) {
    notFound();
  }

  return <BlogPostLive data={post} />;
}
