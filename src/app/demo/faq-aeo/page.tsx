import { notFound } from 'next/navigation';
import React from 'react';

import { AiSimulationCard } from '@/components/demo/AiSimulationCard';
import { extractPlainText } from '@/components/demo/AioAeoPreviewPanel';
import { FaqAeoAfterPanel } from '@/components/demo/FaqAeoAfterPanel';
import { getFaqByEntryId } from '@/services/contentful/faq';

/**
 * AIO / AEO / GEO demo page — Before / After split layout.
 *
 * Left column (Before): hardcoded MetafiFaq + unstructured AI simulation card.
 * Right column (After): CMS-driven Faq with live preview + governance badges + JSON-LD drawer.
 *
 * The FAQ entry ID is the "Metafi AEO Demo FAQ" entry created for this demo.
 */
const AEO_FAQ_ENTRY_ID = '4U4M6wZA96houeEr8SVGiB';

export const metadata = {
  title: 'AEO Demo — Before & After | Metafi',
  description:
    'See the difference structured content makes for AI answer engines. Before: unstructured FAQ. After: FAQPage schema + live Contentful edits.',
};

type Props = {
  searchParams: Promise<{ entryId?: string; locale?: string }>;
};

export default async function FaqAeoPage({ searchParams }: Props) {
  const { entryId: queryEntryId, locale } = await searchParams;
  const faqData = await getFaqByEntryId({
    entryId: queryEntryId ?? AEO_FAQ_ENTRY_ID,
    locale: locale ?? 'en-US',
  });

  if (!faqData) {
    notFound();
  }

  const firstItem = faqData.itemsCollection?.items?.[0] ?? null;
  const firstQuestion = firstItem ? extractPlainText(firstItem.questionRt) : undefined;
  const firstAnswer = firstItem ? extractPlainText(firstItem.answerRt) : undefined;

  return (
    <div className="bg-background min-h-screen">
      {/* Page header */}
      <div className="border-b border-border bg-card px-6 py-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            AEO Demo — Answer Engine Optimization
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Structured content makes the difference between{' '}
            <em>based on various sources</em> and a confident, attributed AI answer.
          </p>
        </div>
      </div>

      {/* Simulated search query bar */}
      {firstQuestion && (
        <div className="border-b border-border bg-muted/30 px-4 py-4 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Simulated search query
            </p>
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 shadow-sm">
              <svg className="size-4 shrink-0 text-muted-foreground" viewBox="0 0 20 20" fill="none" aria-hidden>
                <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-foreground">{firstQuestion}</span>
            </div>
          </div>
        </div>
      )}

      {/* Split layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT — Before */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                No structured data
              </span>
              <span className="text-muted-foreground text-xs">Before</span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <AiSimulationCard question={firstQuestion} answer={firstAnswer} />
            </div>
          </div>

          {/* RIGHT — After */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                FAQPage schema + Live Preview
              </span>
              <span className="text-muted-foreground text-xs">After</span>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <FaqAeoAfterPanel data={faqData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
