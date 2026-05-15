'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import * as React from 'react';

import type { FeatureShowcaseFragment, FeatureShowcaseItemFragment } from '@/block-renderer/types';
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

function ShowcaseItem({ item, index, mutedClass }: { item: FeatureShowcaseItemFragment; index: number; mutedClass: string }) {
  const mediaUrl = item.media?.url?.startsWith('//')
    ? `https:${item.media.url}`
    : item.media?.url;

  // Alternate text-left / text-right each item
  const textRight = index % 2 !== 0;

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12 items-center',
        textRight && 'md:[direction:rtl]',
      )}
    >
      {/* Text panel — 1/3 */}
      <div className={cn('flex flex-col gap-4', textRight && 'md:[direction:ltr]')}>
        {item.title?.json && (
          <h3 className="text-2xl font-semibold leading-tight sm:text-3xl">
            {rt(item.title.json)}
          </h3>
        )}
        {item.description?.json && (
          <p className={cn('text-base leading-relaxed', mutedClass)}>
            {rt(item.description.json)}
          </p>
        )}
      </div>

      {/* Image panel — 2/3 */}
      <div className={cn('md:col-span-2 overflow-hidden rounded-[16px]', textRight && 'md:[direction:ltr]')}>
        {mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Contentful URL
          <img
            src={mediaUrl}
            alt=""
            className="h-auto w-full object-cover"
          />
        ) : (
          <div className="bg-muted flex h-48 items-center justify-center rounded-[16px] md:h-64">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>
    </div>
  );
}

const FeatureShowcase = ({ data, className, ...props }: BlockProps<FeatureShowcaseFragment>) => {
  const liveData = useLiveUpdates(data) as FeatureShowcaseFragment;
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const label = rt(liveData.label?.json);
  const title = rt(liveData.title?.json);
  const description = rt(liveData.description?.json);
  const items = liveData.itemsCollection?.items ?? [];

  const rawVariant = liveData.colorVariant ?? 'light';
  const dataVariant: 'light' | 'dark' | 'accent' =
    rawVariant === 'dark' ? 'dark' : rawVariant === 'accent' ? 'accent' : 'light';
  const mutedClass = sectionMutedTextClass(dataVariant);

  return (
    <section
      id="feature-showcase"
      data-variant={dataVariant}
      className={cn('px-6 lg:px-0', sectionClasses(dataVariant), className ?? '')}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 lg:py-28">
        {(label || title || description) && (
          <div className="mx-auto mb-14 max-w-3xl text-center">
            {label && (
              <p
                className="text-tagline mb-4 text-sm font-normal sm:text-base"
                {...getProps({ fieldId: 'label' })}
              >
                {label}
              </p>
            )}
            {title && (
              <h2
                className="text-3xl leading-tight font-medium tracking-tight sm:text-4xl md:text-5xl"
                {...getProps({ fieldId: 'title' })}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn('mt-4 text-base sm:text-lg', mutedClass)}
                {...getProps({ fieldId: 'description' })}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-16 md:gap-24">
            {items.map((item, idx) => (
              <ShowcaseItem key={item.sys.id} item={item} index={idx} mutedClass={mutedClass} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { FeatureShowcase };
