import Image from 'next/image';
import Link from 'next/link';

import type { BlogPostsSectionFragment } from '@/block-renderer/types';

function toHttps(url: string | null | undefined): string {
  if (!url) return '';
  return url.startsWith('//') ? `https:${url}` : url;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogPostsSection({ data }: { data: BlogPostsSectionFragment }) {
  const { title, description, limit, postsCollection } = data;
  const allPosts = postsCollection?.items ?? [];
  const posts = limit ? allPosts.slice(0, limit) : allPosts;

  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="mb-10">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 text-lg text-gray-600">{description}</p>
            )}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-400 italic">No posts selected yet.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              if (!post?.slug) return null;
              const imageUrl = toHttps(post.heroImage?.url);
              return (
                <Link
                  key={post.sys.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  {imageUrl && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={post.title ?? ''}
                        fill
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {post.contentfulMetadata?.tags?.[0] && (
                      <span className="mb-2 text-xs font-semibold tracking-wide text-blue-600 uppercase">
                        {post.contentfulMetadata.tags[0].name}
                      </span>
                    )}
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mb-4 line-clamp-3 overflow-hidden text-sm text-gray-500">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-2 text-xs text-gray-400">
                      {post.author?.name && <span>{post.author.name}</span>}
                      {post.author?.name && post.publishDate && <span>·</span>}
                      {post.publishDate && (
                        <span>{formatDate(post.publishDate)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
