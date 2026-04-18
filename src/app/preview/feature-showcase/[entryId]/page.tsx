import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getFeatureShowcaseByEntryId } from '@/services/contentful/feature-showcase';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for FeatureShowcase entries.
 * Contentful: set preview URL to enable-draft with entryId and type=featureShowcase.
 */
export default async function PreviewFeatureShowcasePage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const featureShowcase = await getFeatureShowcaseByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!featureShowcase) {
    notFound();
  }

  return <BlockRenderer data={featureShowcase} />;
}
