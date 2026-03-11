'use client';

import Image from 'next/image';

import type { SocialPostFragment } from '@/block-renderer/types';
import { useLiveUpdates } from '@/lib/live-preview';

const CHANNEL_META = {
  x: {
    label: 'X (Twitter)',
    color: '#000',
    icon: '𝕏',
    bg: '#f7f7f7',
    border: '#e5e5e5',
  },
  instagram: {
    label: 'Instagram',
    color: '#833AB4',
    icon: '📸',
    bg: '#fafafa',
    border: '#dbdbdb',
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    icon: 'f',
    bg: '#f0f2f5',
    border: '#dddfe2',
  },
} as const;

export function SocialCardPreview({
  data: rawData,
}: {
  data: SocialPostFragment;
}) {
  const data = useLiveUpdates(rawData);
  const { channel, copy, hashtags, game, media, postType, status } = data;

  const meta =
    CHANNEL_META[(channel ?? 'x') as keyof typeof CHANNEL_META] ??
    CHANNEL_META.x;
  const imageUrl = media?.asset?.url;
  const aspectRatios = media?.aspectRatios ?? [];

  const fullCopy = [copy, ...(hashtags ?? [])].filter(Boolean).join('\n\n');

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#e8eaed' }}>
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ backgroundColor: meta.color }}
            >
              {meta.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800">{meta.label}</p>
              <p className="text-xs text-gray-500">{postType ?? 'general'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{
                backgroundColor:
                  status === 'approved'
                    ? '#dcfce7'
                    : status === 'ready_for_review'
                      ? '#fef9c3'
                      : '#f3f4f6',
                color:
                  status === 'approved'
                    ? '#166534'
                    : status === 'ready_for_review'
                      ? '#854d0e'
                      : '#6b7280',
              }}
            >
              {status ?? 'draft'}
            </span>
            <span className="rounded bg-[#0B1F41] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
              Live Preview
            </span>
          </div>
        </div>

        {/* Social card mockup */}
        <div
          className="overflow-hidden rounded-xl shadow-lg"
          style={{
            backgroundColor: meta.bg,
            border: `1px solid ${meta.border}`,
          }}
        >
          {/* Platform header bar */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: `1px solid ${meta.border}` }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ backgroundColor: '#0B1F41' }}
            >
              C
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Chicago Bears</p>
              <p className="text-xs text-gray-500">
                @ChicagoBears
                {channel === 'x' && ' · Just now'}
              </p>
            </div>
            {channel === 'instagram' && (
              <span className="text-sm" style={{ color: meta.color }}>
                Follow
              </span>
            )}
          </div>

          {/* Image */}
          {imageUrl ? (
            <div
              className="relative w-full overflow-hidden bg-gray-200"
              style={{
                aspectRatio:
                  channel === 'instagram'
                    ? '4/5'
                    : channel === 'facebook'
                      ? '1.91/1'
                      : '16/9',
              }}
            >
              <Image
                src={imageUrl}
                alt="Social post image"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="flex w-full items-center justify-center"
              style={{
                aspectRatio: channel === 'instagram' ? '1/1' : '16/9',
                background: 'linear-gradient(135deg, #0B1F41, #1a3a6b)',
              }}
            >
              <div className="text-center text-white/40">
                <p className="text-4xl">🏈</p>
                <p className="mt-2 text-xs">No image uploaded</p>
              </div>
            </div>
          )}

          {/* Copy */}
          <div className="px-4 py-3">
            {game && (
              <p
                className="mb-2 text-xs font-semibold"
                style={{ color: '#C83803' }}
              >
                {game.homeAway === 'home' ? '🏟 Home' : '✈️ Away'} · Wk{' '}
                {game.week} vs {game.opponentName}
              </p>
            )}
            {fullCopy ? (
              <p className="text-sm leading-relaxed whitespace-pre-line text-gray-900">
                {fullCopy}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No copy yet — start typing in Contentful…
              </p>
            )}
          </div>

          {/* Platform footer */}
          {channel === 'x' && (
            <div
              className="flex gap-6 px-4 py-2 text-xs text-gray-500"
              style={{ borderTop: `1px solid ${meta.border}` }}
            >
              <span>💬 Reply</span>
              <span>🔁 Repost</span>
              <span>❤️ Like</span>
              <span>📤 Share</span>
            </div>
          )}
          {channel === 'instagram' && (
            <div
              className="flex gap-4 px-4 py-2 text-lg"
              style={{ borderTop: `1px solid ${meta.border}` }}
            >
              <span>🤍</span>
              <span>💬</span>
              <span>📤</span>
              <span className="ml-auto">🔖</span>
            </div>
          )}
          {channel === 'facebook' && (
            <div
              className="flex gap-4 px-4 py-2 text-xs text-gray-600"
              style={{ borderTop: `1px solid ${meta.border}` }}
            >
              <span>👍 Like</span>
              <span>💬 Comment</span>
              <span>↗️ Share</span>
            </div>
          )}
        </div>

        {/* Media wrapper info */}
        {media && (
          <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold tracking-widest text-gray-500 uppercase">
              Media Wrapper — {media.internalName}
            </p>
            <p className="mb-2 text-xs text-gray-600">
              One image → multiple channels and aspect ratios
            </p>
            <div className="flex flex-wrap gap-2">
              {(media.channels ?? []).map((ch) => (
                <span
                  key={ch}
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white uppercase"
                  style={{
                    backgroundColor:
                      CHANNEL_META[ch as keyof typeof CHANNEL_META]?.color ??
                      '#666',
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
            {aspectRatios.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {aspectRatios.map((ratio) => (
                  <span
                    key={ratio}
                    className="rounded border border-gray-200 px-2 py-0.5 font-mono text-[10px] text-gray-600"
                  >
                    {ratio}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
