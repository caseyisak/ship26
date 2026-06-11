/**
 * ProductAeoClientPage -- AEO Demo split-screen for ProductDetailPage entries.
 *
 * Duplicates the FAQ AEO pattern (FaqAeoClientPage) onto the PDP.
 * Shows before/after AI answers for product queries.
 * When governance metadata (aioAeoGeo) is linked, the "after" panel
 * upgrades from hedged to attributed with Product JSON-LD + additionalProperty.
 */
'use client';

import React, { useState } from 'react';

import type { FaqFragment, ProductDetailPageFragment } from '@/block-renderer/types';
import { useLiveUpdates } from '@/lib/live-preview';

import { AioAeoPreviewPanel } from './AioAeoPreviewPanel';
import { ProductAeoPreviewPanel } from './ProductAeoPreviewPanel';

export interface ProductScenario {
  question: string;
  /** null = "I wasn't able to find specific information about that." */
  beforeAnswer: string | null;
  afterShared: string | null;
  afterBolstered: string;
}

function getDefaultScenarios(productName: string): ProductScenario[] {
  return [
    {
      question: `Is the ${productName} good for a living room?`,
      beforeAnswer:
        'Various lighting products work in living rooms. Consider ceiling height and room size when choosing. Specific product recommendations vary by source.',
      afterShared:
        'this product is designed for open living spaces.',
      afterBolstered:
        `The ${productName} is specifically designed for open living spaces and reading corners. It requires 9ft+ ceiling clearance. 89% of buyers use it for directional reading light in their living rooms. Featured in the Curated Living Room edit collection.`,
    },
    {
      question: `What are the dimensions of the ${productName}?`,
      beforeAnswer: null,
      afterShared: null,
      afterBolstered:
        `The ${productName} stands 73" tall with a 12" diameter base, weighing 14 lbs. Requires a minimum of 9ft ceiling clearance. Uses an E26 base bulb (max 100W), and includes a 10W LED at 800 lumens.`,
    },
    {
      question: `How does the ${productName} compare to similar products?`,
      beforeAnswer:
        'There are many lighting options in this price range. Features and quality vary by manufacturer. Check reviews for comparison details.',
      afterShared:
        'this product is part of a coordinated collection.',
      afterBolstered:
        `The ${productName} is designed to pair with the Arc Floor Lamp 600, sharing the same matte-black finish and proportions. For smaller spaces, the Arc 300 offers a compact alternative. All three are part of the Arko statement lighting collection, curated by the editorial team.`,
    },
  ];
}

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
  pdpData: ProductDetailPageFragment;
  faqData?: FaqFragment | null;
  brandName?: string;
  scenarios?: ProductScenario[];
};

export function ProductAeoClientPage({
  pdpData,
  faqData,
  brandName = 'Arko Home',
  scenarios: scenariosProp,
}: Props) {
  const liveData = useLiveUpdates(pdpData);
  const liveFaqData = faqData ? useLiveUpdates(faqData) : null; // eslint-disable-line react-hooks/rules-of-hooks

  const productName = liveData.internalName?.replace(/^PDP:\s*/i, '') ?? 'this product';
  const scenarios = scenariosProp ?? getDefaultScenarios(productName);
  const [activeIndex, setActiveIndex] = useState(0);
  const scenario = scenarios[activeIndex];

  const hasGovernance = Boolean(liveData.aioAeoGeo);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{
        fontFamily:
          "'Google Sans Text', 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Product AEO Demo - Answer Engine Optimization
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Structured product content + governance metadata turns hedged AI answers
            into confident, attributed results with Product JSON-LD.
          </p>
        </div>
      </div>

      {/* Simulated search query */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
            Simulated search query
          </p>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm">
            <svg
              className="size-4 shrink-0 text-slate-400"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
            >
              <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <select
              className="flex-1 cursor-pointer bg-transparent text-sm text-slate-700 outline-none"
              value={activeIndex}
              onChange={(e) => setActiveIndex(Number(e.target.value))}
              aria-label="Select a search query"
            >
              {scenarios.map((s, i) => (
                <option key={i} value={i}>
                  {s.question}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT - Before (no structured data) */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                No structured data
              </span>
              <span className="text-xs text-slate-400">Before</span>
            </div>
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-sm bg-slate-100">
                  <span className="size-2 rounded-full bg-slate-300" />
                </span>
                <span className="text-sm font-semibold text-slate-700">AI Answer</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  <span className="size-1.5 rounded-full bg-yellow-500" />
                  Low confidence / may vary
                </span>
              </div>

              <p className="mb-3 text-sm font-medium text-slate-800">{scenario.question}</p>

              {scenario.beforeAnswer === null ? (
                <p className="text-sm leading-relaxed text-slate-400 italic">
                  I wasn&apos;t able to find specific information about that. You may want to check
                  the official product page or contact the manufacturer directly.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600">
                  <span className="italic text-slate-400">Sources say</span>{' '}
                  {scenario.beforeAnswer}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT - After (flips based on hasGovernance) */}
          <div className="flex flex-col gap-4">
            <div className="mb-3 flex items-center gap-2">
              {hasGovernance ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Product schema + Governance
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  No structured data
                </span>
              )}
              <span className="text-xs text-slate-400">After</span>
            </div>

            {/* After AI card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                {hasGovernance ? (
                  <GoogleDotsIcon />
                ) : (
                  <span className="flex size-4 items-center justify-center rounded-sm bg-slate-100">
                    <span className="size-2 rounded-full bg-slate-300" />
                  </span>
                )}
                <span className="text-sm font-semibold text-slate-700">AI Answer</span>
                {hasGovernance ? (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    High confidence - Cited source
                  </span>
                ) : (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    <span className="size-1.5 rounded-full bg-yellow-500" />
                    Low confidence / may vary
                  </span>
                )}
              </div>

              <p className="mb-3 text-sm font-medium text-slate-800">{scenario.question}</p>

              {hasGovernance ? (
                <>
                  <p className="text-sm leading-relaxed text-slate-700">
                    <mark className="rounded-sm bg-green-100 px-0.5 text-green-900 not-italic">
                      According to {brandName},
                    </mark>{' '}
                    {scenario.afterShared && <>{scenario.afterShared} </>}
                    <mark className="rounded-sm bg-green-50 px-0.5 text-green-800 not-italic">
                      {scenario.afterBolstered}
                    </mark>
                  </p>
                  <div className="mt-3 text-xs text-slate-400">
                    Source:{' '}
                    <span className="font-medium text-slate-600">{brandName}</span> - Product
                    JSON-LD schema
                  </div>
                </>
              ) : scenario.beforeAnswer === null ? (
                <p className="text-sm leading-relaxed text-slate-400 italic">
                  I wasn&apos;t able to find specific information about that. You may want to check
                  the official product page or contact the manufacturer directly.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600">
                  <span className="italic text-slate-400">Sources say</span>{' '}
                  {scenario.beforeAnswer}
                </p>
              )}
            </div>

            {/* Governance + JSON-LD panels */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <ProductAeoPreviewPanel data={liveData} brandName={brandName} />
            </div>

            {/* If FAQ data is also provided, show the FAQ panel too */}
            {liveFaqData && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <AioAeoPreviewPanel data={liveFaqData} brandName={brandName} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
