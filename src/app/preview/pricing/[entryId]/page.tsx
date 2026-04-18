import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getPricingByEntryId } from '@/services/contentful/pricing';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for Pricing entries.
 * Contentful: set preview URL to enable-draft with entryId and type=pricing.
 */
export default async function PreviewPricingPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const pricing = await getPricingByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!pricing) {
    notFound();
  }

  return <BlockRenderer data={pricing} />;
}
