'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import type {
  FeatureSectionFragment,
  FeatureSectionItemFragment,
} from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { getFeatureVisualComponent } from '@/lib/feature-visual-registry';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { featureCardBgClass } from '@/lib/theme-colors';
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

/** Resolve columns to Tailwind grid class */
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

// ─── Item sub-components ─────────────────────────────────────────────────────

function IconTextItem({ item }: { item: FeatureSectionItemFragment }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liveItem = useLiveUpdates(item) as any;
  const getItemProps = useContentfulInspectorModeProps(item.sys.id);

  const title = renderRt(
    (liveItem as FeatureSectionItemFragment).title,
  );
  const description = renderRt(
    (liveItem as FeatureSectionItemFragment).description,
  );
  const animationKey = liveItem.animationKey ?? null;
  const rawUrl = liveItem.icon?.url ?? undefined;
  const iconUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;

  const VisualComponent = animationKey
    ? getFeatureVisualComponent(animationKey)
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Icon / animation */}
      {(VisualComponent || iconUrl) && (
        <div className="flex h-12 w-12 items-center justify-center">
          {VisualComponent ? (
            <VisualComponent className="h-full w-full" />
          ) : iconUrl ? (
            <Image
              src={iconUrl}
              alt=""
              width={48}
              height={48}
              className="object-contain"
              {...getItemProps({ fieldId: 'icon' })}
            />
          ) : null}
        </div>
      )}

      {title && (
        <h3
          className="text-foreground text-base font-semibold sm:text-lg"
          {...getItemProps({ fieldId: 'title' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className="text-muted-foreground text-sm sm:text-base"
          {...getItemProps({ fieldId: 'description' })}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function CardItem({ item }: { item: FeatureSectionItemFragment }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liveItem = useLiveUpdates(item) as any;
  const getItemProps = useContentfulInspectorModeProps(item.sys.id);

  const title = renderRt(
    (liveItem as FeatureSectionItemFragment).title,
  );
  const description = renderRt(
    (liveItem as FeatureSectionItemFragment).description,
  );
  const colorVariant = liveItem.colorVariant ?? null;
  const rawUrl = liveItem.icon?.url ?? undefined;
  const iconUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;
  const animationKey = liveItem.animationKey ?? null;
  const VisualComponent = animationKey
    ? getFeatureVisualComponent(animationKey)
    : null;

  const colorClasses = featureCardBgClass(colorVariant);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border p-6 shadow-sm',
        colorClasses,
      )}
    >
      {(VisualComponent || iconUrl) && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 p-2">
          {VisualComponent ? (
            <VisualComponent className="h-full w-full" />
          ) : iconUrl ? (
            <Image
              src={iconUrl}
              alt=""
              width={40}
              height={40}
              className="object-contain"
              {...getItemProps({ fieldId: 'icon' })}
            />
          ) : null}
        </div>
      )}

      {title && (
        <h3
          className="text-base font-semibold sm:text-lg"
          {...getItemProps({ fieldId: 'title' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className="text-sm opacity-80 sm:text-base"
          {...getItemProps({ fieldId: 'description' })}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function IntegrationsItem({ item }: { item: FeatureSectionItemFragment }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liveItem = useLiveUpdates(item) as any;
  const getItemProps = useContentfulInspectorModeProps(item.sys.id);

  const title = renderRt(
    (liveItem as FeatureSectionItemFragment).title,
  );
  const description = renderRt(
    (liveItem as FeatureSectionItemFragment).description,
  );
  const colorVariant = liveItem.colorVariant ?? null;
  const href = liveItem.href ?? null;
  const rawUrl = liveItem.icon?.url ?? undefined;
  const iconUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;
  const animationKey = liveItem.animationKey ?? null;
  const VisualComponent = animationKey
    ? getFeatureVisualComponent(animationKey)
    : null;

  const colorClasses = featureCardBgClass(colorVariant);

  const inner = (
    <div
      className={cn(
        'group flex flex-col items-center gap-3 rounded-2xl border p-6 text-center shadow-sm transition-shadow hover:shadow-md',
        colorClasses,
        href && 'cursor-pointer',
      )}
    >
      {(VisualComponent || iconUrl) && (
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/40 p-2">
          {VisualComponent ? (
            <VisualComponent className="h-full w-full" />
          ) : iconUrl ? (
            <Image
              src={iconUrl}
              alt=""
              width={48}
              height={48}
              className="object-contain"
              {...getItemProps({ fieldId: 'icon' })}
            />
          ) : null}
        </div>
      )}

      {title && (
        <h3
          className="text-sm font-semibold sm:text-base"
          {...getItemProps({ fieldId: 'title' })}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className="text-xs opacity-80 sm:text-sm"
          {...getItemProps({ fieldId: 'description' })}
        >
          {description}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} {...getItemProps({ fieldId: 'href' })}>
        {inner}
      </Link>
    );
  }
  return inner;
}

// ─── Main component ───────────────────────────────────────────────────────────

const FeatureSection = ({
  data,
  className,
  ...props
}: BlockProps<FeatureSectionFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const fs = liveData as FeatureSectionFragment;

  const label = renderRt(fs.label);
  const title = renderRt(fs.title);
  const description = renderRt(fs.description);
  const items = fs.itemsCollection?.items ?? [];
  const displayVariant = fs.displayVariant ?? 'icon-text';
  const columns = fs.columns ?? 3;

  return (
    <section
      id="feature-section"
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
              'mt-12 grid grid-cols-1 gap-6 md:mt-14 md:gap-8',
              gridColsClass(columns),
            )}
          >
            {items.map((item) => {
              if (!item) return null;
              if (displayVariant === 'cards') {
                return <CardItem key={item.sys.id} item={item} />;
              }
              if (displayVariant === 'integrations') {
                return <IntegrationsItem key={item.sys.id} item={item} />;
              }
              // default: icon-text
              return <IconTextItem key={item.sys.id} item={item} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export { FeatureSection };
