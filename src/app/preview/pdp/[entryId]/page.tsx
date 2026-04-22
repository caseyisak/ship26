import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { Footer } from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { getSettings } from '@/services/contentful/settings';
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

  const [pdp, settings] = await Promise.all([
    getPdpByEntryId({ entryId, locale: locale ?? 'en-US' }),
    getSettings(),
  ]);

  if (!pdp) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main>
        <BlockRenderer data={pdp} />
      </main>
      <Footer footerForm={settings?.footerForm} />
    </>
  );
}
