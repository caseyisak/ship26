import { notFound } from 'next/navigation';

import { Footer } from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { ProductListing } from '@/cms-components/product-listing';
import { getProductListingBySlug } from '@/services/contentful/product-listing';
import { getSettings } from '@/services/contentful/settings';

export const revalidate = 0;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const previewEnabled = preview === 'true';

  // /products → slug "products" (main PLP), /products/audio → slug "audio"
  const plpSlug = slug?.[0] ?? 'products';

  const [listing, settings] = await Promise.all([
    getProductListingBySlug({ slug: plpSlug, locale: 'en-US', preview: previewEnabled }),
    getSettings(),
  ]);

  if (!listing) return notFound();

  const productCatalog = settings?.productCatalog ?? [];

  return (
    <>
      <Navbar />
      <main>
        <ProductListing data={listing} productCatalog={productCatalog} />
      </main>
      <Footer footerForm={settings?.footerForm} />
    </>
  );
}
