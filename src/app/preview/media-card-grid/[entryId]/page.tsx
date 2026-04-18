import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getMediaCardGridByEntryId } from '@/services/contentful/media-card-grid';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for MediaCardGrid entries.
 * Contentful: set preview URL to enable-draft with entryId and type=mediaCardGrid.
 */
export default async function PreviewMediaCardGridPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const mediaCardGrid = await getMediaCardGridByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!mediaCardGrid) {
    notFound();
  }

  return <BlockRenderer data={mediaCardGrid} />;
}
