/**
 * FaqAeoClientPage — AEO Demo split-screen component
 *
 * Promoted to sandbox from demo/beckons (Beckons Hotels & Resorts, April 2026).
 * See demo-loops/sandbox/loops/loop-f-aeo-faq-schema/LOOP.md
 *
 * Sandbox default scenarios match the master-env FAQ entry (4U4M6wZA96houeEr8SVGiB).
 * Demo branches override via the `scenarios` prop with prospect-specific Q&A
 * that maps to their Contentful FAQ items.
 */
'use client';

import React, { useState } from 'react';

import type { FaqFragment } from '@/block-renderer/types';
import { useLiveUpdates } from '@/lib/live-preview';

import { AioAeoPreviewPanel } from './AioAeoPreviewPanel';

export interface Scenario {
  question: string;
  /** null = "I wasn't able to find specific information about that." */
  beforeAnswer: string | null;
  /**
   * The portion of the after-answer that exists WITHOUT AEO metadata — the
   * "baseline" AI answer. null = AI has nothing without structured data.
   */
  afterShared: string | null;
  /**
   * The additional content that only appears when AEO governance metadata is
   * linked. Rendered with a green highlight to show the diff.
   */
  afterBolstered: string;
}

function getScenarios(brandName: string): Scenario[] {
  // Sandbox default scenarios — questions match master-env FAQ items (4U4M6wZA96houeEr8SVGiB).
  // Update these per demo build to match the prospect's actual Contentful FAQ entries.
  // Demo branches should pass a `scenarios` prop instead of relying on this function.
  return [
    {
      // Matches FAQ item: "How is my data protected?" (5lSrZBhKEzUTyrTq1Gn1PW)
      question: `How does ${brandName} protect my data?`,
      beforeAnswer:
        'Most cloud services use industry-standard encryption to protect customer data. Specific security practices vary by provider and may not be independently audited.',
      afterShared:
        'data is protected using standard encryption protocols common across the industry.',
      afterBolstered:
        'All customer data is encrypted in transit using TLS 1.3 and at rest using AES-256. Strict access controls are enforced and independently audited. Legal reviews data protection practices in accordance with GDPR, CCPA, and applicable regulations. No unauthorized parties can access customer data.',
    },
    {
      // Matches FAQ item: "What compliance certifications do you hold?" (65jQzT3lhm6RTaM7aLVr8i)
      question: `What compliance certifications does ${brandName} hold?`,
      beforeAnswer: null,
      afterShared: null,
      afterBolstered:
        `${brandName} holds SOC 2 Type II and ISO 27001 certifications, reviewed annually by independent auditors. PCI DSS Level 1 compliant for payment data handling. EU customers benefit from GDPR-compliant data processing agreements. A dedicated compliance team addresses any regulatory requirements.`,
    },
    {
      // Matches FAQ item: "How do I get support?" (3nLaRNcri3JeNY5dD8ur3R)
      question: `How do I get support from ${brandName}?`,
      beforeAnswer:
        'Customer support availability varies by vendor. Most offer email and chat support, with phone support typically reserved for enterprise customers.',
      afterShared:
        'support is available via multiple channels, with faster response times for higher-tier plans.',
      afterBolstered:
        'Live chat is available 24/7 for all plans. Email response within 4 hours on business days. Phone support on Enterprise plans. All plans include access to a comprehensive knowledge base and video tutorials. Enterprise customers receive a named Customer Success manager and priority escalation paths.',
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
  brandName?: string;
  faqData: FaqFragment;
  /** Pass prospect-specific scenarios to override sandbox defaults. */
  scenarios?: Scenario[];
};

export function FaqAeoClientPage({ brandName = 'Metafi', faqData, scenarios: scenariosProp }: Props) {
  const liveData = useLiveUpdates(faqData);
  const scenarios = scenariosProp ?? getScenarios(brandName);
  const [activeIndex, setActiveIndex] = useState(0);
  const scenario = scenarios[activeIndex];
  // When governance metadata is linked, the after-panel upgrades to cited/structured.
  // Without it, both panels show the same hedged answer — so the demo moment
  // is: attach the governance entry in Contentful → watch the right side flip live.
  const hasMetadata = Boolean(liveData.faqMetadata);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{
        fontFamily:
          "'Google Sans Text', 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Page header — neutral slate, no brand CSS vars */}
      <div className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            AEO Demo — Answer Engine Optimization
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Structured content makes the difference between{' '}
            <em className="text-slate-400">based on various sources</em> and a
            confident, attributed AI answer.
          </p>
        </div>
      </div>

      {/* Simulated search query — dropdown with 3 scenarios */}
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
              <circle
                cx="8.5"
                cy="8.5"
                r="5.75"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M13.5 13.5L17 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
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
          {/* LEFT — Before (always: no structured data) */}
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
                  the official website or contact support directly.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600">
                  <span className="italic text-slate-400">Sources say</span>{' '}
                  {scenario.beforeAnswer}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT — After (flips based on hasMetadata) */}
          <div className="flex flex-col gap-4">
            <div className="mb-3 flex items-center gap-2">
              {hasMetadata ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  FAQPage schema + Live Preview
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
                {hasMetadata ? (
                  <GoogleDotsIcon />
                ) : (
                  <span className="flex size-4 items-center justify-center rounded-sm bg-slate-100">
                    <span className="size-2 rounded-full bg-slate-300" />
                  </span>
                )}
                <span className="text-sm font-semibold text-slate-700">AI Answer</span>
                {hasMetadata ? (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    High confidence · Cited source
                  </span>
                ) : (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    <span className="size-1.5 rounded-full bg-yellow-500" />
                    Low confidence / may vary
                  </span>
                )}
              </div>

              <p className="mb-3 text-sm font-medium text-slate-800">{scenario.question}</p>

              {hasMetadata ? (
                <>
                  {/* With governance: brand citation + shared baseline + green-highlighted bolstered */}
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
                    <span className="font-medium text-slate-600">{brandName}</span> · FAQPage
                    JSON-LD schema
                  </div>
                </>
              ) : scenario.beforeAnswer === null ? (
                /* Without governance + no before answer: same "can't find" state */
                <p className="text-sm leading-relaxed text-slate-400 italic">
                  I wasn&apos;t able to find specific information about that. You may want to check
                  the official website or contact support directly.
                </p>
              ) : (
                /* Without governance: mirrors the before panel exactly */
                <p className="text-sm leading-relaxed text-slate-600">
                  <span className="italic text-slate-400">Sources say</span>{' '}
                  {scenario.beforeAnswer}
                </p>
              )}
            </div>

            {/* Governance + JSON-LD panel (live Contentful data) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <AioAeoPreviewPanel data={liveData} brandName={brandName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
