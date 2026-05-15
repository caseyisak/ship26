import type { TabbedContentFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { TABBED_CONTENT_BY_ID } from './queries';

type NtExperiencesCollection = {
  items: Array<{ __typename?: string; sys?: { id: string } }>;
};

type RawTabbedContentItem = {
  __typename: string;
  sys: { id: string };
  label?: string | null;
  body?: string | null;
  image?: { url?: string; width?: number; height?: number } | null;
  imageAlt?: string | null;
  href?: string | null;
  buttonLabel?: string | null;
};

type RawTabbedContent = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  taglineRt?: { json: Record<string, unknown> } | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  itemsCollectionCollection?: { items: RawTabbedContentItem[] } | null;
  ntExperiencesCollectionCollection?: NtExperiencesCollection | null;
};

type TabbedContentByIdResponse = {
  tabbedcontentCollection: {
    items: Array<RawTabbedContent | null>;
  };
};

function mapTabbedContentItem(
  item: RawTabbedContentItem,
): import('@/block-renderer/types').TabbedContentItemFragment | null {
  if (!item || item.__typename !== 'Tabbedcontentitem') return null;
  return {
    __typename: 'TabbedContentItem',
    sys: { id: item.sys.id },
    label: item.label ?? null,
    body: item.body ?? null,
    image: item.image ?? null,
    imageAlt: item.imageAlt ?? null,
    href: item.href ?? null,
    buttonLabel: item.buttonLabel ?? null,
  };
}

function mapTabbedContent(
  item: RawTabbedContent | null,
): TabbedContentFragment | null {
  if (!item || item.__typename !== 'Tabbedcontent') return null;
  return {
    __typename: 'Tabbedcontent',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    taglineRt: item.taglineRt ?? null,
    titleRt: item.titleRt ?? null,
    descriptionRt: item.descriptionRt ?? null,
    itemsCollection: item.itemsCollectionCollection
      ? {
          items: item.itemsCollectionCollection.items
            .map(mapTabbedContentItem)
            .filter(
              Boolean,
            ) as import('@/block-renderer/types').TabbedContentItemFragment[],
        }
      : null,
    ntExperiencesCollection:
      (item.ntExperiencesCollectionCollection as
        | { items: import('@/block-renderer/types').NtExperienceFragment[] }
        | null
        | undefined) ?? undefined,
  };
}

/** Fetch a single TabbedContent entry by ID for ID-based live preview (no page/slug). */
export async function getTabbedContentByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<TabbedContentFragment | null> {
  try {
    const data = await fetchGraphQL<TabbedContentByIdResponse>({
      query: TABBED_CONTENT_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.tabbedcontentCollection?.items?.[0] ?? null;
    return mapTabbedContent(item);
  } catch {
    return null;
  }
}
