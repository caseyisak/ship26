import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getFaqByEntryId } from '@/services/contentful/faq';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for FAQ entries (no page/slug).
 * Use in Contentful: set preview URL to your enable-draft URL with entryId and type=faq,
 * which redirects here with draft mode enabled so draft content and live updates work.
 */
export default async function PreviewFaqPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const faq = await getFaqByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!faq) {
    notFound();
  }

  return <BlockRenderer data={faq} />;
}
