'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import * as React from 'react';

import type {
  FeatureItemFragment,
  FeaturesFragment,
} from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { getFeatureVisualComponent } from '@/lib/feature-visual-registry';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

const featuresRichTextOptions = {
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

function FeatureCard({
  item,
}: {
  item: FeatureItemFragment;
}) {
  // Apply live updates to RAW Contentful data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liveItem = useLiveUpdates(item) as any;
  const getItemProps = useContentfulInspectorModeProps(item.sys.id);

  // Extract fields — prefer RT fields
  const titleRtData = (liveItem as FeatureItemFragment).titleRt;
  const descriptionRtData = (liveItem as FeatureItemFragment).descriptionRt ?? (liveItem as FeatureItemFragment).descriptionRt;
  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        featuresRichTextOptions,
      )
    : null;
  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        featuresRichTextOptions,
      )
    : null;
  const animationKey = liveItem.animationKey ?? null;

  // Use raw Contentful field name 'media', not mapped 'image'
  const rawUrl = liveItem.media?.url ?? undefined;
  const imageUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;

  const VisualComponent = animationKey
    ? getFeatureVisualComponent(animationKey)
    : null;

  // Read mediaPlacement per-item (featureItem controls its own layout)
  const pos = (liveItem as FeatureItemFragment).mediaPlacement ?? 'top';
  const isSideBySide = pos === 'left' || pos === 'right';

  // For side-by-side layouts the image fills the card height; for stacked it uses fixed heights
  const visualInner = isSideBySide ? (
    <div className="bg-accent relative h-[200px] w-full md:h-full md:min-h-[180px]">
      {VisualComponent ? (
        <VisualComponent className="absolute inset-0" />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 40vw"
          priority={false}
          {...getItemProps({ fieldId: 'media' })}
        />
      ) : null}
    </div>
  ) : (
    <div className="bg-accent relative h-[220px] w-full sm:h-[260px] md:h-[300px]">
      {VisualComponent ? (
        <VisualComponent className="absolute inset-0" />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
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
          isSideBySide ? 'w-full md:w-2/5' : 'w-full',
        )}
      >
        {visualInner}
      </div>
    ) : null;

  const textBlock = (
    <div
      className={cn(
        'flex flex-col justify-center',
        pos === 'left' && 'md:w-3/5 md:pl-6',
        pos === 'right' && 'md:w-3/5 md:pr-6',
      )}
    >
      {title && (
        <h3
          className="text-foreground text-lg font-medium sm:text-xl"
          {...getItemProps({ fieldId: 'titleRt' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className="text-muted-foreground mt-2 text-sm sm:text-base"
          {...getItemProps({ fieldId: 'descriptionRt' })}
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
          'bg-card border-border-light relative flex rounded-[16px] border p-6 text-left shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]',
          'flex-col md:items-stretch',
          pos === 'left' ? 'md:flex-row' : 'md:flex-row-reverse',
        )}
      >
        {visual}
        {textBlock}
      </div>
    );
  }

  return (
    <div className="bg-card border-border-light relative flex flex-col rounded-[16px] border p-6 text-left shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]">
      {pos === 'top' && visual && <div className="mb-4">{visual}</div>}

      {title && (
        <h3
          className="text-foreground text-lg font-medium sm:text-xl"
          {...getItemProps({ fieldId: 'titleRt' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className="text-muted-foreground mt-2 text-sm sm:text-base"
          {...getItemProps({ fieldId: 'descriptionRt' })}
        >
          {description}
        </p>
      )}

      {pos === 'bottom' && visual && <div className="mt-4">{visual}</div>}
    </div>
  );
}

const Features = ({
  data,
  className,
  ...props
}: BlockProps<FeaturesFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const labelRtData = (liveData as FeaturesFragment).labelRt;
  const titleRtData = (liveData as FeaturesFragment).titleRt;
  const descriptionRtData = (liveData as FeaturesFragment).descriptionRt;
  const label = labelRtData?.json
    ? documentToReactComponents(
        labelRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        featuresRichTextOptions,
      )
    : null;
  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        featuresRichTextOptions,
      )
    : null;
  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        featuresRichTextOptions,
      )
    : null;
  const items = liveData.itemsCollection?.items ?? [];

  return (
    <section
      id="features"
      className={cn('bg-background px-6 lg:px-0', className ?? '')}
      {...props}
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
            className="text-foreground mx-auto max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl md:text-5xl"
            {...getProps({ fieldId: 'titleRt' })}
          >
            {title}
          </h2>
        )}

        {description && (
          <p
            className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg"
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
                : 'grid-cols-1 lg:grid-cols-2',
            )}
          >
            {items.map((item) => (
              <FeatureCard
                key={item.sys.id}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { Features };
