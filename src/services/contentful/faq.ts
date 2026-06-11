import type { FaqFragment, FaqItemFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { FAQ_BY_ID } from './queries';

type NtExperiencesCollection = {
  items: Array<{ __typename?: string; sys?: { id: string } }>;
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

type RawFaqItem = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  questionRt?: { json: Record<string, unknown> } | null;
  answerRt?: { json: Record<string, unknown> } | null;
  source?: string | null;
  aioAeoGeoCollection?: { items: Array<RawAioAeoGeo | null> } | null;
};

type RawFaq = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  faqMetadata?: RawAioAeoGeo | null;
  itemsCollection?: { items: Array<RawFaqItem | null> } | null;
  ntExperiencesCollection?: NtExperiencesCollection | null;
};

type FaqByIdResponse = {
  faqCollection: {
    items: Array<RawFaq | null>;
  };
};

function mapFaqItem(item: RawFaqItem | null): FaqItemFragment | null {
  if (!item || (item.__typename !== 'FaqItem' && item.__typename !== 'Faqitem')) return null;
  return {
    __typename: 'FaqItem',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    questionRt: item.questionRt ?? null,
    answerRt: item.answerRt ?? null,
    source: item.source ?? null,
    aioAeoGeoCollection: item.aioAeoGeoCollection
      ? {
          items: item.aioAeoGeoCollection.items
            .filter(
              (g): g is RawAioAeoGeo =>
                g !== null && g.__typename === 'AioAeoGeo',
            )
            .map((g) => ({
              __typename: 'AioAeoGeo' as const,
              sys: { id: g.sys.id },
              internalName: g.internalName ?? null,
              topic: g.topic ?? null,
              ownerTeam: g.ownerTeam ?? null,
              lastUpdated: g.lastUpdated ?? null,
              audience: g.audience ?? null,
              region: g.region ?? null,
            })),
        }
      : null,
  };
}

function mapFaq(item: RawFaq | null): FaqFragment | null {
  if (!item || item.__typename !== 'Faq') return null;
  const faqMetadata = item.faqMetadata?.__typename === 'AioAeoGeo'
    ? {
        __typename: 'AioAeoGeo' as const,
        sys: { id: item.faqMetadata.sys.id },
        internalName: item.faqMetadata.internalName ?? null,
        topic: item.faqMetadata.topic ?? null,
        ownerTeam: item.faqMetadata.ownerTeam ?? null,
        lastUpdated: item.faqMetadata.lastUpdated ?? null,
        audience: item.faqMetadata.audience ?? null,
        region: item.faqMetadata.region ?? null,
      }
    : null;

  return {
    __typename: 'Faq',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    titleRt: item.titleRt ?? null,
    descriptionRt: item.descriptionRt ?? null,
    faqMetadata,
    itemsCollection: item.itemsCollection
      ? {
          items: item.itemsCollection.items
            .map(mapFaqItem)
            .filter(Boolean) as FaqItemFragment[],
        }
      : null,
    ntExperiencesCollection:
      (item.ntExperiencesCollection as
        | { items: import('@/block-renderer/types').NtExperienceFragment[] }
        | null
        | undefined) ?? undefined,
  };
}

/** Fetch a single FAQ entry by ID for ID-based live preview (no page/slug). */
export async function getFaqByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<FaqFragment | null> {
  try {
    const data = await fetchGraphQL<FaqByIdResponse>({
      query: FAQ_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.faqCollection?.items?.[0] ?? null;
    return mapFaq(item);
  } catch {
    return null;
  }
}
