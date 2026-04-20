'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import type { BlogPostFragment, NewsWrapperFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

const richTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
    [BLOCKS.HEADING_1]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
    [BLOCKS.HEADING_2]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
    [BLOCKS.HEADING_3]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
  },
};

function toHttps(url: string | null | undefined): string {
  if (!url) return '';
  return url.startsWith('//') ? `https:${url}` : url;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Category badge label mapping. */
const CATEGORY_LABELS: Record<string, string> = {
  company: 'Company',
  product: 'Product',
  industry: 'Industry',
  press: 'Press',
};

function ArticleCard({ post }: { post: BlogPostFragment }) {
  const imageUrl = toHttps(post.heroImage?.url);
  const tags = post.contentfulMetadata?.tags ?? [];
  const category = tags[0]?.name ?? null;
  const categoryKey = tags[0]?.id ?? null;
  const categoryLabel =
    (categoryKey && CATEGORY_LABELS[categoryKey]) ?? category ?? null;

  return (
    <Link
      href={post.slug ? `/blog/${post.slug}` : '#'}
      className="group bg-card border-border-light flex flex-col overflow-hidden rounded-[16px] border shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)] transition-shadow hover:shadow-md"
    >
      {imageUrl && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={post.title ?? ''}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {categoryLabel && (
          <span className="bg-primary/10 text-primary mb-3 inline-block w-fit rounded-full px-3 py-1 text-xs font-medium">
            {categoryLabel}
          </span>
        )}

        {post.title && (
          <h3 className="text-foreground mb-2 line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary sm:text-lg">
            {post.title}
          </h3>
        )}

        {post.excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="text-muted-foreground mt-auto flex items-center gap-1.5 text-xs">
          {post.author?.name && (
            <span className="font-medium">{post.author.name}</span>
          )}
          {post.author?.name && post.publishDate && (
            <span aria-hidden="true">·</span>
          )}
          {post.publishDate && <span>{formatDate(post.publishDate)}</span>}
        </div>
      </div>
    </Link>
  );
}

const NewsWrapper = ({
  data,
  className,
  ...props
}: BlockProps<NewsWrapperFragment>) => {
  const liveData = useLiveUpdates(data) as NewsWrapperFragment;
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const labelRtData = liveData.labelRt;
  const titleRtData = liveData.titleRt;
  const descriptionRtData = liveData.descriptionRt;

  const label = labelRtData?.json
    ? documentToReactComponents(
        labelRtData.json as unknown as Parameters<
          typeof documentToReactComponents
        >[0],
        richTextOptions,
      )
    : null;

  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<
          typeof documentToReactComponents
        >[0],
        richTextOptions,
      )
    : null;

  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<
          typeof documentToReactComponents
        >[0],
        richTextOptions,
      )
    : null;

  const articles = (liveData.mergedArticles ?? []) as BlogPostFragment[];

  return (
    <section
      id="news-wrapper"
      className={cn('bg-background px-6 lg:px-0', className ?? '')}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-28">
        {label && (
          <p
            className="text-tagline mb-4 text-center text-sm sm:text-base"
            {...getProps({ fieldId: 'label' })}
          >
            {label}
          </p>
        )}

        {title && (
          <h2
            className="text-foreground mx-auto max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl md:text-5xl"
            {...getProps({ fieldId: 'title' })}
          >
            {title}
          </h2>
        )}

        {description && (
          <p
            className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg"
            {...getProps({ fieldId: 'description' })}
          >
            {description}
          </p>
        )}

        {articles.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-14 md:gap-8 lg:grid-cols-3">
            {articles.map((post) => (
              <ArticleCard key={post.sys.id} post={post} />
            ))}
          </div>
        )}

        {articles.length === 0 && (
          <p className="text-muted-foreground mt-12 text-center italic">
            No articles to display.
          </p>
        )}
      </div>
    </section>
  );
};

export { NewsWrapper };
