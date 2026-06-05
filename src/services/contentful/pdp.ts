import type { ProductDetailPageFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { PDP_BY_ID, PDP_BY_SLUG, PDP_SLUGS } from './queries';

type RawSection = {
  __typename: string;
  sys: { id: string };
  [key: string]: unknown;
};

type RawAioAeoGeo = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  topic?: string | null;
  ownerTeam?: string | null;
  lastUpdated?: string | null;
  audience?: string | null;
  region?: string | null;
};

type RawPdp = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  sku?: Record<string, unknown> | null;
  editorNotes?: { json: Record<string, unknown> } | null;
  aioAeoGeo?: RawAioAeoGeo | null;
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
  const aioAeoGeo = item.aioAeoGeo?.__typename === 'AioAeoGeo'
    ? {
        __typename: 'AioAeoGeo' as const,
        sys: { id: item.aioAeoGeo.sys.id },
        internalName: item.aioAeoGeo.internalName ?? null,
        topic: item.aioAeoGeo.topic ?? null,
        ownerTeam: item.aioAeoGeo.ownerTeam ?? null,
        lastUpdated: item.aioAeoGeo.lastUpdated ?? null,
        audience: item.aioAeoGeo.audience ?? null,
        region: item.aioAeoGeo.region ?? null,
      }
    : null;

  return {
    __typename: 'ProductDetailPage',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    sku: item.sku ?? null,
    editorNotes: item.editorNotes ?? null,
    aioAeoGeo,
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
  } catch (err) {
    console.error('[getPdpBySlug] Failed for slug:', slug, 'preview:', preview, err);
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

/** Fetch all PDP entries and return a map of product SKU code → PDP slug. */
export async function getPdpSlugMap({
  locale = 'en-US',
  preview = false,
}: {
  locale?: string;
  preview?: boolean;
} = {}): Promise<Record<string, string>> {
  try {
    const data = await fetchGraphQL<{
      productDetailPageCollection: {
        items: Array<{
          sys: { id: string };
          slug?: string | null;
          sku?: { sku?: string } | null;
        } | null>;
      };
    }>({
      query: PDP_SLUGS,
      variables: { locale, preview },
      preview,
    });
    const map: Record<string, string> = {};
    for (const item of data.productDetailPageCollection?.items ?? []) {
      if (item?.sku?.sku && item.slug) {
        map[item.sku.sku] = item.slug;
      }
    }
    return map;
  } catch {
    return {};
  }
}
