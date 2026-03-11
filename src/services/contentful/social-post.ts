import { draftMode } from 'next/headers';

import type { SocialPostFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { SOCIAL_POST_BY_ID } from './queries';

type SocialPostByIdResponse = {
  socialPostCollection: {
    items: Array<{
      __typename: string;
      sys: { id: string };
      internalName?: string | null;
      channel?: string | null;
      postType?: string | null;
      copy?: string | null;
      hashtags?: string[] | null;
      status?: string | null;
      game?: {
        __typename: string;
        sys: { id: string };
        title?: string | null;
        week?: number | null;
        seasonYear?: number | null;
        opponentName?: string | null;
        homeAway?: string | null;
        kickoffDateTime?: string | null;
      } | null;
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

export async function getSocialPostByEntryId({
  entryId,
  locale,
}: {
  entryId: string;
  locale: string;
}): Promise<SocialPostFragment | null> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<SocialPostByIdResponse>({
      query: SOCIAL_POST_BY_ID,
      variables: { id: entryId, locale, preview: isEnabled },
      preview: isEnabled,
    });
    const raw = data.socialPostCollection?.items?.[0];
    if (!raw) return null;

    return {
      __typename: 'SocialPost',
      sys: raw.sys,
      internalName: raw.internalName,
      channel: raw.channel as SocialPostFragment['channel'],
      postType: raw.postType,
      copy: raw.copy,
      hashtags: raw.hashtags,
      status: raw.status,
      game: raw.game ? { ...raw.game, __typename: 'Game' as const } : null,
      media: raw.media
        ? { ...raw.media, __typename: 'MediaWrapper' as const }
        : null,
    };
  } catch {
    return null;
  }
}
