'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import React from 'react';

import type { FaqFragment } from '@/block-renderer/types';
import { extractPlainText } from '@/lib/faq-utils';

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
  const governance = data.faqMetadata ?? null;
  const hasGovernance = Boolean(governance);

  const firstAnswerText = firstItem ? extractPlainText(firstItem.answerRt) : '';
  const firstQuestionText = firstItem ? extractPlainText(firstItem.questionRt) : '';
  // Delta: Before truncates at 160 chars; After shows the full text.
  // Only the portion beyond the truncation point is "new".
  const sharedAnswerText = firstAnswerText.slice(0, 160).trimEnd();
  const deltaAnswerText = firstAnswerText.slice(sharedAnswerText.length);
  const firstQuestionNode = firstItem?.questionRt?.json
    ? documentToReactComponents(
        firstItem.questionRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;

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
    <div className="flex flex-col gap-4">
      {/* AI Suggested Answer — two states */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <GoogleDotsIcon />
          <span className="text-sm font-semibold text-foreground">
            AI Suggested Answer
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
          <p className="text-foreground mb-2 text-sm font-medium">
            {firstQuestionNode}
          </p>
        )}

        {hasGovernance ? (
          /* High-confidence: full answer + attribution — inline highlighter-style diff */
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {sharedAnswerText}
              {deltaAnswerText && (
                <mark className="rounded-sm bg-green-200/70 px-0.5 dark:bg-green-700/40">
                  {deltaAnswerText}
                </mark>
              )}
              {!firstAnswerText && (
                <mark className="rounded-sm bg-green-200/70 px-0.5 dark:bg-green-700/40">
                  No answer available.
                </mark>
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xs text-muted-foreground">
                Source: <span className="font-medium text-foreground">metafi.io</span> · FAQPage JSON-LD schema
              </span>
              {governance?.ownerTeam && (
                <span className="text-xs text-muted-foreground">
                  · Verified by <span className="font-medium text-foreground">{governance.ownerTeam}</span>
                </span>
              )}
              {governance?.lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  · Reviewed {formatDate(governance.lastUpdated)}
                </span>
              )}
            </div>
          </>
        ) : (
          /* Low-confidence: truncated + hedge (same as Before panel) */
          <>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {firstAnswerText
                ? `${firstAnswerText.slice(0, 160).trimEnd()}… This information is synthesized from available page content and may not reflect the most current or verified guidance.`
                : 'Based on various sources, answers may vary. Check the company website for current information.'}
            </p>
            <p className="text-muted-foreground/50 mt-2 text-xs italic">
              No structured schema detected.
            </p>
          </>
        )}
      </div>

      {/* Content Governance — diff-highlighted when governance is present */}
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
            {governance.audience && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                {governance.audience}
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
            No governance metadata — add an AIO / AEO / GEO Governance entry to unlock high-confidence answers.
          </p>
        )}
      </div>

      {/* JSON-LD Drawer */}
      <details className="rounded-xl border border-border bg-card shadow-sm">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50">
          View Structured Data ↓
        </summary>
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-muted-foreground mb-2 text-xs">
            {hasGovernance
              ? 'FAQPage JSON-LD generated automatically from Contentful entries + governance metadata.'
              : 'Schema is present but lacks governance signals — answer engines may still hedge.'}
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-foreground">
            <code>{JSON.stringify(jsonLd, null, 2)}</code>
          </pre>
        </div>
      </details>
    </div>
  );
}
