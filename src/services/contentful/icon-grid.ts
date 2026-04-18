import type { IconGridFragment, IconGridItemFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { ICON_GRID_BY_ID } from './queries';

type RawIconGridItem = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  icon?: { url?: string } | null;
  animationKey?: string | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
};

type RawIconGrid = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  style?: string | null;
  columns?: number | null;
  itemsCollection?: { items: Array<RawIconGridItem | null> } | null;
};

type IconGridByIdResponse = {
  iconGridCollection: {
    items: Array<RawIconGrid | null>;
  };
};

function mapIconGridItem(item: RawIconGridItem | null): IconGridItemFragment | null {
  if (!item || item.__typename !== 'IconGridItem') return null;
  return {
    __typename: 'IconGridItem',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    icon: item.icon ?? null,
    animationKey: item.animationKey ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
  };
}

function mapIconGrid(item: RawIconGrid | null): IconGridFragment | null {
  if (!item || item.__typename !== 'IconGrid') return null;
  return {
    __typename: 'IconGrid',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    label: item.label ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    style: (item.style as 'card' | 'borderless' | null) ?? null,
    columns: item.columns ?? null,
    itemsCollection: item.itemsCollection
      ? {
          items: item.itemsCollection.items
            .map(mapIconGridItem)
            .filter(Boolean) as IconGridItemFragment[],
        }
      : null,
  };
}

/** Fetch a single IconGrid entry by ID for ID-based live preview. */
export async function getIconGridByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<IconGridFragment | null> {
  try {
    const data = await fetchGraphQL<IconGridByIdResponse>({
      query: ICON_GRID_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.iconGridCollection?.items?.[0] ?? null;
    return mapIconGrid(item);
  } catch {
    return null;
  }
}
