import type { ProductListingFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { PRODUCT_LISTING_BY_ID } from './queries';

type RawCalloutCard = {
  __typename: string;
  sys: { id: string };
  [key: string]: unknown;
};

type RawProductListing = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  titleRt?: { json: Record<string, unknown> } | null;
  collection?: string | null;
  columns?: number | null;
  calloutCardsCollection?: { items: Array<RawCalloutCard | null> } | null;
};

type ProductListingCollectionResponse = {
  productListingCollection: {
    items: Array<RawProductListing | null>;
  };
};

function mapProductListing(
  item: RawProductListing | null | undefined,
): ProductListingFragment | null {
  if (!item || item.__typename !== 'ProductListing') return null;
  return {
    __typename: 'ProductListing',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    titleRt: item.titleRt ?? null,
    collection: item.collection ?? null,
    columns: item.columns ?? null,
    calloutCardsCollection: item.calloutCardsCollection
      ? {
          items: item.calloutCardsCollection.items as NonNullable<
            ProductListingFragment['calloutCardsCollection']
          >['items'],
        }
      : null,
  };
}

/** Fetch a single ProductListing entry by ID for ID-based live preview. */
export async function getProductListingById({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<ProductListingFragment | null> {
  try {
    const data = await fetchGraphQL<ProductListingCollectionResponse>({
      query: PRODUCT_LISTING_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    return mapProductListing(data.productListingCollection?.items?.[0]);
  } catch {
    return null;
  }
}
