import type { BannerFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { BANNER_BY_ID } from './queries';

type BannerByIdResponse = {
  bannerCollection: {
    items: Array<{
      __typename: string;
      sys: { id: string };
      internalName?: string | null;
      headline?: string | null;
      subheadline?: string | null;
      copy?: string | null;
      ctaText?: string | null;
      ctaUrl?: string | null;
      media?: {
        __typename: string;
        sys: { id: string };
        internalName?: string | null;
        asset?: { url?: string; width?: number; height?: number } | null;
        channels?: string[] | null;
        aspectRatios?: string[] | null;
      } | null;
    }>;
  };
};

export async function getBannerByEntryId({
  entryId,
  locale,
}: {
  entryId: string;
  locale: string;
}): Promise<BannerFragment | null> {
  try {
    const data = await fetchGraphQL<BannerByIdResponse>({
      query: BANNER_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const raw = data.bannerCollection?.items?.[0];
    if (!raw) return null;

    return {
      __typename: 'Banner',
      sys: raw.sys,
      internalName: raw.internalName,
      headline: raw.headline,
      subheadline: raw.subheadline,
      copy: raw.copy,
      ctaText: raw.ctaText,
      ctaUrl: raw.ctaUrl,
      game: null,
      media: raw.media
        ? { ...raw.media, __typename: 'MediaWrapper' as const }
        : null,
    };
  } catch {
    return null;
  }
}
