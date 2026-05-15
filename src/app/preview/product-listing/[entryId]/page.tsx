import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { Footer } from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { getProductListingById } from '@/services/contentful/product-listing';
import { getSettings } from '@/services/contentful/settings';

type Props = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ locale?: string }>;
};

/**
 * ID-based live preview for ProductListing entries.
 * Enable-draft URL: /api/enable-draft?secret=kaz&entryId={entry.sys.id}&type=productListing
 * Direct preview URL: /preview/product-listing/[entryId]
 */
export default async function PreviewProductListingPage({
  params,
  searchParams,
}: Props) {
  const { entryId } = await params;
  const { locale } = await searchParams;

  const [listing, settings] = await Promise.all([
    getProductListingById({ entryId, locale: locale ?? 'en-US' }),
    getSettings(),
  ]);

  if (!listing) {
    notFound();
  }

  const productCatalog = settings?.productCatalog ?? [];

  return (
    <>
      <Navbar />
      <main>
        <BlockRenderer data={listing} productCatalog={productCatalog} />
      </main>
      <Footer footerForm={settings?.footerForm} />
    </>
  );
}
