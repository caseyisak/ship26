'use client';

import React from 'react';

type Props = {
  question?: string;
  answer?: string;
};

/** Truncate answer to ~160 chars for the hedged "unstructured" view */
function hedgeAnswer(answer: string): string {
  const truncated = answer.length > 160 ? answer.slice(0, 160).trimEnd() + '…' : answer;
  return `${truncated} This information is synthesized from available page content and may not reflect the most current or verified guidance.`;
}

export function AiSimulationCard({ question, answer }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-4 items-center justify-center rounded-sm bg-muted">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
        </span>
        <span className="text-sm font-semibold text-muted-foreground">
          AI Suggested Answer
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <span className="size-1.5 rounded-full bg-yellow-500" />
          Low confidence / may vary
        </span>
      </div>

      {question && (
        <p className="text-foreground mb-2 text-sm font-medium">{question}</p>
      )}

      <p className="text-muted-foreground text-sm leading-relaxed">
        {answer ? hedgeAnswer(answer) : 'Based on various sources, answers may vary. Check the company website for current information.'}
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted-foreground/50 hover:text-muted-foreground">
          View Structured Data ↓
        </summary>
        <div className="mt-2 rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground/50 italic">
            No schema detected.
          </p>
        </div>
      </details>
    </div>
  );
}
