'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import React, { useState } from 'react';

import type { ProductListingFragment } from '@/block-renderer/types';
import { CardRenderer } from '@/cms-components/card-renderer/card-renderer';
import { contentfulCatalogAdapter } from '@/lib/integration-adapters/contentful-catalog';
import type { ProductRecord } from '@/lib/integration-adapters/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ── Rich-text renderer options ────────────────────────────────────────────────

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
        rtOptions,
      )}
    </>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: ProductRecord }) {
  return (
    <div className="group border-border bg-card relative flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="bg-muted aspect-square w-full overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center text-sm">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.category && (
          <span className="bg-muted text-muted-foreground inline-flex self-start rounded-full px-2 py-0.5 text-[10px] font-medium">
            {product.category}
          </span>
        )}

        <p className="text-sm leading-snug font-semibold">{product.name}</p>

        <div className="flex items-center gap-1.5">
          {product.salePrice ? (
            <>
              <span className="text-sm font-bold">
                ${product.salePrice.toFixed(2)}
              </span>
              <span className="text-muted-foreground text-xs line-through">
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
              product.inStock ? 'text-green-700' : 'text-red-600',
            )}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Price bucket helpers ───────────────────────────────────────────────────────

type PriceBucket = 'all' | 'under-50' | '50-100' | '100-200' | 'over-200';

function matchesPriceBucket(
  product: ProductRecord,
  bucket: PriceBucket,
): boolean {
  const price = product.salePrice ?? product.price;
  if (bucket === 'all') return true;
  if (bucket === 'under-50') return price < 50;
  if (bucket === '50-100') return price >= 50 && price <= 100;
  if (bucket === '100-200') return price > 100 && price <= 200;
  if (bucket === 'over-200') return price > 200;
  return true;
}

const PRICE_BUCKETS: { value: PriceBucket; label: string }[] = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50–$100' },
  { value: '100-200', label: '$100–$200' },
  { value: 'over-200', label: '$200+' },
];

// ── Tailwind-safe column map ───────────────────────────────────────────────────

const COLS_CLASS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

// ── Main component ────────────────────────────────────────────────────────────

export function ProductListing({
  data,
  productCatalog: productCatalogProp,
}: {
  data: ProductListingFragment;
  productCatalog?: ProductRecord[];
}) {
  const [fetchedCatalog, setFetchedCatalog] = useState<ProductRecord[] | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);

  // Self-fetch: productCatalog comes from getSettings() which is server-only.
  // PageContentLive is 'use client' and cannot call getSettings(), so it never
  // passes productCatalog down. The preview route passes it server-side.
  // DO NOT remove this fetch — without it, the grid is empty on all page routes.
  // Pattern mirrors DynamicListing. See LL-027 for full explanation.
  React.useEffect(() => {
    if (productCatalogProp !== undefined) return;
    let cancelled = false;
    setLoading(true);
    contentfulCatalogAdapter.getProducts().then((all) => {
      if (!cancelled) {
        setFetchedCatalog(all);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only; see comment above

  const productCatalog = productCatalogProp ?? fetchedCatalog ?? [];

  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(liveData.sys.id);

  const columns = liveData.columns ?? 3;
  const colsClass = COLS_CLASS[columns] ?? 'grid-cols-3';

  // Sidebar filter state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    liveData.collection ?? 'all',
  );
  const [priceBucket, setPriceBucket] = useState<PriceBucket>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Derived filter options
  const allCategories = Array.from(
    new Set(productCatalog.map((p) => p.category).filter(Boolean)),
  );
  const allTags = Array.from(
    new Set(productCatalog.flatMap((p) => p.tags ?? [])),
  );

  // Filtered products
  const filtered = productCatalog.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory)
      return false;
    if (!matchesPriceBucket(p, priceBucket)) return false;
    if (inStockOnly && !p.inStock) return false;
    if (
      selectedTags.length > 0 &&
      !selectedTags.every((t) => p.tags?.includes(t))
    )
      return false;
    return true;
  });

  // Callout cards
  const calloutCards = (liveData.calloutCardsCollection?.items ?? []).filter(Boolean);

  // Segment-based layout: each callout card claims 2 rows of products beside it.
  // Callout 0 → LEFT, callout 1 → RIGHT, alternating.
  const productsPerSection = columns * 2;
  const calloutSections = calloutCards.map((card, i) => ({
    card,
    products: filtered.slice(i * productsPerSection, (i + 1) * productsPerSection),
    side: (i % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
  }));
  const remainingProducts = filtered.slice(calloutCards.length * productsPerSection);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <section
      className="bg-background px-6 py-12 lg:px-0"
      {...getProps({ fieldId: 'internalName' })}
    >
      <div className="container px-0 md:px-6">
        {/* Section title */}
        {liveData.titleRt?.json && (
          <div
            className="text-foreground mb-8 text-3xl font-bold tracking-tight"
            {...getProps({ fieldId: 'titleRt' })}
          >
            <RtField rt={liveData.titleRt} />
          </div>
        )}

        <div className="flex gap-8">
          {/* ── Left sidebar ──────────────────────────────────────────── */}
          <aside className="w-56 flex-shrink-0 space-y-6">
            {/* Category */}
            <div>
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Category
              </h3>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    'w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  All
                </button>
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Price
              </h3>
              <div className="space-y-1">
                {PRICE_BUCKETS.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setPriceBucket(b.value)}
                    className={cn(
                      'w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                      priceBucket === b.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* In-stock toggle */}
            <div>
              <label className="text-foreground flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="border-border accent-primary h-4 w-4 rounded"
                />
                In Stock Only
              </label>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  Tags
                </h3>
                <div className="space-y-1">
                  {allTags.map((tag) => (
                    <label
                      key={tag}
                      className="text-foreground flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="border-border accent-primary h-4 w-4 rounded"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── Right product grid ────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className={cn('grid gap-4', colsClass)}>
                {Array.from({ length: columns ?? 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border-muted-foreground/40 text-muted-foreground rounded-lg border border-dashed p-12 text-center">
                No products match the selected filters.
              </div>
            ) : calloutCards.length > 0 ? (
              <div className="space-y-5">
                {calloutSections.map(({ card, products, side }, idx) => (
                  <div key={`callout-section-${idx}`} className="flex gap-5">
                    {side === 'left' && (
                      <div className="w-1/3 flex-shrink-0">
                        <CardRenderer card={card} className="h-full" />
                      </div>
                    )}
                    <div className={cn('flex-1 grid gap-5', colsClass)}>
                      {products.map((p) => (
                        <ProductCard key={`product-${p.sku}`} product={p} />
                      ))}
                    </div>
                    {side === 'right' && (
                      <div className="w-1/3 flex-shrink-0">
                        <CardRenderer card={card} className="h-full" />
                      </div>
                    )}
                  </div>
                ))}
                {remainingProducts.length > 0 && (
                  <div className={cn('grid gap-5', colsClass)}>
                    {remainingProducts.map((p) => (
                      <ProductCard key={`product-${p.sku}`} product={p} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={cn('grid gap-5', colsClass)}>
                {filtered.map((p) => (
                  <ProductCard key={`product-${p.sku}`} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
