'use client';

import { useState } from 'react';

import type { FaqFragment } from '@/block-renderer/types';
import { useContentfulInspectorModeProps, useLiveUpdates } from '@/lib/live-preview';

type Props = { faq: FaqFragment };

/** Client-side accordion for FAQ items fetched from Contentful, with live preview support. */
export function UpgradeFaqAccordion({ faq }: Props) {
  const liveData = useLiveUpdates(faq);
  const getProps = useContentfulInspectorModeProps(liveData.sys.id);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = liveData.itemsCollection?.items ?? [];

  if (items.length === 0) return null;

  return (
    <div className="bg-card rounded-lg divide-y divide-border border border-border" {...getProps({ fieldId: 'items' })}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.sys.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-foreground" {...getProps({ fieldId: 'question', entryId: item.sys.id })}>{item.question}</span>
              <svg
                viewBox="0 0 24 24"
                className={`w-4 h-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-sm text-muted-foreground leading-relaxed" {...getProps({ fieldId: 'answer', entryId: item.sys.id })}>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
