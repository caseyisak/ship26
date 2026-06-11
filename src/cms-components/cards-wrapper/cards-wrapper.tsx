'use client';
// v2
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import * as React from 'react';

import type { CardsWrapperFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { CardRenderer } from '@/cms-components/card-renderer/card-renderer';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { useMergeTagRenderOptions } from '@/lib/rich-text-merge-tags';
import { sectionBgClass, sectionMutedTextClass, sectionTextClass } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';

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

// ── Component ─────────────────────────────────────────────────────────────────

const CardsWrapper = ({
  data,
  className,
  ...props
}: BlockProps<CardsWrapperFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);
  const rtOptions = useMergeTagRenderOptions(cardsWrapperRichTextOptions);

  const labelRtData = (liveData as CardsWrapperFragment).labelRt;
  const titleRtData = (liveData as CardsWrapperFragment).titleRt;
  const descriptionRtData = (liveData as CardsWrapperFragment).descriptionRt;
  const backgroundColor = (liveData as CardsWrapperFragment).backgroundColor;
  const columns = (liveData as CardsWrapperFragment).columns ?? 2;

  const label = labelRtData?.json
    ? documentToReactComponents(
        labelRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;
  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;
  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        rtOptions,
      )
    : null;
  const items = liveData.itemsCollection?.items ?? [];

  return (
    <section
      {...props}
      id="cards-wrapper"
      className={cn('px-6 lg:px-0', sectionBgClass(backgroundColor), sectionTextClass(backgroundColor), className ?? '')}
      {...getProps({ fieldId: 'backgroundColor' })}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-28">
        {label && (
          <p
            className={cn('mb-4 text-center text-sm sm:text-base', sectionMutedTextClass(backgroundColor))}
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
            className={cn('mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg', sectionMutedTextClass(backgroundColor))}
            {...getProps({ fieldId: 'descriptionRt' })}
          >
            {description}
          </p>
        )}

        {items.length > 0 && (
          <div
            className={cn(
              'mt-12 grid gap-6 md:mt-14 md:gap-8',
              items.length === 1
                ? 'mx-auto max-w-2xl grid-cols-1'
                : columns === 4
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : columns === 3
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 lg:grid-cols-2',
            )}
          >
            {items.map((item) => (
              <CardRenderer key={item.sys.id} card={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { CardsWrapper };
