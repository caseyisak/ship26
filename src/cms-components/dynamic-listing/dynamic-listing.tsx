'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import React, { useEffect, useState } from 'react';

import type { BlockProps, DynamicListingFragment } from '@/block-renderer/types';
import { contentfulCatalogAdapter } from '@/lib/integration-adapters/contentful-catalog';
import type { ProductRecord } from '@/lib/integration-adapters/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

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
        {/* Shopify source badge */}
        <span
          className="self-start inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ background: '#96BF48' }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
            <path d="M19.5 8.25h-1.732A5.768 5.768 0 0 0 12 3a5.768 5.768 0 0 0-5.768 5.25H4.5A1.5 1.5 0 0 0 3 9.75v9A1.5 1.5 0 0 0 4.5 20.25h15a1.5 1.5 0 0 0 1.5-1.5v-9a1.5 1.5 0 0 0-1.5-1.5zM12 4.5a4.27 4.27 0 0 1 4.232 3.75H7.768A4.27 4.27 0 0 1 12 4.5z" />
          </svg>
          Shopify
        </span>

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

// ── Component ─────────────────────────────────────────────────────────────────

export function DynamicListing({
  data: rawData,
}: BlockProps<DynamicListingFragment>) {
  const data = useLiveUpdates(rawData);
  const getProps = useContentfulInspectorModeProps(rawData.sys.id);

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const skus: string[] = Array.isArray(data.skus) ? data.skus : [];

  useEffect(() => {
    if (skus.length === 0) {
      setProducts([]);
      return;
    }
    setIsLoading(true);
    contentfulCatalogAdapter.getProducts().then((all) => {
      const skuSet = new Set(skus.map((s) => s.toLowerCase()));
      const ordered = skus
        .map((sku) =>
          all.find((p) => p.sku.toLowerCase() === sku.toLowerCase()),
        )
        .filter((p): p is ProductRecord => !!p);
      setProducts(ordered);
      setIsLoading(false);
    });
  }, [skus.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const isScroll = data.displayVariant === 'scroll';

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

      {skus.length === 0 && !isLoading && (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-12 text-center text-muted-foreground">
          No products selected. Use the Integration Simulator app to pick SKUs.
        </div>
      )}

      {/* Scroll layout */}
      {isScroll ? (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-56 flex-shrink-0">
                  <MiniProductSkeleton />
                </div>
              ))
            : products.map((p) => (
                <div key={p.sku} className="w-56 flex-shrink-0 snap-start">
                  <MiniProductCard product={p} />
                </div>
              ))}
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
            : products.map((p) => (
                <MiniProductCard key={p.sku} product={p} />
              ))}
        </div>
      )}
    </section>
  );
}
