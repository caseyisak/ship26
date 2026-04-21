'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import * as React from 'react';

import type {
  IconFeatureGridFragment,
  IconFeatureItemFragment,
} from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

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

function renderRt(
  field: { json: Record<string, unknown> } | null | undefined,
): React.ReactNode | null {
  if (!field?.json) return null;
  return documentToReactComponents(
    field.json as unknown as Parameters<typeof documentToReactComponents>[0],
    rtOptions,
  );
}

function gridColsClass(columns: number | null | undefined): string {
  switch (columns) {
    case 2:
      return 'sm:grid-cols-2';
    case 4:
      return 'sm:grid-cols-2 lg:grid-cols-4';
    case 3:
    default:
      return 'sm:grid-cols-2 lg:grid-cols-3';
  }
}

function IconFeatureItem({ item }: { item: IconFeatureItemFragment }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liveItem = useLiveUpdates(item) as any;
  const getItemProps = useContentfulInspectorModeProps(item.sys.id);

  const title = renderRt((liveItem as IconFeatureItemFragment).title);
  const description = renderRt((liveItem as IconFeatureItemFragment).description);
  const rawUrl = liveItem.icon?.url ?? undefined;
  const iconUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;

  return (
    <li className="text-center">
      {iconUrl && (
        <div
          className="border-border-light bg-card shadow-light mx-auto mb-4 flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border"
          aria-hidden
          {...getItemProps({ fieldId: 'icon' })}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Contentful asset URL */}
          <img
            src={iconUrl}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </div>
      )}

      {title && (
        <h3
          className="text-foreground mt-6 text-lg font-medium"
          {...getItemProps({ fieldId: 'title' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className="text-muted-foreground mx-auto mt-2 max-w-[44ch] text-base"
          {...getItemProps({ fieldId: 'description' })}
        >
          {description}
        </p>
      )}
    </li>
  );
}

const IconFeatureGrid = ({
  data,
  className,
  ...props
}: BlockProps<IconFeatureGridFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const fg = liveData as IconFeatureGridFragment;

  const label = renderRt(fg.label);
  const title = renderRt(fg.title);
  const description = renderRt(fg.description);
  const items = fg.itemsCollection?.items ?? [];
  const columns = fg.columns ?? 3;

  return (
    <section
      id="icon-feature-grid"
      className={cn('bg-background px-6 lg:px-0', className ?? '')}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:py-24">
        <div className="text-center">
          {label && (
            <p
              className="text-tagline text-sm sm:text-base"
              {...getProps({ fieldId: 'label' })}
            >
              {label}
            </p>
          )}

          {title && (
            <h2
              className="text-foreground mt-4 text-3xl leading-tight font-medium tracking-tight sm:text-5xl"
              {...getProps({ fieldId: 'title' })}
            >
              {title}
            </h2>
          )}

          {description && (
            <p
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-sm sm:text-base"
              {...getProps({ fieldId: 'description' })}
            >
              {description}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <ul
            className={cn(
              'mt-12 grid grid-cols-1 gap-10 md:mt-18 md:gap-x-12 md:gap-y-18',
              gridColsClass(columns),
            )}
          >
            {items.map((item) => {
              if (!item) return null;
              return <IconFeatureItem key={item.sys.id} item={item} />;
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export { IconFeatureGrid };
