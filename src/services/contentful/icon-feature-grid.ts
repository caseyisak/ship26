import type {
  IconFeatureGridFragment,
  IconFeatureItemFragment,
} from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { ICON_FEATURE_GRID_BY_ID } from './queries';

type RawIconFeatureItem = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  icon?: { url?: string } | null;
};

type RawIconFeatureGrid = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  columns?: number | null;
  itemsCollection?: { items: Array<RawIconFeatureItem | null> } | null;
};

type IconFeatureGridByIdResponse = {
  iconFeatureGridCollection: {
    items: Array<RawIconFeatureGrid | null>;
  };
};

function mapIconFeatureItem(
  item: RawIconFeatureItem | null,
): IconFeatureItemFragment | null {
  if (!item || item.__typename !== 'IconFeatureItem') return null;
  return {
    __typename: 'IconFeatureItem',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    icon: item.icon ?? null,
  };
}

function mapIconFeatureGrid(
  item: RawIconFeatureGrid | null,
): IconFeatureGridFragment | null {
  if (!item || item.__typename !== 'IconFeatureGrid') return null;
  return {
    __typename: 'IconFeatureGrid',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    label: item.label ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    columns: item.columns ?? null,
    itemsCollection: item.itemsCollection
      ? {
          items: item.itemsCollection.items
            .map(mapIconFeatureItem)
            .filter(Boolean) as IconFeatureItemFragment[],
        }
      : null,
  };
}

/** Fetch a single IconFeatureGrid entry by ID for ID-based live preview. */
export async function getIconFeatureGridByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<IconFeatureGridFragment | null> {
  try {
    const data = await fetchGraphQL<IconFeatureGridByIdResponse>({
      query: ICON_FEATURE_GRID_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.iconFeatureGridCollection?.items?.[0] ?? null;
    return mapIconFeatureGrid(item);
  } catch {
    return null;
  }
}
