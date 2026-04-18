import type { MediaCardFragment, MediaCardGridFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { MEDIA_CARD_GRID_BY_ID } from './queries';

type RawMediaCard = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  media?: { url?: string } | null;
  imageFit?: string | null;
};

type RawMediaCardGrid = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  columns?: number | null;
  itemsCollection?: { items: Array<RawMediaCard | null> } | null;
};

type MediaCardGridByIdResponse = {
  mediaCardGridCollection: {
    items: Array<RawMediaCardGrid | null>;
  };
};

function mapMediaCard(item: RawMediaCard | null): MediaCardFragment | null {
  if (!item || item.__typename !== 'MediaCard') return null;
  return {
    __typename: 'MediaCard',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    media: item.media ?? null,
    imageFit: (item.imageFit as 'contain' | 'cover' | null) ?? null,
  };
}

function mapMediaCardGrid(item: RawMediaCardGrid | null): MediaCardGridFragment | null {
  if (!item || item.__typename !== 'MediaCardGrid') return null;
  return {
    __typename: 'MediaCardGrid',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    label: item.label ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    columns: item.columns ?? null,
    itemsCollection: item.itemsCollection
      ? {
          items: item.itemsCollection.items
            .map(mapMediaCard)
            .filter(Boolean) as MediaCardFragment[],
        }
      : null,
  };
}

/** Fetch a single MediaCardGrid entry by ID for ID-based live preview. */
export async function getMediaCardGridByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<MediaCardGridFragment | null> {
  try {
    const data = await fetchGraphQL<MediaCardGridByIdResponse>({
      query: MEDIA_CARD_GRID_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.mediaCardGridCollection?.items?.[0] ?? null;
    return mapMediaCardGrid(item);
  } catch {
    return null;
  }
}
