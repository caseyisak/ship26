'use client';

import Image from 'next/image';

import type { SocialPostFragment } from '@/block-renderer/types';
import { useLiveUpdates } from '@/lib/live-preview';

type Channel = 'x' | 'instagram' | 'facebook';

const CHANNEL_META: Record<Channel, { label: string; color: string; icon: string; bg: string; border: string }> = {
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
};

function ChannelCard({
  channel,
  copy,
  hashtags,
  game,
  media,
  postType,
  status,
}: {
  channel: Channel;
  copy?: string | null;
  hashtags?: string[] | null;
  game?: SocialPostFragment['game'];
  media?: SocialPostFragment['media'];
  postType?: string | null;
  status?: string | null;
}) {
  const meta = CHANNEL_META[channel];
  const imageUrl = media?.asset?.url;
  const fullCopy = [copy, ...(hashtags ?? [])].filter(Boolean).join('\n\n');

  return (
    <div className="mx-auto max-w-xl">
      {/* Channel label row */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white"
          style={{ backgroundColor: meta.color }}
        >
          {meta.icon}
        </span>
        <span className="text-sm font-semibold text-gray-700">{meta.label}</span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
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
      </div>

      {/* Card mockup */}
      <div
        className="overflow-hidden rounded-xl shadow-lg"
        style={{ backgroundColor: meta.bg, border: `1px solid ${meta.border}` }}
      >
        {/* Platform header */}
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
                channel === 'instagram' ? '4/5' : channel === 'facebook' ? '1.91/1' : '16/9',
            }}
          >
            <Image src={imageUrl} alt="Social post image" fill className="object-cover" />
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
            <p className="mb-2 text-xs font-semibold" style={{ color: '#C83803' }}>
              {game.homeAway === 'home' ? '🏟 Home' : '✈️ Away'} · Wk {game.week} vs{' '}
              {game.opponentName}
            </p>
          )}
          {fullCopy ? (
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-900">{fullCopy}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No copy yet — start typing in Contentful…
            </p>
          )}
          {postType && (
            <p className="mt-1 text-xs text-gray-400">{postType}</p>
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
    </div>
  );
}

export function SocialCardPreview({ data: rawData }: { data: SocialPostFragment }) {
  const data = useLiveUpdates(rawData);
  const { channel, channels, copy, hashtags, game, media, postType, status } = data;

  // Prefer the multi-select `channels` field; fall back to legacy single `channel`
  const activeChannels: Channel[] =
    channels && channels.length > 0
      ? (channels as Channel[])
      : channel
        ? [channel as Channel]
        : [];

  const aspectRatios = media?.aspectRatios ?? [];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#e8eaed' }}>
      {/* Page header */}
      <div className="mx-auto mb-6 max-w-xl flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-800">{data.internalName ?? 'Social Post'}</p>
          <p className="text-xs text-gray-500">
            {activeChannels.length > 0
              ? `${activeChannels.length} channel${activeChannels.length > 1 ? 's' : ''} selected`
              : 'No channels selected'}
          </p>
        </div>
        <span className="rounded bg-[#0B1F41] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          Live Preview
        </span>
      </div>

      {/* Stacked channel cards */}
      {activeChannels.length > 0 ? (
        <div className="flex flex-col gap-8">
          {activeChannels.map((ch) => (
            <ChannelCard
              key={ch}
              channel={ch}
              copy={copy}
              hashtags={hashtags}
              game={game}
              media={media}
              postType={postType}
              status={status}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-400">
            No channels selected — add channels in Contentful to see previews.
          </p>
        </div>
      )}

      {/* Media wrapper info */}
      {media && (
        <div className="mx-auto mt-8 max-w-xl rounded-xl bg-white p-4 shadow-sm">
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
                  backgroundColor: CHANNEL_META[ch as Channel]?.color ?? '#666',
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
  );
}
