// TODO: newsArticle content type does not yet exist in Contentful master env.
// This page will return an empty grid until the CT is created and entries are published.
// CT creation tracked as a separate task (p0-c follow-up).
import MetafiBlogGrid from '@/components/sections/metafi-blog-grid';
import type { BlogGridCard } from '@/components/sections/metafi-blog-grid';
import { getNewsArticles } from '@/services/contentful/news-article';

export const revalidate = 60;

export default async function NewsPage() {
  const { items } = await getNewsArticles({ limit: 24 });

  const posts: BlogGridCard[] = items.map((article) => ({
    slug: article.slug ?? article.sys.id,
    title: article.title ?? '',
    intro: article.excerpt ?? undefined,
    tagline: article.category ?? undefined,
    author: undefined,
    date: article.publishedDate ?? undefined,
    coverImage: article.media?.url ?? undefined,
  }));

  return (
    <div>
      <div className="bg-background px-6 py-12 lg:px-0">
        <div className="container px-0 md:px-6">
          <p className="text-tagline mb-3 text-sm font-semibold tracking-widest uppercase">
            Latest
          </p>
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            News
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            The latest updates — news, announcements, and more.
          </p>
        </div>
      </div>
      <MetafiBlogGrid posts={posts} />
    </div>
  );
}
