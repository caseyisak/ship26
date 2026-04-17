'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import * as React from 'react';

import type { TabbedContentFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

const tabbedRichTextOptions = {
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

function useLockedAspectHeight(aspect = 3 / 2) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState<number>(0);

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setHeight(Math.round(w / aspect));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);

  return { ref, height };
}

const TabbedContent = ({
  data,
  className,
  ...props
}: BlockProps<TabbedContentFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const taglineRtData = (liveData as TabbedContentFragment).taglineRt;
  const titleRtData = (liveData as TabbedContentFragment).titleRt;
  const descriptionRtData = (liveData as TabbedContentFragment).descriptionRt;
  const tagline = taglineRtData?.json
    ? documentToReactComponents(
        taglineRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        tabbedRichTextOptions,
      )
    : 'For Developers';
  const title = titleRtData?.json
    ? documentToReactComponents(
        titleRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        tabbedRichTextOptions,
      )
    : 'Building Blocks for Recurring Billing';
  const description = descriptionRtData?.json
    ? documentToReactComponents(
        descriptionRtData.json as unknown as Parameters<typeof documentToReactComponents>[0],
        tabbedRichTextOptions,
      )
    : 'Lay the foundation for recurring billing with comprehensive building blocks tailored to your needs.';

  const items = liveData.itemsCollection?.items ?? [];
  const [active, setActive] = React.useState<string | null>(
    items[0]?.sys.id ?? null,
  );
  const current = items.find((i) => i.sys.id === active) ?? items[0];
  const { ref: imgLockRef, height: imgH } = useLockedAspectHeight(3 / 2);

  // Handle image URL (may need https: prefix)
  const imageUrl = current?.image?.url
    ? current.image.url.startsWith('//')
      ? `https:${current.image.url}`
      : current.image.url
    : null;

  return (
    <section
      id="tabbed-content"
      className={cn('bg-background px-6 lg:px-0', className ?? '')}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-24">
        <div className="max-w-3xl">
          <p
            className="text-tagline text-sm sm:text-base"
            {...getProps({ fieldId: 'taglineRt' })}
          >
            {tagline}
          </p>
          <h2
            className="text-foreground mt-4 text-3xl leading-tight font-medium tracking-tight sm:text-5xl lg:text-[52px]"
            {...getProps({ fieldId: 'titleRt' })}
          >
            {title}
          </h2>
          <p
            className="text-muted-foreground mt-4 text-base sm:text-lg"
            {...getProps({ fieldId: 'descriptionRt' })}
          >
            {description}
          </p>
        </div>

        {items.length > 0 && (
          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:gap-16">
            <div className="w-full">
              <div
                ref={imgLockRef}
                className="relative w-full overflow-hidden"
                style={{ height: imgH || undefined }}
              >
                <AnimatePresence mode="sync" initial={false}>
                  {current && (
                    <motion.div
                      key={current.sys.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{
                        duration: 0.32,
                        ease: [0.22, 0.61, 0.36, 1],
                      }}
                      className="absolute inset-0 will-change-transform"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={
                            current.imageAlt ??
                            current.label ??
                            'Tab content preview'
                          }
                          fill
                          sizes="100vw"
                          className="pointer-events-none object-contain object-left select-none"
                          priority={false}
                        />
                      ) : (
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                          <span className="text-muted-foreground text-sm">
                            No image
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <div
                role="tablist"
                aria-orientation="vertical"
                className="hidden lg:flex lg:flex-col"
              >
                {items.map((it) => {
                  const isActive = active === it.sys.id;
                  return (
                    <button
                      key={it.sys.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(it.sys.id)}
                      className={cn(
                        'w-full border-b py-5 text-left transition-colors',
                        isActive
                          ? 'border-tagline/70'
                          : 'border-border-light hover:text-foreground/80',
                      )}
                      {...getProps({
                        fieldId: 'itemsCollection',
                        entryId: it.sys.id,
                      })}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'text-base font-medium',
                            isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground',
                          )}
                        >
                          {it.label ?? 'Untitled'}
                        </span>
                      </div>

                      {isActive && (
                        <motion.div
                          key={`${it.sys.id}-body`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.22, 0.61, 0.36, 1],
                          }}
                          className="mt-3"
                        >
                          <p className="text-muted-foreground text-sm sm:text-base">
                            {it.body ?? ''}
                          </p>
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="lg:hidden">
                {items.map((it) => {
                  const open = active === it.sys.id;
                  return (
                    <div
                      key={it.sys.id}
                      className={cn(
                        'border-b transition-colors',
                        open ? 'border-tagline/70' : 'border-border-light',
                      )}
                    >
                      <button
                        onClick={() => setActive(it.sys.id)}
                        className={cn(
                          'flex w-full items-center justify-between py-4 text-left',
                          open ? 'text-foreground' : 'text-muted-foreground',
                        )}
                        {...getProps({
                          fieldId: 'itemsCollection',
                          entryId: it.sys.id,
                        })}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base font-medium">
                            {it.label ?? 'Untitled'}
                          </span>
                        </div>
                      </button>

                      {open && (
                        <motion.div
                          key={`${it.sys.id}-mobile`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.22, 0.61, 0.36, 1],
                          }}
                          className="pb-5"
                        >
                          <p className="text-muted-foreground text-sm sm:text-base">
                            {it.body ?? ''}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export { TabbedContent };
