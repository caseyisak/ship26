'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import * as React from 'react';

import type { MediaCardFragment, MediaCardGridFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { sectionClasses, sectionMutedTextClass } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';

const rtOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => <>{children}</>,
  },
};

function rt(json: Record<string, unknown> | undefined | null): React.ReactNode | null {
  if (!json) return null;
  return documentToReactComponents(
    json as unknown as Parameters<typeof documentToReactComponents>[0],
    rtOptions,
  );
}

const COL_CLASS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * MediaCardItem — matches metafi-all-integrations card style exactly:
 * - bg-card, border, rounded-[16px], shadow
 * - 200px bg-accent image area with centered image
 * - imageFit: cover = object-cover, contain = object-contain (default)
 */
function MediaCardItem({ card }: { card: MediaCardFragment }) {
  const mediaUrl = card.media?.url?.startsWith('//')
    ? `https:${card.media.url}`
    : card.media?.url;

  const fit = card.imageFit ?? 'contain';

  return (
    <article className="bg-card border-border-light shadow-[var(--shadow-light)] h-full rounded-[16px] border p-4">
      {/* Image area — matches metafi-all-integrations h-[200px] bg-accent style */}
      <div className="bg-accent flex h-[200px] w-full items-center justify-center overflow-hidden rounded-[12px]">
        {mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Contentful URL
          <img
            src={mediaUrl}
            alt=""
            className={cn(
              'h-full w-full',
              fit === 'cover' ? 'object-cover' : 'h-20 w-20 object-contain',
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Text area */}
      {(card.title?.json || card.description?.json) && (
        <div className="mt-4">
          {card.title?.json && (
            <h3 className="text-2xl font-medium leading-tight">
              {rt(card.title.json)}
            </h3>
          )}
          {card.description?.json && (
            <p className="text-muted-foreground mt-2 text-[18px] leading-relaxed">
              {rt(card.description.json)}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

const MediaCardGrid = ({ data, className, ...props }: BlockProps<MediaCardGridFragment>) => {
  const liveData = useLiveUpdates(data) as MediaCardGridFragment;
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const label = rt(liveData.label?.json);
  const title = rt(liveData.title?.json);
  const description = rt(liveData.description?.json);
  const items = liveData.itemsCollection?.items ?? [];
  const cols = liveData.columns ?? 3;
  const colClass = COL_CLASS[cols] ?? COL_CLASS[3];

  const rawVariant = liveData.colorVariant ?? 'light';
  const dataVariant: 'light' | 'dark' | 'accent' =
    rawVariant === 'dark' ? 'dark' : rawVariant === 'accent' ? 'accent' : 'light';
  const mutedClass = sectionMutedTextClass(dataVariant);

  return (
    <section
      id="media-card-grid"
      data-variant={dataVariant}
      className={cn('px-6 lg:px-0', sectionClasses(dataVariant), className ?? '')}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-24">
        {/* Section header — matches metafi-all-integrations h2 style */}
        {title && (
          <h2
            className="text-center text-[40px] leading-tight font-medium tracking-tight md:text-[52px]"
            {...getProps({ fieldId: 'title' })}
          >
            {title}
          </h2>
        )}
        {label && !title && (
          <p
            className="text-tagline mb-4 text-center text-sm font-normal sm:text-base"
            {...getProps({ fieldId: 'label' })}
          >
            {label}
          </p>
        )}
        {label && title && (
          <p
            className="text-tagline mb-4 text-center text-sm font-normal sm:text-base"
            {...getProps({ fieldId: 'label' })}
          >
            {label}
          </p>
        )}
        {description && (
          <p
            className={cn('mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg', mutedClass)}
            {...getProps({ fieldId: 'description' })}
          >
            {description}
          </p>
        )}

        {/* Card grid */}
        {items.length > 0 && (
          <ul className={cn('mt-10 grid grid-cols-1 gap-6 md:mt-18', colClass)}>
            {items.map((card) => (
              <li key={card.sys.id} className="h-full">
                <MediaCardItem card={card} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export { MediaCardGrid };
