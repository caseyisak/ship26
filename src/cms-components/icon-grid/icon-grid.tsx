'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import * as React from 'react';

import type { IconGridFragment, IconGridItemFragment } from '@/block-renderer/types';
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
 * Card variant — matches the integrations page card style:
 * bordered card, image area at top (bg-card), title + description below.
 */
function CardItem({ item, mutedClass }: { item: IconGridItemFragment; mutedClass: string }) {
  const iconUrl = item.icon?.url?.startsWith('//')
    ? `https:${item.icon.url}`
    : item.icon?.url;

  return (
    <div className="bg-card border-border-light shadow-[var(--shadow-light)] h-full rounded-[16px] border overflow-hidden">
      {/* Icon area — matches integrations image area style */}
      <div className="bg-accent flex h-[160px] w-full items-center justify-center rounded-t-[12px]">
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Contentful URL
          <img src={iconUrl} alt="" className="h-16 w-16 object-contain" />
        ) : (
          <div className="size-16 rounded-[12px] bg-muted" />
        )}
      </div>
      <div className="p-5">
        {item.title?.json && (
          <h3 className="text-lg font-medium leading-tight">
            {rt(item.title.json)}
          </h3>
        )}
        {item.description?.json && (
          <p className={cn('mt-2 text-base leading-relaxed', mutedClass)}>
            {rt(item.description.json)}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Borderless variant — matches metafi-features-included:
 * icon in a 44×44 shadowed rounded box, centered, title + description below.
 */
function BorderlessItem({ item, mutedClass }: { item: IconGridItemFragment; mutedClass: string }) {
  const iconUrl = item.icon?.url?.startsWith('//')
    ? `https:${item.icon.url}`
    : item.icon?.url;

  return (
    <li className="text-center">
      {/* Icon box — matches metafi-features-included exactly */}
      <div
        className="border-border-light bg-card shadow-[var(--shadow-light)] mx-auto mb-4 flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border"
        aria-hidden
      >
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Contentful URL
          <img src={iconUrl} alt="" className="h-6 w-6 object-contain" />
        ) : (
          <div className="size-6 rounded bg-muted" />
        )}
      </div>
      {item.title?.json && (
        <h3 className="mt-6 text-lg font-medium">
          {rt(item.title.json)}
        </h3>
      )}
      {item.description?.json && (
        <p className={cn('mx-auto mt-2 max-w-[44ch] text-base', mutedClass)}>
          {rt(item.description.json)}
        </p>
      )}
    </li>
  );
}

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

const IconGrid = ({ data, className, ...props }: BlockProps<IconGridFragment>) => {
  const liveData = useLiveUpdates(data) as IconGridFragment;
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const label = rt(liveData.label?.json);
  const title = rt(liveData.title?.json);
  const description = rt(liveData.description?.json);
  const items = liveData.itemsCollection?.items ?? [];
  const style = liveData.style ?? 'card';
  const cols = liveData.columns ?? 3;
  const colClass = COL_CLASS[cols] ?? COL_CLASS[3];

  const rawVariant = liveData.colorVariant ?? 'light';
  const dataVariant: 'light' | 'dark' | 'accent' =
    rawVariant === 'dark' ? 'dark' : rawVariant === 'accent' ? 'accent' : 'light';
  const sectionStyle = SECTION_BG[dataVariant] ?? SECTION_BG.light;
  const mutedClass = SECTION_MUTED[dataVariant] ?? SECTION_MUTED.light;

  return (
    <section
      id="icon-grid"
      data-variant={dataVariant}
      className={cn('px-6 lg:px-0', className ?? '')}
      style={sectionStyle}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-24">
        {/* Section header */}
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
              className="mt-4 text-3xl leading-tight font-medium tracking-tight sm:text-5xl"
              {...getProps({ fieldId: 'title' })}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className={cn('mx-auto mt-4 max-w-2xl text-sm sm:text-base', mutedClass)}
              {...getProps({ fieldId: 'description' })}
            >
              {description}
            </p>
          )}
        </div>

        {/* Item grid */}
        {items.length > 0 && (
          style === 'borderless' ? (
            <ul className={cn('mt-12 grid grid-cols-1 gap-10 md:mt-18 md:gap-x-12 md:gap-y-18', colClass)}>
              {items.map((item) => (
                <BorderlessItem key={item.sys.id} item={item} mutedClass={mutedClass} />
              ))}
            </ul>
          ) : (
            <div className={cn('mt-10 grid grid-cols-1 gap-6 sm:mt-14', colClass)}>
              {items.map((item) => (
                <CardItem key={item.sys.id} item={item} mutedClass={mutedClass} />
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
};

export { IconGrid };
