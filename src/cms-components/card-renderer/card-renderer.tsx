'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import * as React from 'react';

import type { CardFragment } from '@/block-renderer/types';
import { getFeatureVisualComponent } from '@/lib/feature-visual-registry';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cardBgClass, cardMutedTextClass, cardTextClass } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';

// ── Rich-text renderer ────────────────────────────────────────────────────────

const rtOptions = {
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

// ── Shared card renderer ──────────────────────────────────────────────────────

/**
 * CardRenderer — single source of truth for all Card CT rendering.
 *
 * Respects every Card field so behaviour is consistent wherever cards appear
 * (CardsWrapper, ProductListing callout cards, etc.). Adding support for a new
 * field here propagates automatically to all consumers.
 *
 * mediaSize / mediaPlacement matrix:
 *   mediaPlacement=background OR mediaSize=background → image fills entire card, text overlaid
 *   mediaSize=icon|small|medium → constrained inline image, placement controls stacked/side-by-side
 *   mediaSize=fill|cover (default) → full-width image block, placement controls position
 *
 * colorVariant controls card background; style=borderless strips border + shadow.
 */
export function CardRenderer({
  card,
  className,
}: {
  card: CardFragment;
  className?: string;
}) {
  const liveCard = useLiveUpdates(card);
  const getCardProps = useContentfulInspectorModeProps(liveCard.sys.id);

  // Rich text
  const titleRtData = (liveCard as CardFragment).titleRt;
  const descriptionRtData = (liveCard as CardFragment).descriptionRt;
  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<
          typeof documentToReactComponents
        >[0],
        rtOptions,
      )
    : null;
  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<
          typeof documentToReactComponents
        >[0],
        rtOptions,
      )
    : null;

  // Media
  const rawUrl = (liveCard as CardFragment).media?.url ?? undefined;
  const imageUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;
  const animationKey = (liveCard as CardFragment).animationKey ?? null;
  const VisualComponent = animationKey
    ? getFeatureVisualComponent(animationKey)
    : null;

  // Layout fields
  const mediaPlacement = (liveCard as CardFragment).mediaPlacement ?? 'top';
  const mediaSize = (liveCard as CardFragment).mediaSize ?? 'fill';
  const colorVariant = (liveCard as CardFragment).colorVariant ?? null;
  const style = (liveCard as CardFragment).style ?? null;

  // Derived flags
  const isBackground =
    mediaPlacement === 'background' || mediaSize === 'background';
  const isConstrained =
    !isBackground &&
    (mediaSize === 'icon' || mediaSize === 'small' || mediaSize === 'medium');
  const isSideBySide =
    !isBackground &&
    !isConstrained &&
    (mediaPlacement === 'left' || mediaPlacement === 'right');

  // ── Background variant ────────────────────────────────────────────────────
  // Image fills the entire card; text is overlaid with a gradient for legibility.
  if (isBackground) {
    return (
      <div
        className={cn(
          'relative h-full overflow-hidden rounded-[16px]',
          !imageUrl && !VisualComponent && cardBgClass(colorVariant, style),
          className,
        )}
        {...getCardProps({ fieldId: 'media' })}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        {VisualComponent && (
          <VisualComponent className="absolute inset-0" />
        )}
        {(imageUrl || VisualComponent) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        )}
        <div className="relative z-10 flex h-full flex-col justify-end p-6">
          {title && (
            <h3
              className="text-lg font-semibold text-white"
              {...getCardProps({ fieldId: 'titleRt' })}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className="mt-1 text-sm text-white/80"
              {...getCardProps({ fieldId: 'descriptionRt' })}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Icon / small / medium variant ─────────────────────────────────────────
  // Constrained image sits beside or above text.
  if (isConstrained) {
    const imgSizeClass = {
      icon: 'h-8 w-8',
      small: 'h-12 w-12',
      medium: 'h-20 w-20',
    }[mediaSize as 'icon' | 'small' | 'medium'];

    const constrainedFlexClass =
      mediaPlacement === 'right'  ? 'flex flex-row-reverse items-start gap-4' :
      mediaPlacement === 'left'   ? 'flex flex-row items-start gap-4' :
      mediaPlacement === 'bottom' ? 'flex flex-col-reverse gap-3' :
      'flex flex-col gap-3'; // top (default)

    return (
      <div
        className={cn(
          'h-full rounded-[16px] p-6',
          cardBgClass(colorVariant, style),
          constrainedFlexClass,
          className,
        )}
      >
        {(imageUrl || VisualComponent) && (
          <div
            className={cn('flex-shrink-0', imgSizeClass)}
            {...getCardProps({ fieldId: 'media' })}
          >
            {VisualComponent ? (
              <VisualComponent className="h-full w-full" />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>
        )}
        <div className="flex flex-col">
          {title && (
            <h3
              className={cn('text-base font-semibold', cardTextClass(colorVariant))}
              {...getCardProps({ fieldId: 'titleRt' })}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className={cn('mt-1 text-sm', cardMutedTextClass(colorVariant))}
              {...getCardProps({ fieldId: 'descriptionRt' })}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Fill / cover variant (default) ────────────────────────────────────────
  const objectFit = mediaSize === 'cover' ? 'object-cover' : 'object-contain';

  const visual =
    imageUrl || VisualComponent ? (
      <div
        className={cn(
          'bg-accent relative overflow-hidden rounded-[12px]',
          isSideBySide ? 'w-full md:w-2/5' : 'w-full',
        )}
        {...getCardProps({ fieldId: 'media' })}
      >
        <div
          className={
            isSideBySide
              ? 'h-[200px] w-full md:h-full md:min-h-[180px]'
              : 'relative h-[220px] w-full sm:h-[260px] md:h-[300px]'
          }
        >
          {VisualComponent ? (
            <VisualComponent className="absolute inset-0" />
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className={objectFit}
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          ) : null}
        </div>
      </div>
    ) : null;

  const textBlock = (
    <div
      className={cn(
        'flex flex-col justify-center',
        mediaPlacement === 'left' && 'md:w-3/5 md:pl-6',
        mediaPlacement === 'right' && 'md:w-3/5 md:pr-6',
      )}
    >
      {title && (
        <h3
          className={cn('text-lg font-medium sm:text-xl', cardTextClass(colorVariant))}
          {...getCardProps({ fieldId: 'titleRt' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className={cn('mt-2 text-sm sm:text-base', cardMutedTextClass(colorVariant))}
          {...getCardProps({ fieldId: 'descriptionRt' })}
        >
          {description}
        </p>
      )}
    </div>
  );

  if (isSideBySide) {
    return (
      <div
        className={cn(
          'relative flex rounded-[16px] p-6 text-left',
          cardBgClass(colorVariant, style),
          'flex-col md:items-stretch',
          mediaPlacement === 'left' ? 'md:flex-row' : 'md:flex-row-reverse',
          className,
        )}
      >
        {visual}
        {textBlock}
      </div>
    );
  }

  // Stacked (top / bottom)
  return (
    <div
      className={cn(
        'relative flex h-full flex-col rounded-[16px] p-6 text-left',
        cardBgClass(colorVariant, style),
        className,
      )}
    >
      {mediaPlacement !== 'bottom' && visual && (
        <div className="mb-4">{visual}</div>
      )}
      {title && (
        <h3
          className={cn('text-lg font-medium sm:text-xl', cardTextClass(colorVariant))}
          {...getCardProps({ fieldId: 'titleRt' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className={cn('mt-2 text-sm sm:text-base', cardMutedTextClass(colorVariant))}
          {...getCardProps({ fieldId: 'descriptionRt' })}
        >
          {description}
        </p>
      )}
      {mediaPlacement === 'bottom' && visual && (
        <div className="mt-4">{visual}</div>
      )}
    </div>
  );
}
