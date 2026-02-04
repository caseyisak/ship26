import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getTabbedContentByEntryId } from '@/services/contentful/tabbed-content';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for TabbedContent entries (no page/slug).
 * Use in Contentful: set preview URL to your enable-draft URL with entryId and type=tabbedContent,
 * which redirects here with draft mode enabled so draft content and live updates work.
 */
export default async function PreviewTabbedContentPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const tabbedContent = await getTabbedContentByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!tabbedContent) {
    notFound();
  }

  return <BlockRenderer data={tabbedContent} />;
}
