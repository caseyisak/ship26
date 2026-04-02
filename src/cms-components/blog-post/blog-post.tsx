'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { Block, Document, Node } from '@contentful/rich-text-types';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { Fragment, useEffect, useState } from 'react';

import type { BlogPostFragment } from '@/block-renderer/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

type Heading = { id: string; text: string };

/** Extract h2/h3 headings from the rich text JSON for the TOC. */
function extractHeadings(doc: unknown): Heading[] {
  if (!doc || typeof doc !== 'object') return [];
  const document = doc as Document;
  const headings: Heading[] = [];
  let counter = 0;

  function walk(node: Node) {
    if (
      node.nodeType === BLOCKS.HEADING_2 ||
      node.nodeType === BLOCKS.HEADING_3
    ) {
      const text = (node as Block).content
        .filter((n) => n.nodeType === 'text')
        .map((n) => (n as { value: string }).value)
        .join('');
      if (text) {
        headings.push({ id: `heading-${++counter}`, text });
      }
    }
    if ('content' in node && Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  }

  document.content?.forEach(walk);
  return headings;
}

/** Inject IDs onto h2/h3 elements so the TOC scroll-spy can target them. */
function buildRichTextOptions(headings: Heading[]) {
  let h2Counter = 0;
  let h3Counter = 0;
  const headingIds = headings.map((h) => h.id);
  let headingIndex = 0;

  return {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text: React.ReactNode) => <u>{text}</u>,
      [MARKS.CODE]: (text: React.ReactNode) => <code>{text}</code>,
    },
    renderNode: {
      [BLOCKS.HEADING_1]: (node: Node, children: React.ReactNode) => (
        <h1>{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node: Node, children: React.ReactNode) => {
        const id = headingIds[headingIndex++] ?? `h2-${++h2Counter}`;
        return (
          <h2 id={id} className="scroll-mt-24">
            {children}
          </h2>
        );
      },
      [BLOCKS.HEADING_3]: (node: Node, children: React.ReactNode) => {
        const id = headingIds[headingIndex++] ?? `h3-${++h3Counter}`;
        return (
          <h3 id={id} className="scroll-mt-24">
            {children}
          </h3>
        );
      },
      [BLOCKS.PARAGRAPH]: (node: Node, children: React.ReactNode) => (
        <p>{children}</p>
      ),
      [BLOCKS.UL_LIST]: (node: Node, children: React.ReactNode) => (
        <ul>{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node: Node, children: React.ReactNode) => (
        <ol>{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: Node, children: React.ReactNode) => (
        <li>{children}</li>
      ),
      [BLOCKS.QUOTE]: (node: Node, children: React.ReactNode) => (
        <blockquote>{children}</blockquote>
      ),
      [BLOCKS.EMBEDDED_ASSET]: (node: Node) => {
        const url = (
          node.data?.target as {
            fields?: { file?: { url?: string }; title?: string };
          }
        )?.fields?.file?.url;
        const title =
          (
            node.data?.target as {
              fields?: { file?: { url?: string }; title?: string };
            }
          )?.fields?.title ?? '';
        if (!url) return null;
        const src = url.startsWith('//') ? `https:${url}` : url;
        return (
          <div className="my-6 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={title}
              className="size-full rounded-lg object-cover object-center"
            />
          </div>
        );
      },
      [INLINES.HYPERLINK]: (node: Node, children: React.ReactNode) => (
        <a
          href={(node.data as { uri: string }).uri}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
    },
  };
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Estimate read time from rich text document. */
function estimateReadTime(doc: unknown): string {
  if (!doc) return '';
  try {
    const text = JSON.stringify(doc);
    const words = text.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  } catch {
    return '';
  }
}

function AuthorRow({
  authorId,
  authorName,
  publishDate,
  initials,
}: {
  authorId: string;
  authorName: string;
  publishDate: string | null;
  initials: string;
}) {
  const getAuthorProps = useContentfulInspectorModeProps(authorId);
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-12 border">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <div
          className="text-sm leading-normal font-normal"
          {...getAuthorProps({ fieldId: 'name' })}
        >
          {authorName}
        </div>
        <div className="text-muted-foreground text-sm leading-normal font-normal">
          {publishDate ? formatDate(publishDate) : ''}
        </div>
      </div>
    </div>
  );
}

interface BlogPostCmsProps {
  data: BlogPostFragment;
  className?: string;
}

const BlogPostCms = ({ data, className }: BlogPostCmsProps) => {
  const liveData = useLiveUpdates(data) as BlogPostFragment;
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const title = liveData.title ?? '';
  const excerpt = liveData.excerpt ?? '';
  const publishDate = liveData.publishDate ?? null;
  const tags = liveData.contentfulMetadata?.tags ?? [];
  const heroImageUrl = liveData.heroImage?.url ?? null;
  const bodyJson = liveData.body?.json ?? null;
  const author = liveData.author;
  const authorName = author?.name ?? 'Metafi Team';
  const authorBio = author?.bio ?? '';

  const headings = extractHeadings(bodyJson);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const ids = headings.map((h) => h.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new window.IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '0px 0px -30% 0px', threshold: 0.1 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings.length]);

  const richTextOptions = buildRichTextOptions(headings);
  const initials = authorName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className={cn('pb-32', className)}>
      {/* Hero header */}
      <div className="bg-muted bg-[url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/dot-pattern-2.svg')] bg-[length:3.125rem_3.125rem] bg-repeat py-20">
        <div className="container flex flex-col items-start justify-start gap-16 py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-full flex-col items-center justify-center gap-12">
            <div className="flex w-full max-w-[36rem] flex-col items-center justify-center gap-8">
              <Breadcrumb>
                <BreadcrumbList>
                  <Fragment>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
                    </BreadcrumbItem>
                  </Fragment>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex w-full flex-col gap-5">
                <div className="text-foreground/60 flex items-center justify-center gap-2.5 text-sm font-medium">
                  {estimateReadTime(bodyJson) && (
                    <>
                      <div>{estimateReadTime(bodyJson)}</div>
                      <div>|</div>
                    </>
                  )}
                  {publishDate && <div>{formatDate(publishDate)}</div>}
                </div>

                {title && (
                  <h1
                    className="text-center text-[2.5rem] leading-[1.2] font-semibold md:text-5xl lg:text-6xl"
                    {...getProps({ fieldId: 'title' })}
                  >
                    {title}
                  </h1>
                )}

                {excerpt && (
                  <p
                    className="text-foreground/80 text-center text-xl leading-[1.4] font-semibold"
                    {...getProps({ fieldId: 'excerpt' })}
                  >
                    {excerpt}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero image */}
      {heroImageUrl && (
        <div className="container pt-10">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                heroImageUrl.startsWith('//')
                  ? `https:${heroImageUrl}`
                  : heroImageUrl
              }
              alt={title}
              className="max-h-[480px] w-full object-cover"
              {...getProps({ fieldId: 'heroImage' })}
            />
          </div>
        </div>
      )}

      {/* Article body */}
      <div className="container pt-20">
        <div className="relative mx-auto w-full max-w-5xl items-start justify-between gap-20 lg:flex">
          {/* TOC sidebar */}
          {headings.length > 0 && (
            <div className="bg-background top-20 flex-1 pb-10 lg:sticky lg:pb-0">
              <div className="text-xl leading-snug font-medium">Chapters</div>
              <div className="flex flex-col gap-2 pt-2 pl-2">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={cn(
                      'text-muted-foreground block text-sm leading-normal font-medium transition duration-300',
                      activeId === h.id
                        ? 'lg:bg-muted lg:!text-primary lg:rounded-md lg:p-2 lg:font-bold'
                        : '',
                    )}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Article content */}
          <div className="flex w-full max-w-[40rem] flex-col gap-10">
            {/* Author header */}
            <AuthorRow
              authorId={author?.sys?.id ?? data.sys.id}
              authorName={authorName}
              publishDate={publishDate}
              initials={initials}
            />

            {/* Rich text body */}
            {bodyJson && (
              <div
                className="prose dark:prose-invert max-w-none"
                {...getProps({ fieldId: 'body' })}
              >
                {documentToReactComponents(
                  bodyJson as Document,
                  richTextOptions,
                )}
              </div>
            )}

            {/* Author bio footer */}
            {authorBio && (
              <div className="bg-muted flex flex-col gap-4 rounded-lg p-5">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-12 border">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm leading-normal font-normal">
                      {authorName}
                    </div>
                  </div>
                </div>
                <p>{authorBio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { BlogPostCms };
