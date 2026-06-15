'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useMergeTagRenderOptions } from '@/lib/rich-text-merge-tags';

import type { BlockProps, CardFragment, DynamicListingFragment } from '@/block-renderer/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { contentfulCatalogAdapter } from '@/lib/integration-adapters/contentful-catalog';
import type { ProductRecord } from '@/lib/integration-adapters/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { useDiscountedCatalog } from '@/lib/use-discounted-catalog';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function RtField({
  rt,
}: {
  rt?: { json: Record<string, unknown> } | null;
}): React.ReactElement | null {
  if (!rt?.json) return null;
  return (
    <>
      {documentToReactComponents(
        rt.json as unknown as Parameters<typeof documentToReactComponents>[0],
      )}
    </>
  );
}

// ── Mini product card ─────────────────────────────────────────────────────────

function MiniProductCard({ product }: { product: ProductRecord }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Source badge — reads product.source; hidden when not set */}
        {product.source && (
          <span className="self-start inline-flex items-center gap-1 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {product.source}
          </span>
        )}

        <p className="text-sm font-semibold leading-snug">{product.name}</p>

        <div className="flex items-center gap-1.5">
          {product.salePrice ? (
            <>
              <span className="text-sm font-bold">
                ${product.salePrice.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              product.inStock ? 'bg-green-500' : 'bg-red-500',
            )}
          />
          <span
            className={cn(
              'text-xs',
              product.inStock
                ? 'text-green-700'
                : 'text-red-600',
            )}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-border">
      <div className="aspect-square w-full bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/4 rounded bg-muted" />
      </div>
    </div>
  );
}

// ── Callout card ──────────────────────────────────────────────────────────────

function resolveCardHref(card: CardFragment): string | null {
  const link = card.linkToEntry;
  if (!link) return null;
  const slug = link.slug;
  if (!slug) return null;
  switch (link.__typename) {
    case 'ProductDetailPage':
      return `/products/${slug}`;
    case 'DashboardPage':
      return `/dashboard/${slug}`;
    default:
      return `/page/${slug}`;
  }
}

