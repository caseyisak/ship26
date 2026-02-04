import { draftMode } from 'next/headers';

import type { HeroFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { HERO_BY_ID } from './queries';

type NtExperiencesCollection = {
  items: Array<{ __typename?: string; sys?: { id: string } }>;
};

type RawHero = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  variant?: string | null;
  sectionStyle?: string | null;
  background?: { url?: string } | null;
  media?: { url?: string } | null;
  ntExperiencesCollection?: NtExperiencesCollection | null;
};

type HeroByIdResponse = {
  heroCollection: {
    items: Array<RawHero | null>;
  };
};

function mapHero(item: RawHero | null): HeroFragment | null {
  if (!item || item.__typename !== 'Hero') return null;
  return {
    __typename: 'Hero',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    headline: item.headline ?? null,
    subheadline: item.subheadline ?? null,
    ctaText: item.ctaText ?? null,
    ctaUrl: item.ctaUrl ?? null,
    variant: item.variant ?? null,
    sectionStyle: item.sectionStyle ?? null,
    background: item.background ?? null,
    image: item.media ?? null,
    ntExperiencesCollection: item.ntExperiencesCollection ?? undefined,
  };
}

/** Fetch a single Hero entry by ID for ID-based live preview (no page/slug). */
export async function getHeroByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<HeroFragment | null> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<HeroByIdResponse>({
      query: HERO_BY_ID,
      variables: { id: entryId, locale, preview: isEnabled },
      preview: isEnabled,
    });
    const item = data.heroCollection?.items?.[0] ?? null;
    return mapHero(item);
  } catch {
    return null;
  }
}
