'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { useNinetailed } from '@ninetailed/experience.js-react';
import * as React from 'react';

import type { HeroFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { useMergeTagRenderOptions } from '@/lib/rich-text-merge-tags';
import { NT_EVENTS } from '@/lib/nt-events';
import { getPersona } from '@/lib/persona-session';
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_ROWS,
  getDefaultTiles,
  parseSectionStyle,
} from '@/lib/section-style-types';
import { cn } from '@/lib/utils';

const heroRichTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
  },
};

const Hero = ({ data, className, ...props }: BlockProps<HeroFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);
  const { track, identify } = useNinetailed();
  const rtOptions = useMergeTagRenderOptions(heroRichTextOptions);

  const headlineRt = (liveData as HeroFragment).headlineRt;
  const subheadlineRt = (liveData as HeroFragment).subheadlineRt;
  const headline = headlineRt?.json
    ? documentToReactComponents(
        headlineRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;
  const subheadline = subheadlineRt?.json
    ? documentToReactComponents(
        subheadlineRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;
  const ctaText = liveData.ctaText;
  const ctaUrl = liveData.ctaUrl;

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

  // ── Content & button style overrides from Section Style Editor ──────────
  const textAlignClass = useOverride
    ? ({ left: 'text-left', center: 'text-center', right: 'text-right' }[sectionStyle.textAlign ?? 'left'] ?? 'text-left')
    : 'text-center';

  const spacingClass = useOverride
    ? ({
        sm: 'gap-3 py-8 sm:py-10',
        md: 'gap-6 py-14 sm:py-16',
        lg: 'gap-8 py-20 sm:py-24',
        xl: 'gap-10 py-28 sm:py-32',
      }[sectionStyle.contentSpacing ?? 'md'] ?? 'gap-6 py-14 sm:py-16')
    : 'gap-6 py-14 sm:py-16';

  const headlineStyle = useOverride && sectionStyle.headlineColor
    ? { color: sectionStyle.headlineColor } : undefined;
  const subheadlineStyle = useOverride && sectionStyle.subheadlineColor
    ? { color: sectionStyle.subheadlineColor } : undefined;

  const btnPlacementClass = useOverride
    ? ({
        left: 'sm:justify-start',
        center: 'sm:justify-center',
        right: 'sm:justify-end',
      }[sectionStyle.buttonPlacement ?? 'center'] ?? 'sm:justify-center')
    : 'sm:justify-center';

  const btnSizeClass = useOverride
    ? ({
        sm: 'px-3 py-1.5 text-sm h-auto',
        md: '',
        lg: 'px-6 py-3 text-base h-auto',
        xl: 'px-8 py-4 text-lg h-auto',
      }[sectionStyle.buttonSpacing ?? 'md'] ?? '')
    : '';

  const btnBgStyle: React.CSSProperties | undefined =
    useOverride && (sectionStyle.buttonBgColor || sectionStyle.buttonTextColor)
      ? {
          ...(sectionStyle.buttonBgColor && { backgroundColor: sectionStyle.buttonBgColor, borderColor: sectionStyle.buttonBgColor }),
          ...(sectionStyle.buttonTextColor && { color: sectionStyle.buttonTextColor }),
        }
      : undefined;

  const btnHoverColor = useOverride ? sectionStyle.buttonHoverColor : undefined;

  // Use liveData directly - don't fall back to data for live preview updates
  // If liveData.background is null/undefined, it means the field was removed
  // Note: useLiveUpdates returns raw Contentful data, so check both mapped (image) and raw (media) fields
  const rawBackgroundUrl = (liveData as HeroFragment).background?.url;
  const backgroundUrl = rawBackgroundUrl?.startsWith('//')
    ? `https:${rawBackgroundUrl}`
    : (rawBackgroundUrl ?? undefined);

  // Check both 'image' (mapped) and 'media' (raw Contentful field) for live updates
  // Contentful live preview sends 'media' field directly, not mapped to 'image'
  type RawLiveData = HeroFragment & { media?: { url?: string } | null };
  const rawImageUrl =
    (liveData as HeroFragment).image?.url ??
    (liveData as RawLiveData).media?.url ??
    undefined;

  const imageUrl = rawImageUrl?.startsWith('//')
    ? `https:${rawImageUrl}`
    : (rawImageUrl ?? undefined);

  const contentBlock = (
    <div className={cn('relative z-10 flex flex-col md:gap-8', textAlignClass, spacingClass)}>
      {headline && (
        <h1
          className="text-foreground text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl md:text-[68px]"
          style={headlineStyle}
          {...getProps({ fieldId: 'headlineRt' })}
        >
          {headline}
        </h1>
      )}
      {subheadline && (
        <p
          className={cn('text-muted-foreground md:text-md max-w-2xl text-base sm:text-lg', textAlignClass === 'text-center' && 'mx-auto')}
          style={subheadlineStyle}
          {...getProps({ fieldId: 'subheadlineRt' })}
        >
          {subheadline}
        </p>
      )}
      {ctaText && (
        <div className={cn('mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4', btnPlacementClass)}>
          {ctaUrl ? (
            <Button
              asChild
              className={cn('w-full sm:w-auto', btnSizeClass)}
              style={btnBgStyle}
              aria-label={ctaText ?? undefined}
              onMouseEnter={btnHoverColor ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = btnHoverColor; } : undefined}
              onMouseLeave={btnBgStyle ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = btnBgStyle.backgroundColor as string; } : undefined}
            >
              <a
                href={ctaUrl}
                onClick={() => {
                  track(NT_EVENTS.HERO_CTA_CLICKED, {
                    ctaText: ctaText ?? '',
                    entryId: data.sys.id,
                    segment: getPersona()?.customer_type ?? 'new-visitor',
                  });
                  identify('', { clicked_hero_cta: true });
                }}
              >
                {ctaText}
              </a>
            </Button>
          ) : (
            <Button
              className={cn('w-full sm:w-auto', btnSizeClass)}
              style={btnBgStyle}
              aria-label={ctaText ?? undefined}
              disabled
            >
              {ctaText}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // Default design: MetafiHero-style with background and media image
  if (!useOverride) {
    return (
      <section
        id="hero"
        className={cn(
          'bg-background border-b-border relative overflow-hidden border-b px-6 lg:px-0',
          className ?? '',
        )}
        {...props}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-[530px] md:h-[686px]">
            {backgroundUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                style={{ backgroundImage: `url(${backgroundUrl})` }}
                {...getProps({ fieldId: 'background' })}
              />
            )}
          </div>
        </div>

        <div className="relative container px-0 md:px-6">
          <div className="mx-auto grid max-w-4xl gap-6 py-14 text-center sm:py-16 md:gap-8 md:pt-24 md:pb-20">
            {contentBlock}
          </div>
          {imageUrl && (
            <div className="mx-auto flex w-full max-w-[994px] items-center justify-center rounded-t-[16px] bg-white/20 shadow-[0_15px_80px_-1px_rgba(8,9,10,0.04)] backdrop-blur-[20px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- Contentful URL; next/image requires remotePatterns */}
              <img
                src={imageUrl}
                alt=""
                className="h-auto w-full rounded-t-[16px] object-cover object-top"
                {...getProps({ fieldId: 'media' })}
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  // Section style override: Use background field if available, otherwise fall back to image
  const blurPx = (sectionStyle.imageBlur ?? 0) * 0.5;
  const overlayOpacity = (sectionStyle.overlayOpacity ?? 10) / 100;
  const bgColor = sectionStyle.backgroundColor;
  const contentPosition = sectionStyle.contentPosition ?? 'center';
  const contentWidth = sectionStyle.contentWidth ?? '50%';
  // Use background field if available, otherwise use image field
  const overrideImageUrl = backgroundUrl ?? imageUrl;

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
              <div className={cn('flex flex-col gap-4 p-4', textAlignClass)}>
                {headline && (
                  <h1
                    className="text-foreground text-2xl leading-tight font-medium tracking-tight text-balance sm:text-3xl md:text-4xl"
                    style={headlineStyle}
                    {...getProps({ fieldId: 'headlineRt' })}
                  >
                    {headline}
                  </h1>
                )}
                {subheadline && (
                  <p
                    className="text-muted-foreground text-sm sm:text-base"
                    style={subheadlineStyle}
                    {...getProps({ fieldId: 'subheadlineRt' })}
                  >
                    {subheadline}
                  </p>
                )}
                {ctaText && (
                  <div className={cn('mt-2 flex flex-col gap-2 sm:flex-row sm:gap-3', btnPlacementClass)}>
                    {ctaUrl ? (
                      <Button
                        asChild
                        className={cn('w-full sm:w-auto', btnSizeClass)}
                        style={btnBgStyle}
                        aria-label={ctaText ?? undefined}
                        onMouseEnter={btnHoverColor ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = btnHoverColor; } : undefined}
                        onMouseLeave={btnBgStyle ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = btnBgStyle.backgroundColor as string; } : undefined}
                      >
                        <a href={ctaUrl}>{ctaText}</a>
                      </Button>
                    ) : (
                      <Button
                        className={cn('w-full sm:w-auto', btnSizeClass)}
                        style={btnBgStyle}
                        aria-label={ctaText ?? undefined}
                        disabled
                      >
                        {ctaText}
                      </Button>
                    )}
                  </div>
                )}
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
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- Contentful URL; next/image requires remotePatterns
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
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
        {overrideImageUrl && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${overrideImageUrl})`,
              filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
            }}
            {...getProps({ fieldId: backgroundUrl ? 'background' : 'media' })}
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

  // Split layout
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
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- Contentful URL; next/image requires remotePatterns
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
              {...getProps({ fieldId: 'media' })}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export { Hero };
