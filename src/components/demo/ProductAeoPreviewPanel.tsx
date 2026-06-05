/**
 * ProductAeoPreviewPanel -- Governance badges + Product JSON-LD drawer for PDP AEO demo.
 *
 * Mirrors AioAeoPreviewPanel but generates Product schema (not FAQPage).
 * Includes additionalProperty array from product tags/metadata.
 */
'use client';

import React from 'react';

import type { ProductDetailPageFragment } from '@/block-renderer/types';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

type Props = {
  data: ProductDetailPageFragment;
  brandName?: string;
};

export function ProductAeoPreviewPanel({ data, brandName = 'Arko Home' }: Props) {
  const governance = data.aioAeoGeo ?? null;
  const hasGovernance = Boolean(governance);

  // Extract product info from the sku JSON field
  const sku = data.sku as Record<string, unknown> | null;
  const productName = (sku?.name as string) ?? data.internalName?.replace(/^PDP:\s*/i, '') ?? 'Product';
  const productSku = (sku?.sku as string) ?? '';
  const productPrice = sku?.price as number | undefined;
  const productCurrency = (sku?.currency as string) ?? 'USD';
  const productDescription = (sku?.description as string) ?? '';
  const productTags = (sku?.tags as string[]) ?? [];
  const productCategory = (sku?.category as string) ?? '';
  const productImages = (sku?.images as string[]) ?? [];
  const productInStock = sku?.inStock as boolean | undefined;

  // Build Product JSON-LD with additionalProperty from tags
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    ...(productSku && { sku: productSku }),
    ...(productDescription && { description: productDescription }),
    ...(productCategory && { category: productCategory }),
    ...(productImages.length > 0 && { image: productImages }),
    ...(productPrice !== undefined && {
      offers: {
        '@type': 'Offer',
        price: productPrice,
        priceCurrency: productCurrency,
        availability: productInStock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    }),
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    // additionalProperty from product tags -- key AEO differentiator
    ...(productTags.length > 0 && {
      additionalProperty: productTags.map((tag) => ({
        '@type': 'PropertyValue',
        name: classifyTag(tag),
        value: tag,
      })),
    }),
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Content Governance */}
      <div className="border-b border-slate-100 px-4 py-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
          Content Governance
        </p>
        {hasGovernance && governance ? (
          <div className="flex flex-wrap gap-2">
            {governance.topic && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                {governance.topic.replace(/_/g, ' ')}
              </span>
            )}
            {governance.ownerTeam && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {governance.ownerTeam}
              </span>
            )}
            {governance.audience && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
                {governance.audience}
              </span>
            )}
            {governance.region && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {governance.region}
              </span>
            )}
            {governance.lastUpdated && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                Last reviewed: {formatDate(governance.lastUpdated)}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No governance metadata. Add an AIO / AEO / GEO Governance entry to
            unlock high-confidence product answers.
          </p>
        )}
      </div>

      {/* Product tags */}
      {productTags.length > 0 && (
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
            Product Tags (additionalProperty)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {productTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* JSON-LD Drawer */}
      <details className="group">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 select-none hover:bg-slate-50">
          View Structured Data (Product JSON-LD) &#8595;
        </summary>
        <div className="border-t border-slate-100 px-4 pt-3 pb-4">
          <p className="mb-2 text-xs text-slate-400">
            {hasGovernance
              ? `Product JSON-LD generated from ${brandName} Contentful entry + governance metadata. Includes additionalProperty from product tags.`
              : 'Schema is present but lacks governance signals. Answer engines may still hedge.'}
          </p>
          <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            <code>{JSON.stringify(jsonLd, null, 2)}</code>
          </pre>
        </div>
      </details>
    </div>
  );
}

/**
 * Classify a product tag into a semantic category for additionalProperty.name.
 * This makes the JSON-LD more meaningful for answer engines.
 */
function classifyTag(tag: string): string {
  const STYLE_TAGS = ['statement', 'sculptural', 'minimalist', 'modern', 'contemporary', 'traditional', 'industrial'];
  const ROOM_TAGS = ['living-room', 'bedroom', 'reading-corner', 'studio', 'office', 'kitchen', 'dining'];
  const MATERIAL_TAGS = ['matte-black', 'brass', 'chrome', 'wood', 'steel', 'marble', 'glass'];
  const LIGHT_TAGS = ['warm-ambient', 'task-lighting', 'accent-lighting', 'desk-lighting', 'directional'];

  if (STYLE_TAGS.includes(tag)) return 'style';
  if (ROOM_TAGS.includes(tag)) return 'roomType';
  if (MATERIAL_TAGS.includes(tag)) return 'material';
  if (LIGHT_TAGS.includes(tag)) return 'lightType';
  return 'feature';
}
