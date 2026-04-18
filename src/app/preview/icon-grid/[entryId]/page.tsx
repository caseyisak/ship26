import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getIconGridByEntryId } from '@/services/contentful/icon-grid';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for IconGrid entries.
 * Contentful: set preview URL to enable-draft with entryId and type=iconGrid.
 */
export default async function PreviewIconGridPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const iconGrid = await getIconGridByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!iconGrid) {
    notFound();
  }

  return <BlockRenderer data={iconGrid} />;
}
