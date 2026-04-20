import type { BannerFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { BANNER_BY_ID } from './queries';

type BannerByIdResponse = {
  bannerCollection: {
    items: Array<{
      __typename: string;
      sys: { id: string };
      internalName?: string | null;
      headlineRt?: { json: Record<string, unknown> } | null;
      subheadlineRt?: { json: Record<string, unknown> } | null;
      ctaText?: string | null;
      ctaUrl?: string | null;
      variant?: string | null;
      contentType?: string | null;
      sectionStyle?: unknown;
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
      headlineRt: raw.headlineRt ?? null,
      subheadlineRt: raw.subheadlineRt ?? null,
      ctaText: raw.ctaText,
      ctaUrl: raw.ctaUrl,
      variant: raw.variant as BannerFragment['variant'],
      contentType: raw.contentType as BannerFragment['contentType'],
      sectionStyle: raw.sectionStyle as string | null | undefined,
      game: null,
      media: raw.media
        ? { ...raw.media, __typename: 'MediaWrapper' as const }
        : null,
    };
  } catch {
    return null;
  }
}
