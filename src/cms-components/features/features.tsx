'use client';

import Image from 'next/image';

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

function FeatureCard({ item }: { item: FeatureItemFragment }) {
  // Apply live updates to RAW Contentful data
  const liveItem = useLiveUpdates(item) as any;
  const getItemProps = useContentfulInspectorModeProps(item.sys.id);

  // Extract fields from raw Contentful data (using 'media' not 'image')
  const title = liveItem.title ?? '';
  const description = liveItem.description ?? null;
  const animationKey = liveItem.animationKey ?? null;

  // Use raw Contentful field name 'media', not mapped 'image'
  const rawUrl = liveItem.media?.url ?? undefined;
  const imageUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;

  const VisualComponent = animationKey
    ? getFeatureVisualComponent(animationKey)
    : null;

  return (
    <div className="bg-card border-border-light relative flex flex-col rounded-[16px] border p-6 text-left shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]">
      {title && (
        <h3
          className="text-foreground text-lg font-medium sm:text-xl"
          {...getItemProps({ fieldId: 'title' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className="text-muted-foreground mt-2 text-sm sm:text-base"
          {...getItemProps({ fieldId: 'description' })}
        >
          {description}
        </p>
      )}

      {(VisualComponent || imageUrl) && (
        <div className="relative mt-6 w-full overflow-hidden rounded-[12px]">
          <div className="bg-accent relative h-[220px] w-full sm:h-[260px] md:h-[300px]">
            {VisualComponent ? (
              <VisualComponent className="absolute inset-0" />
            ) : (
              <Image
                src={imageUrl!}
                alt={title || 'Feature'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={false}
                {...getItemProps({ fieldId: 'media' })}
              />
            )}
          </div>
        </div>
      )}
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

  const label = liveData.label ?? null;
  const title = liveData.title ?? null;
  const description = liveData.description ?? null;
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
            {...getProps({ fieldId: 'label' })}
          >
            {label}
          </p>
        )}

        {title && (
          <h2
            className="text-foreground mx-auto max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl md:text-5xl"
            {...getProps({ fieldId: 'title' })}
          >
            {title}
          </h2>
        )}

        {description && (
          <p
            className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg"
            {...getProps({ fieldId: 'description' })}
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
              <FeatureCard key={item.sys.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { Features };
