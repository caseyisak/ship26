'use client';
// v2
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import * as React from 'react';

import type {
  CardFragment,
  CardsWrapperFragment,
} from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { getFeatureVisualComponent } from '@/lib/feature-visual-registry';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

const SECTION_BG: Record<string, React.CSSProperties> = {
  light: { backgroundColor: 'var(--background)', color: 'var(--foreground)' },
  dark: { backgroundColor: 'var(--foreground)', color: 'var(--background)' },
  accent: { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' },
};
const SECTION_MUTED: Record<string, string> = {
  light: 'text-muted-foreground',
  dark: 'text-background/70',
  accent: 'text-primary-foreground/80',
};
const COL_CLASS: Record<number, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

const cardsWrapperRichTextOptions = {
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

function CardItem({
  item,
  mutedClass = 'text-muted-foreground',
  layoutStyle = 'card',
}: {
  item: CardFragment;
  mutedClass?: string;
  /** Fallback style from the wrapper — overridden by card's own style field */
  layoutStyle?: string;
}) {
  // Apply live updates to RAW Contentful data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liveItem = useLiveUpdates(item) as any;
  const getItemProps = useContentfulInspectorModeProps(item.sys.id);

  // Extract fields — prefer RT fields
  const titleRtData = (liveItem as CardFragment).titleRt;
  const descriptionRtData = (liveItem as CardFragment).descriptionRt ?? (liveItem as CardFragment).descriptionRt;
  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        cardsWrapperRichTextOptions,
      )
    : null;
  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        cardsWrapperRichTextOptions,
      )
    : null;
  const animationKey = liveItem.animationKey ?? null;

  // Use raw Contentful field name 'media', not mapped 'image'
  const rawUrl = liveItem.media?.url ?? undefined;
  const imageUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;

  const VisualComponent = animationKey
    ? getFeatureVisualComponent(animationKey)
    : null;

  // Per-card style + colorVariant (card fields override wrapper fallback)
  const cardStyle = (liveItem as CardFragment).style ?? layoutStyle ?? 'card';
  const cardVariant = (liveItem as CardFragment).colorVariant ?? null;
  const isBorderless = cardStyle === 'borderless';

  // Card background + text color based on cardVariant
  const CARD_VARIANT_MUTED: Record<string, string> = {
    dark: 'text-background/70',
    accent: 'text-primary-foreground/80',
  };
  const cardBgStyle: React.CSSProperties =
    cardVariant === 'dark'
      ? { backgroundColor: 'var(--foreground)', color: 'var(--background)' }
      : cardVariant === 'accent'
        ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
        : {};
  const cardHasBg = cardVariant !== 'transparent';
  const cardMutedClass = CARD_VARIANT_MUTED[cardVariant ?? ''] ?? mutedClass;

  // Read mediaPlacement and mediaSize per-item
  const pos = (liveItem as CardFragment).mediaPlacement ?? 'top';
  const mediaSize = (liveItem as CardFragment).mediaSize ?? 'fill';
  const isSideBySide = pos === 'left' || pos === 'right';
  const isConstrained = mediaSize === 'icon' || mediaSize === 'small' || mediaSize === 'medium';

  // Determine image container classes based on mediaSize
  const mediaSizeClasses: Record<string, string> = {
    icon: 'w-12 h-12',
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    fill: isSideBySide ? 'h-[200px] w-full md:h-full md:min-h-[180px]' : 'h-[220px] w-full sm:h-[260px] md:h-[300px]',
    cover: isSideBySide ? 'h-[200px] w-full md:h-full md:min-h-[180px]' : 'h-[220px] w-full sm:h-[260px] md:h-[300px]',
  };
  const imageObjectFit = mediaSize === 'cover' ? 'object-cover' : 'object-contain';

  // For icon/small/medium: render inline image (no fill layout); for fill/cover use Next.js fill
  const visualInner = isConstrained ? (
    <div className={cn('relative flex items-center justify-center', mediaSizeClasses[mediaSize])}>
      {VisualComponent ? (
        <VisualComponent className="h-full w-full" />
      ) : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className={cn('h-full w-full', imageObjectFit)}
          {...getItemProps({ fieldId: 'media' })}
        />
      ) : null}
    </div>
  ) : isSideBySide ? (
    <div className={cn('bg-accent relative', mediaSizeClasses[mediaSize])}>
      {VisualComponent ? (
        <VisualComponent className="absolute inset-0" />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          className={imageObjectFit}
          sizes="(max-width: 768px) 100vw, 40vw"
          priority={false}
          {...getItemProps({ fieldId: 'media' })}
        />
      ) : null}
    </div>
  ) : (
    <div className={cn('bg-accent relative', mediaSizeClasses[mediaSize])}>
      {VisualComponent ? (
        <VisualComponent className="absolute inset-0" />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          className={imageObjectFit}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
          {...getItemProps({ fieldId: 'media' })}
        />
      ) : null}
    </div>
  );

  const visual =
    VisualComponent || imageUrl ? (
      <div
        className={cn(
          'relative overflow-hidden rounded-[12px]',
          isConstrained
            ? 'shrink-0'
            : isSideBySide
              ? 'w-full md:w-2/5'
              : 'w-full',
        )}
      >
        {visualInner}
      </div>
    ) : null;

  const textBlock = (
    <div
      className={cn(
        'flex flex-col justify-center',
        !isConstrained && pos === 'left' && 'md:w-3/5 md:pl-6',
        !isConstrained && pos === 'right' && 'md:w-3/5 md:pr-6',
        isConstrained && isSideBySide && 'ml-4',
      )}
    >
      {title && (
        <h3
          className="text-lg font-medium sm:text-xl"
          {...getItemProps({ fieldId: 'titleRt' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className={cn(cardMutedClass, 'mt-2 text-sm sm:text-base')}
          {...getItemProps({ fieldId: 'descriptionRt' })}
        >
          {description}
        </p>
      )}
    </div>
  );

  // null/light → bg-card + border + shadow; dark/accent → shadow only (inline style handles bg+color); transparent/borderless → no chrome
  const showCardChrome = !isBorderless && cardHasBg && (cardVariant === null || cardVariant === 'light');
  const showCardShadow = !isBorderless && cardHasBg && (cardVariant === 'dark' || cardVariant === 'accent');

  if (isSideBySide) {
    return (
      <div
        className={cn(
          'relative flex rounded-[16px] p-6 text-left',
          showCardChrome && 'bg-card border-border-light border shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)] text-foreground',
          showCardShadow && 'shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]',
          'flex-col md:items-stretch',
          pos === 'left' ? 'md:flex-row' : 'md:flex-row-reverse',
        )}
        style={cardBgStyle}
      >
        {visual}
        {textBlock}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-[16px] p-6 text-left',
        showCardChrome && 'bg-card border-border-light border shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)] text-foreground',
        showCardShadow && 'shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]',
      )}
      style={cardBgStyle}
    >
      {pos === 'top' && visual && <div className="mb-4">{visual}</div>}

      {title && (
        <h3
          className="text-lg font-medium sm:text-xl"
          {...getItemProps({ fieldId: 'titleRt' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className={cn(cardMutedClass, 'mt-2 text-sm sm:text-base')}
          {...getItemProps({ fieldId: 'descriptionRt' })}
        >
          {description}
        </p>
      )}

      {pos === 'bottom' && visual && <div className="mt-4">{visual}</div>}
    </div>
  );
}

const CardsWrapper = ({
  data,
  className,
  ...props
}: BlockProps<CardsWrapperFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const labelRtData = (liveData as CardsWrapperFragment).labelRt;
  const titleRtData = (liveData as CardsWrapperFragment).titleRt;
  const descriptionRtData = (liveData as CardsWrapperFragment).descriptionRt;
  const label = labelRtData?.json
    ? documentToReactComponents(
        labelRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        cardsWrapperRichTextOptions,
      )
    : null;
  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        cardsWrapperRichTextOptions,
      )
    : null;
  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        cardsWrapperRichTextOptions,
      )
    : null;
  const items = liveData.itemsCollection?.items ?? [];
  const layoutStyle = (liveData as CardsWrapperFragment).style ?? 'card';
  const cols = (liveData as CardsWrapperFragment).columns ?? 2;
  const rawVariant = (liveData as CardsWrapperFragment).colorVariant ?? 'light';
  const dataVariant: 'light' | 'dark' | 'accent' =
    rawVariant === 'dark' ? 'dark' : rawVariant === 'accent' ? 'accent' : 'light';
  const sectionStyle = SECTION_BG[dataVariant] ?? SECTION_BG.light;
  const mutedClass = SECTION_MUTED[dataVariant] ?? SECTION_MUTED.light;
  const colClass = COL_CLASS[cols] ?? COL_CLASS[2];

  return (
    <section
      {...props}
      id="cards-wrapper"
      className={cn('px-6 lg:px-0', className ?? '')}
      style={sectionStyle}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-28">
        {label && (
          <p
            className="text-tagline mb-4 text-center text-sm sm:text-base"
            {...getProps({ fieldId: 'labelRt' })}
          >
            {label}
          </p>
        )}

        {title && (
          <h2
            className="mx-auto max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl md:text-5xl"
            {...getProps({ fieldId: 'titleRt' })}
          >
            {title}
          </h2>
        )}

        {description && (
          <p
            className={cn('mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg', mutedClass)}
            {...getProps({ fieldId: 'descriptionRt' })}
          >
            {description}
          </p>
        )}

        {items.length > 0 && (
          <div
            className={cn(
              'mt-12 grid gap-6 md:mt-14 md:gap-8 grid-cols-1',
              layoutStyle === 'borderless' ? colClass : (
                items.length === 1 ? 'mx-auto max-w-2xl' : colClass
              ),
            )}
          >
            {items.map((item) => (
              <CardItem
                key={item.sys.id}
                item={item}
                mutedClass={mutedClass}
                layoutStyle={layoutStyle}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { CardsWrapper };
