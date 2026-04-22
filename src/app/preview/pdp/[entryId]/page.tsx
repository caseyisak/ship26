import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { getPdpByEntryId } from '@/services/contentful/pdp';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for ProductDetailPage entries.
 * Enable-draft URL: /api/enable-draft?secret=kaz&entryId={entry.sys.id}&type=productDetailPage
 * Direct preview URL: /preview/pdp/[entryId]
 */
export default async function PreviewPdpPage({ params, searchParams }: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const pdp = await getPdpByEntryId({
    entryId,
    locale: locale ?? 'en-US',
  });

  if (!pdp) {
    notFound();
  }

  return <BlockRenderer data={pdp} />;
}
