'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import type { FaqFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { useMergeTagRenderOptions } from '@/lib/rich-text-merge-tags';
import { cn } from '@/lib/utils';

// ── Variant FAQ fetch ──────────────────────────────────────────────────────
// NT variant data only includes title/description (no itemsCollection) due to
// Contentful query complexity limits. This cache fetches full variant entries
// eagerly so persona swaps feel instant.

const variantCache = new Map<string, Promise<FaqFragment | null>>();

function fetchFaqById(entryId: string): Promise<FaqFragment | null> {
  const cached = variantCache.get(entryId);
  if (cached) return cached;
  const promise = fetch(`/api/faq/${entryId}`)
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);
  variantCache.set(entryId, promise);
  return promise;
}

// ── Rich text options ──────────────────────────────────────────────────────

const faqRichTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
  },
};

// ── Source badge config ──────────────────────────────────────────────────────

const SOURCE_BADGES: Record<string, { label: string; className: string }> = {
  manufacturer: {
    label: 'From the manufacturer',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  editors: {
    label: 'Styled by our editors',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  customers: {
    label: 'Customers say',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

function SourceBadge({ source }: { source: string }) {
  const config = SOURCE_BADGES[source];
  if (!config) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

// ── FAQ item ────────────────────────────────────────────────────────────────

type FaqItemProps = {
  id: string;
  question: React.ReactNode;
  answer: React.ReactNode;
  source?: string | null;
  open: boolean;
  onToggle: (id: string) => void;
};

function FaqItem({ id, question, answer, source, open, onToggle }: FaqItemProps) {
  const regionId = `${id}-region`;

  return (
    <div
      className={cn(
        'bg-card rounded-[16px] border px-4 py-2 sm:px-6 sm:py-4',
        'border-border shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]',
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => onToggle(id)}
        className={cn(
          'group flex w-full items-center justify-between gap-4 text-left',
          'text-foreground text-xl leading-tight font-medium sm:text-2xl',
          'hover:no-underline',
          'py-1 sm:py-2',
        )}
      >
        <span className="flex items-center gap-3 pr-2">
          {question}
          {source && <SourceBadge source={source} />}
        </span>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
          strokeWidth={2}
        />
      </button>

      <div
        id={regionId}
        role="region"
        aria-hidden={!open}
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="text-muted-foreground mt-2 pb-2 text-sm font-normal whitespace-pre-wrap sm:text-base">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────

function extractRtText(
  rt: { json: Record<string, unknown> } | null | undefined,
): string {
  if (!rt?.json) return '';
  try {
    const doc = rt.json as {
      content?: Array<{ content?: Array<{ value?: string }> }>;
    };
    return (
      doc.content
        ?.flatMap((block) => block.content ?? [])
        .map((n) => n.value ?? '')
        .join('') ?? ''
    );
  } catch {
    return '';
  }
}

// ── Main component ──────────────────────────────────────────────────────────

const Faq = ({ data, className, ...props }: BlockProps<FaqFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);
  const rtOptions = useMergeTagRenderOptions(faqRichTextOptions);

  // When NT swaps to a variant FAQ, the variant data only has title/description
  // (no itemsCollection) due to Contentful query complexity limits. Detect this
  // and fetch the full variant entry to get the items.
  const [variantData, setVariantData] = useState<FaqFragment | null>(null);
  const variantId = data.sys.id;
  const hasItems = !!data.itemsCollection?.items?.length;
  useEffect(() => {
    if (hasItems) {
      setVariantData(null);
      return;
    }
    let cancelled = false;
    fetchFaqById(variantId).then((full) => {
      if (!cancelled && full) setVariantData(full);
    });
    return () => { cancelled = true; };
  }, [variantId, hasItems]);

  const effective = variantData ?? (liveData as FaqFragment);
  const titleRtData = effective.titleRt;
  const descriptionRtData = effective.descriptionRt;
  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;
  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;
  const items = variantData?.itemsCollection?.items ?? liveData.itemsCollection?.items ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: extractRtText(item.questionRt),
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractRtText(item.answerRt),
      },
    })),
  };

  // Default: all items open
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const handleToggle = (id: string) =>
    setClosedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <>
      <script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <section
      id="faq"
      className={cn('bg-background px-6 lg:px-0', className ?? '')}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 lg:py-28">
        <p
          className="text-tagline mb-4 text-center text-sm leading-tight font-normal sm:text-base"
          {...getProps({ fieldId: 'titleRt' })}
        >
          FAQ
        </p>

        {title && (
          <h2
            className="text-foreground mx-auto mb-4 max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight sm:text-4xl md:text-5xl"
            {...getProps({ fieldId: 'titleRt' })}
          >
            {title}
          </h2>
        )}

        {description && (
          <p
            className="text-muted-foreground mx-auto max-w-2xl text-center text-base font-normal sm:text-lg"
            {...getProps({ fieldId: 'descriptionRt' })}
          >
            {description}
          </p>
        )}

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:mt-14">
          {items.map((item) => {
            const id = `faq-item-${item.sys.id}`;
            const open = !closedIds.has(id);
            const question = item.questionRt?.json
              ? documentToReactComponents(
                  item.questionRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
                  faqRichTextOptions,
                )
              : null;
            const answer = item.answerRt?.json
              ? documentToReactComponents(
                  item.answerRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
                  faqRichTextOptions,
                )
              : null;

            if (!question && !answer) return null;

            return (
              <FaqItem
                key={id}
                id={id}
                question={question}
                answer={answer}
                source={item.source}
                open={open}
                onToggle={handleToggle}
              />
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
};

export { Faq };
