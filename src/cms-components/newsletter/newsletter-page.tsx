'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { Document } from '@contentful/rich-text-types';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import React from 'react';

import { LivePreviewProviderWrapper } from '@/components/live-preview-provider';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import type { Newsletter } from '@/services/contentful/newsletter';
// ─── Rich text renderer ───────────────────────────────────────────────────────
import type { EmbeddedEntry } from '@/services/contentful/newsletter';

function buildRichTextOptions(linkedEntries: Array<EmbeddedEntry | null> = []) {
  const entryMap = new Map<string, EmbeddedEntry>();
  for (const entry of linkedEntries) {
    if (entry?.sys?.id) entryMap.set(entry.sys.id, entry);
  }

  return {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text: React.ReactNode) => <u>{text}</u>,
      [MARKS.CODE]: (text: React.ReactNode) => (
        <code className="rounded bg-secondary px-1 py-0.5 font-mono text-sm">
          {text}
        </code>
      ),
    },
    renderNode: {
      [BLOCKS.HEADING_1]: (_: unknown, children: React.ReactNode) => (
        <h1 className="mt-8 mb-4 text-3xl font-extrabold text-foreground">
          {children}
        </h1>
      ),
      [BLOCKS.HEADING_2]: (_: unknown, children: React.ReactNode) => (
        <h2 className="mt-7 mb-3 text-2xl font-bold text-foreground">
          {children}
        </h2>
      ),
      [BLOCKS.HEADING_3]: (_: unknown, children: React.ReactNode) => (
        <h3 className="mt-6 mb-2 text-xl font-semibold text-foreground">
          {children}
        </h3>
      ),
      [BLOCKS.PARAGRAPH]: (_: unknown, children: React.ReactNode) => (
        <p className="mb-4 text-base leading-relaxed text-foreground">
          {children}
        </p>
      ),
      [BLOCKS.UL_LIST]: (_: unknown, children: React.ReactNode) => (
        <ul className="mb-4 list-disc pl-5 text-foreground">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_: unknown, children: React.ReactNode) => (
        <ol className="mb-4 list-decimal pl-5 text-foreground">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_: unknown, children: React.ReactNode) => (
        <li className="mb-1">{children}</li>
      ),
      [BLOCKS.QUOTE]: (_: unknown, children: React.ReactNode) => (
        <blockquote className="mb-4 border-l-4 border-border pl-4 text-muted-foreground italic">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-6 border-border" />,
      [BLOCKS.EMBEDDED_ENTRY]: (node: unknown) => {
        const n = node as { data?: { target?: { sys?: { id?: string } } } };
        const id = n?.data?.target?.sys?.id;
        if (!id) return null;
        const entry = entryMap.get(id);
        if (!entry) return null;

        // ── Hero embed ───────────────────────────────────────────────────────
        if (entry.__typename === 'Hero') {
          const bgUrl = entry.background?.url?.startsWith('//')
            ? `https:${entry.background.url}`
            : entry.background?.url;
          const imgUrl2 = entry.image?.url?.startsWith('//')
            ? `https:${entry.image.url}`
            : entry.image?.url;
          return (
            <div className="relative my-6 overflow-hidden rounded-none bg-primary text-primary-foreground">
              {bgUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${bgUrl})` }}
                />
              )}
              <div className="relative flex items-center gap-6 px-6 py-8">
                <div className="flex-1">
                  {entry.headline && (
                    <h2 className="mb-2 text-2xl leading-tight font-bold text-primary-foreground">
                      {entry.headline}
                    </h2>
                  )}
                  {entry.subheadline && (
                    <p className="mb-4 text-sm text-primary-foreground/80">
                      {entry.subheadline}
                    </p>
                  )}
                  {entry.ctaText && entry.ctaUrl && (
                    <a
                      href={entry.ctaUrl}
                      className="inline-block bg-tagline px-4 py-2 text-sm font-semibold text-white no-underline hover:opacity-90"
                    >
                      {entry.ctaText}
                    </a>
                  )}
                </div>
                {imgUrl2 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgUrl2}
                    alt=""
                    className="h-28 w-40 flex-shrink-0 rounded object-cover"
                  />
                )}
              </div>
            </div>
          );
        }

        // ── TwoAcross embed ──────────────────────────────────────────────────
        if (entry.__typename === 'TwoAcross') {
          const mediaUrl = entry.media?.url?.startsWith('//')
            ? `https:${entry.media.url}`
            : entry.media?.url;
          const imageLeft = entry.mediaPosition === 'left';
          return (
            <div className="my-6 overflow-hidden border-l-4 border-primary bg-card shadow-sm">
              <div
                className={`flex ${imageLeft ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {mediaUrl && (
                  <div className="w-48 flex-shrink-0 self-stretch">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl}
                      alt={entry.mediaAltText ?? ''}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center gap-2 px-4 py-4">
                  {entry.eyebrow && (
                    <span className="text-[10px] font-bold tracking-widest text-tagline uppercase">
                      {entry.eyebrow}
                    </span>
                  )}
                  {entry.heading && (
                    <p className="text-base leading-snug font-bold text-foreground">
                      {entry.heading}
                    </p>
                  )}
                  {entry.ctaLabel && entry.ctaUrl && (
                    <a
                      href={entry.ctaUrl}
                      className="mt-1 inline-block text-xs font-semibold text-tagline underline"
                    >
                      {entry.ctaLabel} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // ── BlogPost embed ───────────────────────────────────────────────────
        const imgUrl = entry.heroImage?.url?.startsWith('//')
          ? `https:${entry.heroImage.url}`
          : entry.heroImage?.url;
        return (
          <a
            href={entry.slug ? `/blog/${entry.slug}` : '#'}
            className="my-6 flex overflow-hidden rounded-lg border border-border bg-muted no-underline transition-colors hover:bg-secondary"
          >
            {imgUrl && (
              <div className="w-48 flex-shrink-0 self-stretch">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={entry.title ?? ''}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col justify-center gap-1 px-4 py-4">
              {entry.title && (
                <p className="text-sm font-semibold text-foreground">
                  {entry.title}
                </p>
              )}
              {entry.excerpt && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {entry.excerpt}
                </p>
              )}
            </div>
          </a>
        );
      },
      [BLOCKS.EMBEDDED_ASSET]: (node: unknown) => {
        const n = node as {
          data?: {
            target?: { fields?: { file?: { url?: string }; title?: string } };
          };
        };
        const url = n?.data?.target?.fields?.file?.url;
        const title = n?.data?.target?.fields?.title ?? '';
        if (!url) return null;
        const src = url.startsWith('//') ? `https:${url}` : url;
        return (
          <div className="my-6 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={title} className="w-full object-cover" />
          </div>
        );
      },
      [INLINES.HYPERLINK]: (node: unknown, children: React.ReactNode) => {
        const n = node as { data?: { uri?: string } };
        return (
          <a
            href={n?.data?.uri ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-tagline underline"
          >
            {children}
          </a>
        );
      },
    },
  };
}

// ─── Inner component (reads live updates) ────────────────────────────────────

interface NewsletterPageInnerProps {
  data: Newsletter;
}

function NewsletterPageInner({ data }: NewsletterPageInnerProps) {
  const liveData = useLiveUpdates(data) as Newsletter;
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const {
    title,
    sender,
    subjectLine,
    date,
    teaser,
    content,
    leadStory,
    promoSlot,
  } = liveData as typeof liveData & {
    leadStory?:
      | import('@/services/contentful/newsletter').NewsletterLinkedEntry
      | null;
    promoSlot?:
      | import('@/services/contentful/newsletter').NewsletterLinkedEntry
      | null;
  };

  const bodyJson = content?.json ?? null;
  const linkedEntries = content?.links?.entries?.block ?? [];
  const richTextOptions = buildRichTextOptions(linkedEntries);

  const displayTime = date
    ? new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  return (
    <main className="min-h-screen bg-muted">
      <div className="mx-auto max-w-5xl px-4 pt-8 pb-4 sm:px-6">
        {/* Gmail inbox row — shows how this email looks in the inbox list */}
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm select-none">
          {/* Checkbox + star placeholder */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="h-4 w-4 rounded-sm border border-border" />
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          {/* Sender */}
          <span className="w-36 flex-shrink-0 truncate font-semibold text-foreground">
            {sender ?? 'Metafi Editorial'}
          </span>
          {/* Inbox badge */}
          <span className="flex-shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
            Inbox
          </span>
          {/* Subject + teaser */}
          <span className="min-w-0 flex-1 truncate text-foreground">
            <span className="font-semibold">{subjectLine ?? title}</span>
            {teaser && (
              <span className="text-muted-foreground"> &mdash; {teaser}</span>
            )}
          </span>
          {/* Time */}
          {displayTime && (
            <span className="flex-shrink-0 text-xs font-medium text-muted-foreground">
              {displayTime}
            </span>
          )}
        </div>

        {/* Email content card */}
        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <div className="px-6 py-8 sm:px-10">
            {/* Subject as email title */}
            {(title ?? subjectLine) && (
              <h1
                className="mb-6 text-3xl leading-tight font-extrabold text-foreground md:text-4xl"
                {...getProps({ fieldId: 'title' })}
              >
                {title ?? subjectLine}
              </h1>
            )}

            {/* Lead story — above content */}
            {leadStory &&
              leadStory.__typename === 'BlogPost' &&
              (() => {
                const img = leadStory.heroImage?.url?.startsWith('//')
                  ? `https:${leadStory.heroImage.url}`
                  : leadStory.heroImage?.url;
                return (
                  <a
                    href={leadStory.slug ? `/blog/${leadStory.slug}` : '#'}
                    className="mb-6 flex overflow-hidden border-l-4 border-tagline bg-muted no-underline transition-colors hover:bg-secondary"
                    style={{ textDecoration: 'none' }}
                  >
                    {img && (
                      <div className="w-48 flex-shrink-0 self-stretch">
                        <img
                          src={img}
                          alt={leadStory.title ?? ''}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-center gap-1 px-4 py-4">
                      <span className="text-[10px] font-bold tracking-widest text-tagline uppercase">
                        Lead Story
                      </span>
                      {leadStory.title && (
                        <p className="text-base leading-snug font-bold text-foreground">
                          {leadStory.title}
                        </p>
                      )}
                      {leadStory.excerpt && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                          {leadStory.excerpt}
                        </p>
                      )}
                    </div>
                  </a>
                );
              })()}

            {/* Divider */}
            <hr className="mb-8 border-border" />

            {/* Rich text body */}
            {bodyJson && (
              <div
                className="prose dark:prose-invert max-w-none"
                {...getProps({ fieldId: 'content' })}
              >
                {documentToReactComponents(
                  bodyJson as Document,
                  richTextOptions,
                )}
              </div>
            )}

            {/* Promo slot — below content */}
            {promoSlot &&
              (() => {
                if (promoSlot.__typename === 'BlogPost') {
                  const img = promoSlot.heroImage?.url?.startsWith('//')
                    ? `https:${promoSlot.heroImage.url}`
                    : promoSlot.heroImage?.url;
                  return (
                    <a
                      href={promoSlot.slug ? `/blog/${promoSlot.slug}` : '#'}
                      className="mt-8 flex overflow-hidden border-l-4 border-primary bg-muted no-underline transition-colors hover:bg-secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      {img && (
                        <div className="w-48 flex-shrink-0 self-stretch">
                          <img
                            src={img}
                            alt={promoSlot.title ?? ''}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col justify-center gap-1 px-4 py-4">
                        <span className="text-[10px] font-bold tracking-widest text-foreground uppercase">
                          Promo
                        </span>
                        {promoSlot.title && (
                          <p className="text-base leading-snug font-bold text-foreground">
                            {promoSlot.title}
                          </p>
                        )}
                        {promoSlot.excerpt && (
                          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                            {promoSlot.excerpt}
                          </p>
                        )}
                      </div>
                    </a>
                  );
                }
                if (promoSlot.__typename === 'TwoAcross') {
                  const mediaUrl = promoSlot.media?.url?.startsWith('//')
                    ? `https:${promoSlot.media.url}`
                    : promoSlot.media?.url;
                  return (
                    <div className="mt-8 flex overflow-hidden border-l-4 border-primary bg-card shadow-sm">
                      {mediaUrl && (
                        <div className="w-48 flex-shrink-0 self-stretch">
                          <img
                            src={mediaUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col justify-center gap-2 px-4 py-4">
                        {promoSlot.eyebrow && (
                          <span className="text-[10px] font-bold tracking-widest text-foreground uppercase">
                            {promoSlot.eyebrow}
                          </span>
                        )}
                        {promoSlot.heading && (
                          <p className="text-base font-bold text-foreground">
                            {promoSlot.heading}
                          </p>
                        )}
                        {promoSlot.ctaLabel && promoSlot.ctaUrl && (
                          <a
                            href={promoSlot.ctaUrl}
                            className="text-xs font-semibold text-tagline underline"
                          >
                            {promoSlot.ctaLabel} →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }
                if (promoSlot.__typename === 'Banner') {
                  return (
                    <div className="mt-8 rounded-lg border border-border bg-primary px-6 py-8">
                      <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                          {promoSlot.headline && (
                            <p className="text-lg leading-tight font-bold text-primary-foreground">
                              {promoSlot.headline}
                            </p>
                          )}
                          {promoSlot.subheadline && (
                            <p className="mt-1 text-sm text-primary-foreground/80">
                              {promoSlot.subheadline}
                            </p>
                          )}
                        </div>
                        {promoSlot.ctaText && promoSlot.ctaUrl && (
                          <a
                            href={promoSlot.ctaUrl}
                            className="flex-shrink-0 rounded bg-tagline px-5 py-2 text-sm font-semibold text-white no-underline hover:opacity-90"
                          >
                            {promoSlot.ctaText}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Exported component (wraps LivePreviewProvider) ───────────────────────────

interface NewsletterPageProps {
  data: Newsletter;
  space?: string;
  environment?: string;
}

export function NewsletterPage({
  data,
  space,
  environment,
}: NewsletterPageProps) {
  return (
    <LivePreviewProviderWrapper space={space} environment={environment}>
      <NewsletterPageInner data={data} />
    </LivePreviewProviderWrapper>
  );
}
