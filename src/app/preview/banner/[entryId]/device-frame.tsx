'use client';

import { CalendarDays, Home, Newspaper, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import type { BannerFragment } from '@/block-renderer/types';
import { useLiveUpdates } from '@/lib/live-preview';

const DEVICES = [
  { label: 'iPhone SE',          width: 300, height: 534, borderRadius: '2rem',   notch: true  },
  { label: 'iPhone 15',          width: 340, height: 736, borderRadius: '2.5rem', notch: true  },
  { label: 'iPhone 15 Plus',     width: 365, height: 790, borderRadius: '2.75rem',notch: true  },
  { label: 'Samsung Galaxy S24', width: 360, height: 780, borderRadius: '2.25rem',notch: false },
  { label: 'iPad Mini',          width: 520, height: 680, borderRadius: '1.5rem', notch: false },
] as const;

type Device = (typeof DEVICES)[number];

function SkeletonLine({ width = '100%', height = 8 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '10px 12px',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          backgroundColor: 'rgba(255,255,255,0.12)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonLine width="60%" height={9} />
        <SkeletonLine width="40%" height={7} />
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { label: 'Home',     Icon: Home },
  { label: 'Schedule', Icon: CalendarDays },
  { label: 'News',     Icon: Newspaper },
  { label: 'Shop',     Icon: ShoppingBag },
] as const;

const NAV_HEIGHT = 52;

export function DeviceFrame({ banner }: { banner: BannerFragment }) {
  const [device, setDevice] = useState<Device>(DEVICES[1]);
  const data = useLiveUpdates(banner);

  // variant drives banner card colours in the phone frame
  const variant = data.variant ?? 'dark';
  const cardBg =
    variant === 'light' ? 'var(--background, #f5f5f5)'
    : variant === 'alt'  ? 'var(--accent)'
    :                       'var(--primary)';
  const cardText =
    variant === 'light' ? 'var(--foreground, #111)' : 'var(--primary-foreground, #fff)';
  const cardTextMuted =
    variant === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.65)';
  const ctaBg =
    variant === 'light' ? 'var(--primary)' : 'var(--background, #fff)';
  const ctaText =
    variant === 'light' ? 'var(--primary-foreground, #fff)' : 'var(--primary)';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Device selector */}
      <select
        value={device.label}
        onChange={(e) => setDevice(DEVICES.find((d) => d.label === e.target.value)!)}
        className="cursor-pointer rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 shadow-sm"
      >
        {DEVICES.map((d) => (
          <option key={d.label} value={d.label}>
            {d.label} — {d.width}×{d.height}
          </option>
        ))}
      </select>

      {/* Phone shell */}
      <div
        style={{
          position: 'relative',
          width: device.width,
          height: device.height,
          border: '10px solid #1a1a1a',
          borderRadius: device.borderRadius,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          transition: 'width 0.3s ease, height 0.3s ease',
          flexShrink: 0,
        }}
      >
        {/* Notch */}
        {device.notch && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              height: 22,
              width: 80,
              borderBottomLeftRadius: '0.75rem',
              borderBottomRightRadius: '0.75rem',
              backgroundColor: '#1a1a1a',
            }}
          />
        )}

        {/* Scrollable viewport — [&::-webkit-scrollbar]:hidden hides scrollbar in Chrome/Safari */}
        <div
          className="[&::-webkit-scrollbar]:hidden"
          style={{
            height: `calc(100% - ${NAV_HEIGHT}px)`,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            background: 'linear-gradient(180deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
          }}
        >
          {/* Status bar skeleton */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: device.notch ? '28px 16px 4px' : '8px 16px 4px',
            }}
          >
            <SkeletonLine width={30} height={6} />
            <SkeletonLine width={40} height={6} />
          </div>

          {/* App header skeleton */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px 10px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}
              />
              <SkeletonLine width={80} height={9} />
            </div>
            <SkeletonLine width={18} height={9} />
          </div>

          {/* Banner card */}
          <div
            style={{
              backgroundColor: cardBg,
              margin: '10px 12px 0',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          >
            {data.contentType === 'sponsored' && (
              <p style={{ position: 'absolute', top: 4, left: 14, fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: cardTextMuted, margin: 0 }}>
                Sponsored
              </p>
            )}
            <div style={{ flex: 1, minWidth: 0, paddingTop: data.contentType === 'sponsored' ? 10 : 0 }}>
              {data.headline && (
                <p style={{ fontSize: 13, fontWeight: 700, color: cardText, lineHeight: 1.3, margin: 0 }}>
                  {data.headline}
                </p>
              )}
              {data.subheadline && (
                <p style={{ fontSize: 10, color: cardTextMuted, marginTop: 3, marginBottom: 0 }}>
                  {data.subheadline}
                </p>
              )}
              {!data.headline && !data.subheadline && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <SkeletonLine width="70%" height={10} />
                  <SkeletonLine width="50%" height={7} />
                </div>
              )}
            </div>
            {data.ctaText && (
              <a
                href={data.ctaUrl ?? '#'}
                style={{ backgroundColor: ctaBg, color: ctaText, fontSize: 11, fontWeight: 700, padding: '8px 12px', borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {data.ctaText}
              </a>
            )}
            <div style={{ position: 'absolute', top: 5, right: 8, fontSize: 12, color: cardTextMuted, cursor: 'pointer', lineHeight: 1 }}>
              ✕
            </div>
          </div>

          {/* Feed skeleton (below banner) */}
          <div style={{ padding: '10px 12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>

        {/* Bottom nav */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: NAV_HEIGHT,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: 'var(--primary)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            boxSizing: 'border-box',
            padding: '4px 0 6px',
          }}
        >
          {NAV_ITEMS.map(({ label, Icon }, i) => {
            const isActive = i === 0;
            return (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.4)' }}
                />
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
