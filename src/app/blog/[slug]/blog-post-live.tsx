'use client';

import type { BlogPostFragment } from '@/block-renderer/types';
import { BlogPostCms } from '@/cms-components/blog-post';

export function BlogPostLive({ data }: { data: BlogPostFragment }) {
  return <BlogPostCms data={data} />;
}
