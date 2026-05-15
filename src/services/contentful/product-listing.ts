import type { ProductListingFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { PRODUCT_LISTING_BY_ID, PRODUCT_LISTING_BY_SLUG } from './queries';

type RawHero = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  headlineRt?: { json: Record<string, unknown> } | null;
  subheadlineRt?: { json: Record<string, unknown> } | null;
  background?: { url: string } | null;
  media?: { url: string } | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  sectionStyle?: string | null;
  variant?: string | null;
};

type RawCalloutCard = {
  __typename: string;
  sys: { id: string };
  [key: string]: unknown;
};

type RawProductListing = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  slug?: string | null;
  titleRt?: { json: Record<string, unknown> } | null;
  productCollection?: Record<string, unknown> | null;
  hero?: RawHero | null;
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
    slug: item.slug ?? null,
    titleRt: item.titleRt ?? null,
    productCollection: item.productCollection ?? null,
    hero: item.hero
      ? {
          __typename: 'Hero' as const,
          sys: { id: item.hero.sys.id },
          internalName: item.hero.internalName ?? null,
          headlineRt: item.hero.headlineRt ?? null,
          subheadlineRt: item.hero.subheadlineRt ?? null,
          background: item.hero.background ?? null,
          media: item.hero.media ?? null,
          ctaText: item.hero.ctaText ?? null,
          ctaUrl: item.hero.ctaUrl ?? null,
          sectionStyle: item.hero.sectionStyle ?? null,
          variant: item.hero.variant ?? null,
        }
      : null,
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

/** Fetch a single ProductListing entry by ID for live preview. */
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

/** Fetch a ProductListing page entry by slug. */
export async function getProductListingBySlug({
  slug,
  locale = 'en-US',
  preview = false,
}: {
  slug: string;
  locale?: string;
  preview?: boolean;
}): Promise<ProductListingFragment | null> {
  try {
    const data = await fetchGraphQL<ProductListingCollectionResponse>({
      query: PRODUCT_LISTING_BY_SLUG,
      variables: { slug, locale, preview },
      preview,
    });
    return mapProductListing(data.productListingCollection?.items?.[0]);
  } catch {
    return null;
  }
}
