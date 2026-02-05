import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getDataVizByEntryId } from '@/services/contentful/data-viz';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for DataViz entries (no page/slug).
 * Use in Contentful: set preview URL to your enable-draft URL with entryId and type=dataViz,
 * which redirects here with draft mode enabled so draft content and live updates work.
 */
export default async function PreviewDataVizPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const dataViz = await getDataVizByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!dataViz) {
    notFound();
  }

  return <BlockRenderer data={dataViz} />;
}
