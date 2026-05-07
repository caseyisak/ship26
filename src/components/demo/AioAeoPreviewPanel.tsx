'use client';

import React from 'react';

import type { FaqFragment } from '@/block-renderer/types';
import { extractPlainText } from '@/lib/faq-utils';

export { extractPlainText } from '@/lib/faq-utils';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

type Props = {
  data: FaqFragment;
  brandName?: string;
};

export function AioAeoPreviewPanel({ data, brandName = 'Metafi' }: Props) {
  const items = data.itemsCollection?.items ?? [];
  const governance = data.faqMetadata ?? null;
  const hasGovernance = Boolean(governance);

  // Build the JSON-LD structure from live data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: extractPlainText(item.questionRt),
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractPlainText(item.answerRt),
      },
    })),
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Content Governance */}
      <div className="border-b border-slate-100 px-4 py-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
          Content Governance
        </p>
        {hasGovernance && governance ? (
          <div className="flex flex-wrap gap-2">
            {governance.topic && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                {governance.topic.replace(/_/g, ' ')}
              </span>
            )}
            {governance.ownerTeam && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {governance.ownerTeam}
              </span>
            )}
            {governance.audience && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
                {governance.audience}
              </span>
            )}
            {governance.region && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {governance.region}
              </span>
            )}
            {governance.lastUpdated && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                Last reviewed: {formatDate(governance.lastUpdated)}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No governance metadata — add an AIO / AEO / GEO Governance entry to
            unlock high-confidence answers.
          </p>
        )}
      </div>

      {/* JSON-LD Drawer */}
      <details className="group">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 select-none hover:bg-slate-50">
          View Structured Data ↓
        </summary>
        <div className="border-t border-slate-100 px-4 pt-3 pb-4">
          <p className="mb-2 text-xs text-slate-400">
            {hasGovernance
              ? `FAQPage JSON-LD generated automatically from ${brandName} Contentful entries + governance metadata.`
              : 'Schema is present but lacks governance signals — answer engines may still hedge.'}
          </p>
          <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            <code>{JSON.stringify(jsonLd, null, 2)}</code>
          </pre>
        </div>
      </details>
    </div>
  );
}
