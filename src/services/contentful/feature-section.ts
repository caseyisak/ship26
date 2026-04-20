import type {
  FeatureSectionFragment,
  FeatureSectionItemFragment,
} from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { FEATURE_SECTION_BY_ID } from './queries';

type RawFeatureSectionItem = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  icon?: { url?: string } | null;
  animationKey?: string | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  colorVariant?: string | null;
  href?: string | null;
};

type RawFeatureSection = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  displayVariant?: string | null;
  columns?: number | null;
  itemsCollection?: { items: Array<RawFeatureSectionItem | null> } | null;
};

type FeatureSectionByIdResponse = {
  featureSectionCollection: {
    items: Array<RawFeatureSection | null>;
  };
};

function mapFeatureSectionItem(
  item: RawFeatureSectionItem | null,
): FeatureSectionItemFragment | null {
  if (!item || item.__typename !== 'FeatureSectionItem') return null;
  return {
    __typename: 'FeatureSectionItem',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    icon: item.icon ?? null,
    animationKey: item.animationKey ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    colorVariant: (item.colorVariant as FeatureSectionItemFragment['colorVariant']) ?? null,
    href: item.href ?? null,
  };
}

function mapFeatureSection(
  item: RawFeatureSection | null,
): FeatureSectionFragment | null {
  if (!item || item.__typename !== 'FeatureSection') return null;
  return {
    __typename: 'FeatureSection',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    label: item.label ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    displayVariant: (item.displayVariant as FeatureSectionFragment['displayVariant']) ?? null,
    columns: item.columns ?? null,
    itemsCollection: item.itemsCollection
      ? {
          items: item.itemsCollection.items
            .map(mapFeatureSectionItem)
            .filter(Boolean) as FeatureSectionItemFragment[],
        }
      : null,
  };
}

/** Fetch a single FeatureSection entry by ID for ID-based live preview. */
export async function getFeatureSectionByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<FeatureSectionFragment | null> {
  try {
    const data = await fetchGraphQL<FeatureSectionByIdResponse>({
      query: FEATURE_SECTION_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.featureSectionCollection?.items?.[0] ?? null;
    return mapFeatureSection(item);
  } catch {
    return null;
  }
}
