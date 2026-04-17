import type { FaqFragment, FaqItemFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { FAQ_BY_ID } from './queries';

type NtExperiencesCollection = {
  items: Array<{ __typename?: string; sys?: { id: string } }>;
};

type RawFaqItem = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  questionRt?: { json: Record<string, unknown> } | null;
  answerRt?: { json: Record<string, unknown> } | null;
};

type RawFaq = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  itemsCollection?: { items: Array<RawFaqItem | null> } | null;
  ntExperiencesCollection?: NtExperiencesCollection | null;
};

type FaqByIdResponse = {
  faqCollection: {
    items: Array<RawFaq | null>;
  };
};

function mapFaqItem(item: RawFaqItem | null): FaqItemFragment | null {
  if (!item || item.__typename !== 'FaqItem') return null;
  return {
    __typename: 'FaqItem',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    questionRt: item.questionRt ?? null,
    answerRt: item.answerRt ?? null,
  };
}

function mapFaq(item: RawFaq | null): FaqFragment | null {
  if (!item || item.__typename !== 'Faq') return null;
  return {
    __typename: 'Faq',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    titleRt: item.titleRt ?? null,
    descriptionRt: item.descriptionRt ?? null,
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
