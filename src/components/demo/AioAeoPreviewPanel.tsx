'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import React from 'react';

import type { FaqFragment } from '@/block-renderer/types';

const rtOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
  },
};

function extractText(rt: { json: Record<string, unknown> } | null | undefined): string {
  if (!rt?.json) return '';
  try {
    const doc = rt.json as { content?: Array<{ content?: Array<{ value?: string }> }> };
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

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

// Google-style multicolor dot icon (SVG)
function GoogleDotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="4" cy="4" r="3" fill="#4285F4" />
      <circle cx="12" cy="4" r="3" fill="#EA4335" />
      <circle cx="4" cy="12" r="3" fill="#34A853" />
      <circle cx="12" cy="12" r="3" fill="#FBBC05" />
    </svg>
  );
}

type Props = {
  data: FaqFragment;
};

export function AioAeoPreviewPanel({ data }: Props) {
  const items = data.itemsCollection?.items ?? [];
  const firstItem = items[0] ?? null;
  const governance = firstItem?.aioAeoGeoCollection?.items?.[0] ?? null;
  const hasGovernance = Boolean(governance);

  // Build the JSON-LD structure from live data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: extractText(item.questionRt),
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractText(item.answerRt),
      },
    })),
  };

  // First answer text for AI Overview body
  const firstAnswerText = firstItem ? extractText(firstItem.answerRt) : '';
  const firstQuestionNode = firstItem?.questionRt?.json
    ? documentToReactComponents(
        firstItem.questionRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Governance Badges */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
          Content Governance
        </p>
        {hasGovernance && governance ? (
          <div className="flex flex-wrap gap-2">
            {governance.topic && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {governance.topic.replace(/_/g, ' ')}
              </span>
            )}
            {governance.ownerTeam && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {governance.ownerTeam}
              </span>
            )}
            {governance.region && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {governance.region}
              </span>
            )}
            {governance.lastUpdated && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Last reviewed: {formatDate(governance.lastUpdated)}
              </span>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground/50 text-xs italic">
            No governance metadata
          </p>
        )}
      </div>

      {/* AI Overview Mock */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <GoogleDotsIcon />
          <span className="text-sm font-semibold text-foreground">
            AI Overview
          </span>
          {hasGovernance ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <span className="size-1.5 rounded-full bg-green-500" />
              High confidence
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              <span className="size-1.5 rounded-full bg-yellow-500" />
              Low confidence / may vary
            </span>
          )}
        </div>

        {firstQuestionNode && (
          <p className="text-foreground mb-1 text-sm font-medium">
            {firstQuestionNode}
          </p>
        )}

        <p className="text-muted-foreground text-sm leading-relaxed">
          {firstAnswerText || 'No answer available.'}
        </p>

        <p className="text-muted-foreground/60 mt-3 text-xs">
          Source: metafi.io · FAQPage schema
        </p>
      </div>

      {/* JSON-LD Drawer */}
      <details className="rounded-xl border border-border bg-card shadow-sm">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50">
          View Structured Data ↓
        </summary>
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-muted-foreground mb-2 text-xs">
            This is what answer engines read. Generated automatically from
            Contentful entries.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-foreground">
            <code>{JSON.stringify(jsonLd, null, 2)}</code>
          </pre>
        </div>
      </details>
    </div>
  );
}
