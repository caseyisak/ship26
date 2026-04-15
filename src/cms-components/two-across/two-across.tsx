'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import * as React from 'react';

import type { TwoAcrossFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { parseSectionStyle } from '@/lib/section-style-types';
import { cn } from '@/lib/utils';

const richTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
      <p className="text-muted-foreground mb-4 text-base leading-relaxed last:mb-0">
        {children}
      </p>
    ),
    [BLOCKS.HEADING_2]: (_node: unknown, children: React.ReactNode) => (
      <h2 className="text-foreground mb-3 text-2xl font-semibold">
        {children}
      </h2>
    ),
    [BLOCKS.HEADING_3]: (_node: unknown, children: React.ReactNode) => (
      <h3 className="text-foreground mb-2 text-xl font-semibold">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (_node: unknown, children: React.ReactNode) => (
      <ul className="text-muted-foreground mb-4 list-disc pl-6">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node: unknown, children: React.ReactNode) => (
      <ol className="text-muted-foreground mb-4 list-decimal pl-6">
        {children}
      </ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node: unknown, children: React.ReactNode) => (
      <li className="mb-1">{children}</li>
    ),
  },
};

const TwoAcross = ({
  data,
  className,
  ...props
}: BlockProps<TwoAcrossFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const eyebrow = liveData.eyebrow;
  const heading = liveData.heading;
  const body = liveData.body;
  const ctaLabel = liveData.ctaLabel;
  const ctaUrl = liveData.ctaUrl;
  const mediaPosition = liveData.mediaPosition ?? 'right';
  const colorVariant = (liveData as TwoAcrossFragment).colorVariant ?? null;

  // Parse sectionStyle — live preview may return object or string
  const rawSectionStyle = (liveData as TwoAcrossFragment).sectionStyle;
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

  const COLOR_VARIANT_CLASSES: Record<string, string> = {
    light: 'bg-white text-gray-900',
    dark: 'bg-foreground text-background',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    alt: 'bg-muted text-foreground',
  };
  const variantClass =
    useOverride && sectionStyle.backgroundColor
      ? ''
      : colorVariant
        ? (COLOR_VARIANT_CLASSES[colorVariant] ?? '')
        : 'bg-background';

  const sectionStyleInline: React.CSSProperties =
    useOverride && sectionStyle.backgroundColor
      ? { backgroundColor: sectionStyle.backgroundColor }
      : {};

  const headlineStyle: React.CSSProperties =
    useOverride && sectionStyle.headlineColor
      ? { color: sectionStyle.headlineColor }
      : {};

  const eyebrowStyle: React.CSSProperties =
    useOverride && sectionStyle.headlineColor
      ? { color: sectionStyle.headlineColor }
      : {};

  const bodyStyle: React.CSSProperties =
    useOverride && sectionStyle.subheadlineColor
      ? { color: sectionStyle.subheadlineColor }
      : {};

  // Normalize Contentful image URL (protocol-relative → https)
  type RawLiveData = TwoAcrossFragment & { media?: { url?: string } | null };
  const rawMediaUrl = (liveData as RawLiveData).media?.url ?? undefined;
  const mediaUrl = rawMediaUrl?.startsWith('//')
    ? `https:${rawMediaUrl}`
    : (rawMediaUrl ?? undefined);

  const mediaAltText = liveData.mediaAltText ?? '';

  const hasMedia = !!mediaUrl;
  const imageLeft = mediaPosition === 'left';

  const textBlock = (
    <div className="flex flex-col justify-center gap-4">
      {eyebrow && (
        <p
          className="text-primary text-sm font-semibold tracking-widest uppercase"
          style={eyebrowStyle}
          {...getProps({ fieldId: 'eyebrow' })}
        >
          {eyebrow}
        </p>
      )}
      {heading && (
        <h2
          className="text-foreground text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl"
          style={headlineStyle}
          {...getProps({ fieldId: 'heading' })}
        >
          {heading}
        </h2>
      )}
      {!!body?.json && (
        <div
          className="prose prose-sm max-w-none"
          style={bodyStyle}
          {...getProps({ fieldId: 'body' })}
        >
          {documentToReactComponents(
            body.json as Parameters<typeof documentToReactComponents>[0],
            richTextOptions,
          )}
        </div>
      )}
      {ctaLabel && (
        <div className="mt-2">
          {ctaUrl ? (
            <Button asChild className="rounded-none" aria-label={ctaLabel}>
              <a href={ctaUrl} {...getProps({ fieldId: 'ctaUrl' })}>
                {ctaLabel}
              </a>
            </Button>
          ) : (
            <Button className="rounded-none" aria-label={ctaLabel} disabled>
              {ctaLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const mediaBlock = hasMedia ? (
    <div
      className="relative min-h-[260px] w-full overflow-hidden rounded-lg sm:min-h-[340px]"
      {...getProps({ fieldId: 'media' })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Contentful URL; next/image requires remotePatterns */}
      <img
        src={mediaUrl}
        alt={mediaAltText}
        className="h-full w-full object-cover"
      />
    </div>
  ) : null;

  return (
    <section
      className={cn(
        'border-b-border border-b px-6 py-16 lg:px-0',
        variantClass,
        className ?? '',
      )}
      style={sectionStyleInline}
      {...props}
    >
      <div className="container mx-auto">
        {hasMedia ? (
          <div
            className={cn(
              'grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16',
            )}
          >
            {imageLeft ? (
              <>
                {mediaBlock}
                {textBlock}
              </>
            ) : (
              <>
                {textBlock}
                {mediaBlock}
              </>
            )}
          </div>
        ) : (
          /* No media — text renders full width */
          <div className="mx-auto max-w-3xl">{textBlock}</div>
        )}
      </div>
    </section>
  );
};

export { TwoAcross };
