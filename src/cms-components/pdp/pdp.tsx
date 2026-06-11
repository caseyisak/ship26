'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

import type { BlockProps, ProductDetailPageFragment } from '@/block-renderer/types';
import type { ProductRecord } from '@/lib/integration-adapters/types';
import { getPersona } from '@/lib/persona-session';
import { applyPersonaDiscount } from '@/lib/use-discounted-catalog';
import { DocumentSection } from './DocumentSection';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

/**
 * BlockRenderer is dynamically imported to break the circular dep:
 * block-renderer → configs → pdp → block-renderer
 */
const BlockRenderer = dynamic(
  () =>
    import('@/block-renderer/block-renderer').then((m) => ({
      default: m.BlockRenderer,
    })),
  { ssr: false },
);

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Color swatches ────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  'Space Gray': '#8D8D8D',
  'Midnight Black': '#1A1A1A',
  'Pearl White': '#F5F5F0',
  Silver: '#C0C0C0',
  'Matte Black': '#222222',
  Obsidian: '#1B1B2F',
  Graphite: '#383838',
  'Warm Gray': '#9B8B7A',
  Slate: '#5A6A7A',
  Sand: '#C8B89A',
  Forest: '#3D5A4A',
  White: '#F8F8F8',
  Black: '#111111',
  'Walnut + Black': '#5C4033',
  'All Black': '#111111',
  Midnight: '#1A1A2E',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Pdp({ data: rawData }: BlockProps<ProductDetailPageFragment>) {
  const data = useLiveUpdates(rawData);
  const getProps = useContentfulInspectorModeProps(rawData.sys.id);

  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // sku field is now a JSON Object storing the full ProductRecord
  // Defer discount application until after mount to avoid hydration mismatch
  const rawProduct = data.sku as ProductRecord | null | undefined;
  const product = rawProduct
    ? mounted
      ? applyPersonaDiscount(rawProduct)
      : rawProduct
    : null;

  const sections = data.sectionsCollection?.items?.filter(Boolean) ?? [];

  // ── No product linked ────────────────────────────────────────────────────
  if (!product?.sku) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-12 text-center text-muted-foreground">
          No product linked. Use the Integration Simulator app to select a product.
        </div>
      </section>
    );
  }

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    // Dispatch add-to-cart event for SearchPanel assistant flow
    window.dispatchEvent(
      new CustomEvent('add-to-cart', { detail: { product } }),
    );
  };

  return (
    <>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* ── Left: Image carousel ──────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {product.images?.length ? (
              <>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                  <img
                    src={product.images[imageIndex]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2">
                    {product.images.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageIndex(i)}
                        className={cn(
                          'h-16 w-16 overflow-hidden rounded-md border-2 transition-colors',
                          i === imageIndex
                            ? 'border-foreground'
                            : 'border-transparent opacity-60 hover:opacity-100',
                        )}
                      >
                        <img
                          src={src}
                          alt={`View ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
                No image
              </div>
            )}
          </div>

          {/* ── Right: Product info (NOT inspector-tagged — from Shopify) ── */}
          <div className="flex flex-col gap-4">
            {/* Sourced-from platform badge */}
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ background: '#0059C8' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M19.5 8.25h-1.732A5.768 5.768 0 0 0 12 3a5.768 5.768 0 0 0-5.768 5.25H4.5A1.5 1.5 0 0 0 3 9.75v9A1.5 1.5 0 0 0 4.5 20.25h15a1.5 1.5 0 0 0 1.5-1.5v-9a1.5 1.5 0 0 0-1.5-1.5zM12 4.5a4.27 4.27 0 0 1 4.232 3.75H7.768A4.27 4.27 0 0 1 12 4.5z" />
                </svg>
                {product.source ?? 'Ecomm Integration'}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

            {/* SKU */}
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl font-bold">${product.salePrice.toFixed(2)}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                      {(() => {
                        const p = typeof window !== 'undefined' ? getPersona() : null;
                        const tier = p?.loyalty_tier;
                        return tier ? `${tier.charAt(0).toUpperCase() + tier.slice(1)} Promo` : 'SALE';
                      })()}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  product.inStock ? 'bg-green-500' : 'bg-red-500',
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  product.inStock ? 'text-green-700' : 'text-red-600',
                )}
              >
                {product.inStock
                  ? `In Stock${product.inventory < 10 ? ` — only ${product.inventory} left` : ''}`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Color swatches */}
            {product.variants?.colors?.length ? (
              <div>
                <p className="mb-2 text-sm font-medium">
                  Color{selectedColor ? `: ${selectedColor}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
                        color === selectedColor
                          ? 'border-foreground bg-foreground/5 font-semibold'
                          : 'hover:bg-muted',
                      )}
                      title={color}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-black/10"
                        style={{ background: COLOR_MAP[color] ?? '#ccc' }}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Size pills */}
            {product.variants?.sizes?.length ? (
              <div>
                <p className="mb-2 text-sm font-medium">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={cn(
                        'rounded border px-3 py-1 text-sm transition-colors',
                        size === selectedSize
                          ? 'border-foreground bg-foreground text-background'
                          : 'hover:bg-muted',
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tags?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Documents */}
            {product.documents && product.documents.length > 0 && (
              <DocumentSection documents={product.documents} />
            )}

            {/* Add to Cart CTA */}
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={cn(
                  'flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all',
                  product.inStock
                    ? addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-foreground text-background hover:opacity-90'
                    : 'cursor-not-allowed bg-muted text-muted-foreground',
                )}
              >
                {addedToCart ? 'Added to Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                type="button"
                className="rounded-lg border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* ── Editor Notes (Contentful-editable, inspector-tagged) ── */}
        {data.editorNotes?.json && (
          <>
            <hr className="my-10 border-border" />
            <div
              className="prose prose-sm max-w-none"
              {...getProps({ fieldId: 'editorNotes' })}
            >
              <RtField rt={data.editorNotes} />
            </div>
          </>
        )}
      </section>

      {/* ── Related sections (Banner, TwoAcross, CtaSection, Form, DynamicListing) ── */}
      {sections.length > 0 && (
        <div className="space-y-0">
          {sections.map((section) =>
            section ? (
              <BlockRenderer key={section.sys.id} data={section} />
            ) : null,
          )}
        </div>
      )}
    </>
  );
}
