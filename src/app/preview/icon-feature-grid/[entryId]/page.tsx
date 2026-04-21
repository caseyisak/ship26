import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getIconFeatureGridByEntryId } from '@/services/contentful/icon-feature-grid';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for IconFeatureGrid entries.
 * Contentful: set preview URL to enable-draft with entryId and type=iconFeatureGrid.
 */
export default async function PreviewIconFeatureGridPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const iconFeatureGrid = await getIconFeatureGridByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!iconFeatureGrid) {
    notFound();
  }

  return <BlockRenderer data={iconFeatureGrid} />;
}
