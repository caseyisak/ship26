import { notFound } from 'next/navigation';
import React from 'react';

import MetafiFaq from '@/components/sections/metafi-faq';
import { AiSimulationCard } from '@/components/demo/AiSimulationCard';
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

export default async function FaqAeoPage() {
  const faqData = await getFaqByEntryId({
    entryId: AEO_FAQ_ENTRY_ID,
    locale: 'en-US',
  });

  if (!faqData) {
    notFound();
  }

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
            <em>based on various sources</em> and a confident, attributed AI
            answer.
          </p>
        </div>
      </div>

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
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <MetafiFaq />
              <div className="px-6 pb-8">
                <AiSimulationCard variant="unstructured" />
              </div>
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
