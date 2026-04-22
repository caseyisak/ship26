import type { ProductDetailPageFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { PDP_BY_ID, PDP_BY_SLUG } from './queries';

type RawSection = {
  __typename: string;
  sys: { id: string };
  [key: string]: unknown;
};

type RawPdp = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  sku?: Record<string, unknown> | null;
  editorNotes?: { json: Record<string, unknown> } | null;
  sectionsCollection?: { items: Array<RawSection | null> } | null;
};

type PdpCollectionResponse = {
  productDetailPageCollection: {
    items: Array<RawPdp | null>;
  };
};

/** @deprecated use PdpCollectionResponse */
type PdpByIdResponse = PdpCollectionResponse;

function mapPdp(item: RawPdp | null | undefined): ProductDetailPageFragment | null {
  if (!item || item.__typename !== 'ProductDetailPage') return null;
  return {
    __typename: 'ProductDetailPage',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    sku: item.sku ?? null,
    editorNotes: item.editorNotes ?? null,
    sectionsCollection: item.sectionsCollection
      ? {
          items: item.sectionsCollection.items as NonNullable<ProductDetailPageFragment['sectionsCollection']>['items'],
        }
      : null,
  };
}

/** Fetch a single ProductDetailPage by slug — same pattern as getPageBySlug. */
export async function getPdpBySlug({
  slug,
  locale = 'en-US',
  preview = false,
}: {
  slug: string;
  locale?: string;
  preview?: boolean;
}): Promise<ProductDetailPageFragment | null> {
  try {
    const data = await fetchGraphQL<PdpCollectionResponse>({
      query: PDP_BY_SLUG,
      variables: { slug, locale, preview },
      preview,
    });
    return mapPdp(data.productDetailPageCollection?.items?.[0]);
  } catch {
    return null;
  }
}

/** Fetch a single ProductDetailPage entry by ID for ID-based live preview. */
export async function getPdpByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<ProductDetailPageFragment | null> {
  try {
    const data = await fetchGraphQL<PdpCollectionResponse>({
      query: PDP_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    return mapPdp(data.productDetailPageCollection?.items?.[0]);
  } catch {
    return null;
  }
}
