'use client';

import React from 'react';

import type { HeroFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_ROWS,
  getDefaultTiles,
  parseSectionStyle,
} from '@/lib/section-style-types';
import { cn } from '@/lib/utils';

const Hero = ({ data, className, ...props }: BlockProps<HeroFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const headline =
    liveData.headline ?? 'Simplifying Payments for Growing Business';
  const subheadline =
    liveData.subheadline ??
    'Streamlining transactions for expanding enterprises. Our solutions simplify payment processes, empowering businesses to focus on growth and innovation.';
  const ctaText = liveData.ctaText ?? 'Get Started';
  const ctaUrl = liveData.ctaUrl ?? '/pricing';

  // Live preview may return sectionStyle as object or string
  const rawSectionStyle =
    (liveData as HeroFragment).sectionStyle ?? data.sectionStyle;
  const sectionStyle = parseSectionStyle(
    rawSectionStyle == null
      ? null
      : typeof rawSectionStyle === 'string'
        ? rawSectionStyle
        : typeof rawSectionStyle === 'object'
          ? JSON.stringify(rawSectionStyle)
          : String(rawSectionStyle),
  );
  const useOverride = sectionStyle.useStyleOverride;
  // Live preview returns raw Contentful field names (media), but initial data is mapped (image)
  // Check both to support live preview updates
  const rawImageUrl =
    (liveData as HeroFragment).image?.url ??
    (liveData as HeroFragment & { media?: { url?: string } | null }).media
      ?.url ??
    data.image?.url;
  const imageUrl = rawImageUrl?.startsWith('//')
    ? `https:${rawImageUrl}`
    : (rawImageUrl ?? undefined);

  // Background image (separate from hero image)
  const rawBackgroundUrl =
    (liveData as HeroFragment).background?.url ?? data.background?.url;
  const backgroundUrl = rawBackgroundUrl?.startsWith('//')
    ? `https:${rawBackgroundUrl}`
    : (rawBackgroundUrl ?? undefined);

  const contentBlock = (
    <div className="relative z-10 flex flex-col gap-6 py-14 sm:py-16 md:gap-8 md:py-24">
      <h1
        className="text-foreground text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl md:text-[68px]"
        {...getProps({ fieldId: 'headline' })}
      >
        {headline}
      </h1>
      <p
        className="text-muted-foreground md:text-md mx-auto max-w-2xl text-base sm:text-lg"
        {...getProps({ fieldId: 'subheadline' })}
      >
        {subheadline}
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <Button asChild className="w-full sm:w-auto" aria-label={ctaText}>
          <a href={ctaUrl}>{ctaText}</a>
        </Button>
      </div>
    </div>
  );

  if (!useOverride) {
    return (
      <section
        id="hero"
        className={cn(
          'border-b-border relative overflow-hidden border-b px-6 lg:px-0',
          imageUrl ? 'min-h-[400px]' : 'bg-background',
          className ?? '',
        )}
        {...props}
      >
        {imageUrl && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}
        <div className="relative z-10 container px-0 md:px-6">
          <div className="mx-auto grid max-w-4xl gap-6 text-center">
            {contentBlock}
          </div>
        </div>
      </section>
    );
  }

  const blurPx = (sectionStyle.imageBlur ?? 0) * 0.5;
  const overlayOpacity = (sectionStyle.overlayOpacity ?? 10) / 100;
  const bgColor = sectionStyle.backgroundColor;
  const contentPosition = sectionStyle.contentPosition ?? 'center';
  const contentWidth = sectionStyle.contentWidth ?? '50%';

  // Custom Grid layout
  if (sectionStyle.layout === 'customGrid') {
    const gridColumns = sectionStyle.gridColumns ?? DEFAULT_GRID_COLUMNS;
    const gridRows = sectionStyle.gridRows ?? DEFAULT_GRID_ROWS;
    const tiles = sectionStyle.tiles ?? getDefaultTiles(!!backgroundUrl);

    const backgroundTile = tiles.find(
      (t) => t.id === 'background' && t.visible !== false,
    );
    const contentTile = tiles.find(
      (t) => t.id === 'content' && t.visible !== false,
    );
    const mediaTile = tiles.find(
      (t) => t.id === 'media' && t.visible !== false,
    );

    return (
      <section
        id="hero"
        className={cn(
          'border-b-border relative min-h-[400px] overflow-hidden border-b',
          className ?? '',
        )}
        {...props}
      >
        <div
          className="relative container mx-auto min-h-[400px] px-6 py-8"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, minmax(80px, 1fr))`,
            gap: '1rem',
          }}
        >
          {/* Background tile */}
          {backgroundTile && backgroundUrl && (
            <div
              className="relative overflow-hidden rounded-lg"
              style={{
                gridColumn: `${backgroundTile.gridCol} / span ${backgroundTile.colSpan}`,
                gridRow: `${backgroundTile.gridRow} / span ${backgroundTile.rowSpan}`,
                zIndex: 0,
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${backgroundUrl})`,
                  filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
                }}
              />
              {bgColor && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: bgColor,
                    opacity: overlayOpacity,
                  }}
                />
              )}
            </div>
          )}

          {/* Content tile */}
          {contentTile && (
            <div
              className="relative flex items-center justify-center"
              style={{
                gridColumn: `${contentTile.gridCol} / span ${contentTile.colSpan}`,
                gridRow: `${contentTile.gridRow} / span ${contentTile.rowSpan}`,
                zIndex: 10,
              }}
            >
              <div className="flex flex-col gap-4 p-4">
                <h1
                  className="text-foreground text-2xl leading-tight font-medium tracking-tight text-balance sm:text-3xl md:text-4xl"
                  {...getProps({ fieldId: 'headline' })}
                >
                  {headline}
                </h1>
                <p
                  className="text-muted-foreground text-sm sm:text-base"
                  {...getProps({ fieldId: 'subheadline' })}
                >
                  {subheadline}
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Button
                    asChild
                    className="w-full sm:w-auto"
                    aria-label={ctaText}
                  >
                    <a href={ctaUrl}>{ctaText}</a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Media tile */}
          {mediaTile && (
            <div
              className="relative overflow-hidden rounded-lg"
              style={{
                gridColumn: `${mediaTile.gridCol} / span ${mediaTile.colSpan}`,
                gridRow: `${mediaTile.gridRow} / span ${mediaTile.rowSpan}`,
                zIndex: 10,
              }}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Contentful URL; next/image requires remotePatterns
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    No image
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Overlay layout
  if (sectionStyle.layout === 'overlay') {
    return (
      <section
        id="hero"
        className={cn(
          'border-b-border relative min-h-[400px] overflow-hidden border-b',
          className ?? '',
        )}
        {...props}
      >
        {imageUrl && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${imageUrl})`,
              filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
            }}
          />
        )}
        {bgColor && (
          <div
            className="absolute inset-0 z-[1]"
            style={{
              backgroundColor: bgColor,
              opacity: overlayOpacity,
            }}
          />
        )}
        <div className="relative z-10 container flex min-h-[400px] items-center px-6 py-12 md:px-6">
          <div
            className={cn(
              'w-full',
              contentPosition === 'center' && 'mx-auto text-center',
              contentPosition === 'left' && 'mr-auto text-left',
              contentPosition === 'right' && 'ml-auto text-right',
            )}
          >
            {contentBlock}
          </div>
        </div>
      </section>
    );
  }

  const gridCols =
    contentWidth === '33%'
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2';
  const contentColSpan =
    contentWidth === '33%' ? 'md:col-span-1' : 'md:col-span-1';
  const mediaColSpan =
    contentWidth === '33%' ? 'md:col-span-2' : 'md:col-span-1';

  return (
    <section
      id="hero"
      className={cn(
        'border-b-border bg-background relative overflow-hidden border-b',
        className ?? '',
      )}
      {...props}
    >
      <div className={cn('container grid gap-0 px-6 py-0 md:gap-8', gridCols)}>
        <div className={cn('flex items-center', contentColSpan)}>
          {contentBlock}
        </div>
        <div
          className={cn(
            'relative min-h-[280px] md:min-h-[400px]',
            mediaColSpan,
          )}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Contentful URL; next/image requires remotePatterns
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="bg-muted flex h-full min-h-[280px] w-full items-center justify-center md:min-h-[400px]">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { Hero };
