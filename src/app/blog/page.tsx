import MetafiBlogGrid from '@/components/sections/metafi-blog-grid';
import { getBlogPosts } from '@/services/contentful/blog';

export const dynamic = 'force-dynamic';

function toHttps(url: string | null | undefined): string {
  if (!url) return '/images/blog/placeholder.webp';
  return url.startsWith('//') ? `https:${url}` : url;
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  const gridPosts = posts.map((p) => ({
    slug: p.slug ?? '',
    title: p.title ?? p.slug ?? '',
    tagline: p.tags?.[0] ?? 'General',
    intro: p.excerpt ?? '',
    author: p.author?.name ?? 'Metafi Team',
    date: p.publishDate ?? '',
    coverImage: toHttps(p.heroImage?.url),
  }));

  return <MetafiBlogGrid posts={gridPosts} />;
}
