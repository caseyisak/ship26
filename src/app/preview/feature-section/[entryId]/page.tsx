import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getFeatureSectionByEntryId } from '@/services/contentful/feature-section';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for FeatureSection entries.
 * Contentful: set preview URL to enable-draft with entryId and type=featureSection.
 */
export default async function PreviewFeatureSectionPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const featureSection = await getFeatureSectionByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!featureSection) {
    notFound();
  }

  return <BlockRenderer data={featureSection} />;
}
