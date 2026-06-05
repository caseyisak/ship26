import { notFound } from 'next/navigation';
import React from 'react';

import { ProductAeoClientPage } from '@/components/demo/ProductAeoClientPage';
import { getPdpByEntryId } from '@/services/contentful/pdp';

export const revalidate = 0;
import { getFaqByEntryId } from '@/services/contentful/faq';

/**
 * Product AEO demo page -- Before / After split layout for ProductDetailPage.
 *
 * Duplicates the FAQ AEO pattern (src/app/demo/faq-aeo) onto the PDP.
 * Shows how governance metadata on a product entry changes AI answer quality.
 *
 * Query params:
 *   entryId  -- ProductDetailPage entry ID (required)
 *   faqId    -- optional FAQ entry ID (if the PDP has an FAQ section with AEO)
 *   locale   -- defaults to en-US
 */

export const metadata = {
  title: 'Product AEO Demo -- Before & After | Metafi',
  description:
    'See the difference structured content makes for product AI answer engines. Before: unstructured product data. After: Product schema + governance metadata.',
};

type Props = {
  searchParams: Promise<{ entryId?: string; faqId?: string; locale?: string }>;
};

export default async function ProductAeoPage({ searchParams }: Props) {
  const { entryId, faqId, locale } = await searchParams;

  if (!entryId) {
    notFound();
  }

  const pdpData = await getPdpByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!pdpData) {
    notFound();
  }

  // Optionally load an associated FAQ entry for the combined view
  const faqData = faqId
    ? await getFaqByEntryId({ entryId: faqId, locale: locale ?? 'en-US' })
    : null;

  return <ProductAeoClientPage pdpData={pdpData} faqData={faqData} />;
}
