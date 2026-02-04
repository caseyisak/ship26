'use client';

import type { HeroFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { parseSectionStyle } from '@/lib/section-style-types';
import { GridBackground } from '@/components/ui/grid-background';
import { cn } from '@/lib/utils';

const Hero = ({ data, className, ...props }: BlockProps<HeroFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const headline = liveData.headline;
  const subheadline = liveData.subheadline;
  const ctaText = liveData.ctaText;
  const ctaUrl = liveData.ctaUrl;

  const rawSectionStyle =
    (liveData as HeroFragment).sectionStyle ?? data.sectionStyle;
  const sectionStyle = parseSectionStyle(
    rawSectionStyle == null
      ? null
      : typeof rawSectionStyle === 'string'
        ? rawSectionStyle
        : JSON.stringify(rawSectionStyle),
  );
  const useOverride = sectionStyle.useStyleOverride;

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
    ((liveData as RawLiveData).media?.url ?? undefined);

  const imageUrl = rawImageUrl?.startsWith('//')
    ? `https:${rawImageUrl}`
    : (rawImageUrl ?? undefined);

  const contentBlock = (
    <div className="relative z-10 flex flex-col gap-6 py-14 sm:py-16 md:gap-8 md:py-24">
      {headline && (
        <h1
          className="text-foreground text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl md:text-[68px]"
          {...getProps({ fieldId: 'headline' })}
        >
          {headline}
        </h1>
      )}
      {subheadline && (
        <p
          className="text-muted-foreground md:text-md mx-auto max-w-2xl text-base sm:text-lg"
          {...getProps({ fieldId: 'subheadline' })}
        >
          {subheadline}
        </p>
      )}
      {ctaText && ctaUrl && (
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          <Button
            asChild
            className="w-full sm:w-auto"
            aria-label={ctaText ?? undefined}
          >
            <a href={ctaUrl ?? undefined}>{ctaText}</a>
          </Button>
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
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                  style={{ backgroundImage: `url(${backgroundUrl})` }}
                  {...getProps({ fieldId: 'background' })}
                />
                <GridBackground className="[background-size:calc(var(--square-size,64px))_calc(var(--square-size,64px))]" />
                <div className="from-background to-background/0 absolute inset-x-0 top-0 h-40 bg-gradient-to-b" />
              </>
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
  const isOverlay = sectionStyle.layout === 'overlay';
  const contentPosition = sectionStyle.contentPosition ?? 'center';
  const contentWidth = sectionStyle.contentWidth ?? '50%';
  // Use background field if available, otherwise use image field
  const overrideImageUrl = backgroundUrl ?? imageUrl;

  if (isOverlay) {
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
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Contentful URL; next/image requires remotePatterns
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
              {...getProps({ fieldId: 'media' })}
            />
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
