import { notFound } from 'next/navigation';

import { BlockRenderer } from '@/block-renderer';
import { ProductBreadcrumb } from '@/cms-components/pdp/product-breadcrumb';
import { ProductListing } from '@/cms-components/product-listing';
import { getPdpBySlug, getPdpSlugMap } from '@/services/contentful/pdp';
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

  const [listing, settings, pdpSlugMap] = await Promise.all([
    getProductListingBySlug({ slug: plpSlug, locale: 'en-US', preview: previewEnabled }),
    getSettings(),
    getPdpSlugMap({ locale: 'en-US', preview: previewEnabled }),
  ]);

  // PLP match — render product listing
  if (listing) {
    const productCatalog = settings?.productCatalog ?? [];
    return <ProductListing data={listing} productCatalog={productCatalog} pdpSlugMap={pdpSlugMap} />;
  }

  // No PLP match — try PDP by slug (e.g. /products/ultrawide-34-in-monitor)
  if (slug?.[0]) {
    const pdp = await getPdpBySlug({ slug: slug[0], locale: 'en-US', preview: previewEnabled });
    if (pdp) {
      const productName = (pdp.sku as { name?: string } | null)?.name ?? slug[0];
      return (
        <>
          <ProductBreadcrumb productName={productName} />
          <BlockRenderer data={pdp} />
        </>
      );
    }
  }

  return notFound();
}
