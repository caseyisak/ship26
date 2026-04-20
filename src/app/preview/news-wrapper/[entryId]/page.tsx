import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getNewsWrapperByEntryId } from '@/services/contentful/news-wrapper';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for NewsWrapper entries (no page/slug).
 * Use in Contentful: set preview URL to your enable-draft URL with entryId and type=newsWrapper,
 * which redirects here with draft mode enabled so draft content and live updates work.
 */
export default async function PreviewNewsWrapperPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const newsWrapper = await getNewsWrapperByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!newsWrapper) {
    notFound();
  }

  return <BlockRenderer data={newsWrapper} />;
}
