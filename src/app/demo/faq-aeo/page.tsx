import { notFound } from 'next/navigation';
import React from 'react';

import { FaqAeoClientPage } from '@/components/demo/FaqAeoClientPage';
import { getFaqByEntryId } from '@/services/contentful/faq';

/**
 * AIO / AEO / GEO demo page — Before / After split layout.
 *
 * Renders FaqAeoClientPage which handles: dropdown scenario switcher,
 * before/after AI simulation cards, governance badges, and JSON-LD drawer.
 * No brandName → defaults to 'Metafi' with generic sandbox scenarios.
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

  return <FaqAeoClientPage faqData={faqData} />;
}
