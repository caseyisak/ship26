'use client';

import type { BannerFragment, BlockProps } from '@/block-renderer/types';
import { Banner4 } from '@/components/banner4';
import { useLiveUpdates } from '@/lib/live-preview';

export function Banner({ data: rawData }: BlockProps<BannerFragment>) {
  const data = useLiveUpdates(rawData);

  const { headline, subheadline, ctaText, ctaUrl, game } = data;

  // Build a rich title from game metadata if available
  const title = headline ?? (game ? `Bears vs ${game.opponentName}` : 'Chicago Bears');

  // Build description from subheadline + game context
  const gameContext = game?.kickoffDateTime
    ? new Date(game.kickoffDateTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : null;

  const description =
    subheadline ?? (gameContext ? `${game?.homeAway === 'home' ? 'Home' : 'Away'} · Wk ${game?.week} · ${gameContext}` : '');

  return (
    <Banner4
      title={title}
      description={description}
      buttonText={ctaText ?? 'Learn More'}
      buttonUrl={ctaUrl ?? '#'}
    />
  );
}
