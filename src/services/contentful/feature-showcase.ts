import type {
  FeatureShowcaseFragment,
  FeatureShowcaseItemFragment,
} from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { FEATURE_SHOWCASE_BY_ID } from './queries';

type RawFeatureShowcaseItem = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  media?: { url?: string } | null;
};

type RawFeatureShowcase = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  itemsCollection?: { items: Array<RawFeatureShowcaseItem | null> } | null;
};

type FeatureShowcaseByIdResponse = {
  featureShowcaseCollection: {
    items: Array<RawFeatureShowcase | null>;
  };
};

function mapFeatureShowcaseItem(
  item: RawFeatureShowcaseItem | null,
): FeatureShowcaseItemFragment | null {
  if (!item || item.__typename !== 'FeatureShowcaseItem') return null;
  return {
    __typename: 'FeatureShowcaseItem',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    media: item.media ?? null,
  };
}

function mapFeatureShowcase(item: RawFeatureShowcase | null): FeatureShowcaseFragment | null {
  if (!item || item.__typename !== 'FeatureShowcase') return null;
  return {
    __typename: 'FeatureShowcase',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    label: item.label ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    itemsCollection: item.itemsCollection
      ? {
          items: item.itemsCollection.items
            .map(mapFeatureShowcaseItem)
            .filter(Boolean) as FeatureShowcaseItemFragment[],
        }
      : null,
  };
}

/** Fetch a single FeatureShowcase entry by ID for ID-based live preview. */
export async function getFeatureShowcaseByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<FeatureShowcaseFragment | null> {
  try {
    const data = await fetchGraphQL<FeatureShowcaseByIdResponse>({
      query: FEATURE_SHOWCASE_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.featureShowcaseCollection?.items?.[0] ?? null;
    return mapFeatureShowcase(item);
  } catch {
    return null;
  }
}
