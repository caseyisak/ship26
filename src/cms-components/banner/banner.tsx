'use client';

import Image from 'next/image';

import type { BannerFragment, BlockProps } from '@/block-renderer/types';
import { useLiveUpdates } from '@/lib/live-preview';

export function Banner({ data: rawData }: BlockProps<BannerFragment>) {
  const data = useLiveUpdates(rawData);

  const { headline, subheadline, copy, ctaText, ctaUrl, game, media } = data;

  const imageUrl = media?.asset?.url;

  const kickoff = game?.kickoffDateTime
    ? new Date(game.kickoffDateTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: 'var(--bears-navy, #0B1F41)' }}
    >
      {/* Background image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={headline ?? 'Bears gameday'}
            fill
            className="object-cover opacity-30"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(11,31,65,0.92) 50%, rgba(200,56,3,0.4) 100%)',
            }}
          />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 md:py-16">
        {/* Game metadata badge */}
        {game && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase"
              style={{
                backgroundColor: 'var(--bears-orange, #C83803)',
                color: '#fff',
              }}
            >
              {game.homeAway === 'home' ? 'Home' : 'Away'} · Wk {game.week}
            </span>
            {kickoff && (
              <span className="text-xs text-white/70">{kickoff}</span>
            )}
          </div>
        )}

        {/* Opponent */}
        {game?.opponentName && (
          <p
            className="mb-1 text-sm font-semibold tracking-widest uppercase"
            style={{ color: 'var(--bears-orange, #C83803)' }}
          >
            vs {game.opponentName}
          </p>
        )}

        {/* Headline */}
        {headline && (
          <h2 className="mb-3 text-3xl leading-tight font-extrabold text-white md:text-5xl">
            {headline}
          </h2>
        )}

        {/* Subheadline */}
        {subheadline && (
          <p className="mb-3 text-lg font-semibold text-white/90">
            {subheadline}
          </p>
        )}

        {/* Copy */}
        {copy && (
          <p className="mb-6 max-w-2xl text-base text-white/75 md:text-lg">
            {copy}
          </p>
        )}

        {/* CTA */}
        {ctaText && (
          <a
            href={ctaUrl ?? '#'}
            className="inline-block rounded-md px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--bears-orange, #C83803)' }}
          >
            {ctaText}
          </a>
        )}
      </div>

      {/* Bottom orange stripe */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: 'var(--bears-orange, #C83803)' }}
      />
    </section>
  );
}