function CalloutCard({ card }: { card: CardFragment }) {
  const liveCard = useLiveUpdates(card);
  const getCardProps = useContentfulInspectorModeProps(liveCard.sys.id);
  const renderOptions = useMergeTagRenderOptions();

  const rawUrl = (liveCard as CardFragment).media?.url ?? undefined;
  const imageUrl = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;

  const isPromptLogin = (liveCard as CardFragment).promptToLogIn === true;
  const href = resolveCardHref(liveCard as CardFragment);

  const inner = (
    <div className={cn(
      'border-primary/30 bg-primary/5 flex flex-col overflow-hidden rounded-lg border p-4 shadow-sm',
      (isPromptLogin || href) && 'cursor-pointer transition-shadow hover:shadow-md',
    )}>
      {imageUrl && (
        <div className="relative mb-3 h-32 w-full overflow-hidden rounded-md">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
            {...getCardProps({ fieldId: 'media' })}
          />
        </div>
      )}
      {(liveCard as CardFragment).titleRt?.json && (
        <div
          className="text-primary text-sm font-semibold"
          {...getCardProps({ fieldId: 'titleRt' })}
        >
          {documentToReactComponents(
            (liveCard as CardFragment).titleRt!.json as unknown as Parameters<typeof documentToReactComponents>[0],
            renderOptions,
          )}
        </div>
      )}
      {(liveCard as CardFragment).descriptionRt?.json && (
        <div
          className="text-muted-foreground mt-1 text-xs"
          {...getCardProps({ fieldId: 'descriptionRt' })}
        >
          {documentToReactComponents(
            (liveCard as CardFragment).descriptionRt!.json as unknown as Parameters<typeof documentToReactComponents>[0],
            renderOptions,
          )}
        </div>
      )}
    </div>
  );

  // promptToLogIn takes precedence
  if (isPromptLogin) {
    return (
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('open-login'))}
        className="text-left w-full"
      >
        {inner}
      </button>
    );
  }

  if (href) {
    return <Link href={href} className="block">{inner}</Link>;
  }

  return inner;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DynamicListing({
  data: rawData,
}: BlockProps<DynamicListingFragment>) {
  const data = useLiveUpdates(rawData);
  const getProps = useContentfulInspectorModeProps(rawData.sys.id);

  const [rawProducts, setProducts] = useState<ProductRecord[]>([]);
  const products = useDiscountedCatalog(rawProducts);
  const [isLoading, setIsLoading] = useState(false);

  // skus field stores either a ProductCollection {categories, items} (new) or string[] (legacy)
  const isCollection = data.skus && !Array.isArray(data.skus) && 'items' in data.skus;
  const collectionItems = isCollection
    ? ((data.skus as unknown) as { items: ProductRecord[] }).items
    : null;
  const skuList: string[] = Array.isArray(data.skus) ? data.skus : [];

  useEffect(() => {
    // ProductCollection: items are embedded — no API call needed
    if (isCollection && collectionItems) {
      setProducts(collectionItems);
      return;
    }
    // Legacy string[] SKUs: look up from catalog
    if (skuList.length === 0) {
      setProducts([]);
      return;
    }
    setIsLoading(true);
    contentfulCatalogAdapter.getProducts().then((all) => {
      const ordered = skuList
        .map((sku) =>
          all.find((p) => p.sku.toLowerCase() === sku.toLowerCase()),
        )
        .filter((p): p is ProductRecord => !!p);
      setProducts(ordered);
      setIsLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollection, collectionItems ? JSON.stringify(collectionItems.map(p => p.sku)) : skuList.join(',')]);

  const isScroll = data.displayVariant === 'scroll';
  const calloutCards = data.calloutCardsCollection?.items ?? [];

  // Build interleaved grid items (grid layout only; scroll appends callouts after products)
  const colCount =
    products.length <= 2 ? 2 : products.length === 3 ? 3 : 4;

  type GridItem =
    | { kind: 'product'; product: ProductRecord }
    | { kind: 'callout'; card: CardFragment };

  const gridItems: GridItem[] = [];
  let calloutIndex = 0;
  products.forEach((product, i) => {
    gridItems.push({ kind: 'product', product });
    if ((i + 1) % colCount === 0 && calloutIndex < calloutCards.length) {
      gridItems.push({ kind: 'callout', card: calloutCards[calloutIndex] });
      calloutIndex++;
    }
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {/* Title */}
      {data.titleRt?.json && (
        <div
          className="mb-8 text-2xl font-bold"
          {...getProps({ fieldId: 'titleRt' })}
        >
          <RtField rt={data.titleRt} />
        </div>
      )}

      {products.length === 0 && !isLoading && null}

      {/* Carousel layout */}
      {isScroll ? (
        <div className="relative px-12">
          <Carousel opts={{ align: 'start', loop: false }} className="w-full">
            <CarouselContent>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <CarouselItem key={i} className="basis-56">
                      <MiniProductSkeleton />
                    </CarouselItem>
                  ))
                : (() => {
                    const items: React.ReactNode[] = [];
                    let cIdx = 0;
                    products.forEach((p, i) => {
                      items.push(
                        <CarouselItem key={p.sku} className="basis-56">
                          <MiniProductCard product={p} />
                        </CarouselItem>,
                      );
                      if ((i + 1) % 3 === 0 && cIdx < calloutCards.length) {
                        items.push(
                          <CarouselItem key={`callout-${cIdx}`} className="basis-56">
                            <CalloutCard card={calloutCards[cIdx]} />
                          </CarouselItem>,
                        );
                        cIdx++;
                      }
                    });
                    return items;
                  })()}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      ) : (
        /* Grid layout (default) */
        <div
          className={cn(
            'grid gap-5',
            products.length <= 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : products.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
          )}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <MiniProductSkeleton key={i} />
              ))
            : gridItems.map((item, idx) =>
                item.kind === 'product' ? (
                  <MiniProductCard key={item.product.sku} product={item.product} />
                ) : (
                  <CalloutCard key={`callout-${idx}`} card={item.card} />
                ),
              )}
        </div>
      )}
    </section>
  );
}
