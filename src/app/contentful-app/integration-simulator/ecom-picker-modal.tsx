'use client';

import {
  Badge,
  Box,
  Button,
  Flex,
  Skeleton,
  Text,
  TextInput,
} from '@contentful/f36-components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { contentfulCatalogAdapter } from '@/lib/integration-adapters/contentful-catalog';
import type { ProductRecord } from '@/lib/integration-adapters/types';

import { BRAND_CONFIG } from './config-screen';
import type { SimulatorType } from './config-screen';
import { useFakeFetch } from './shared/use-fake-fetch';

// ── Constants ─────────────────────────────────────────────────────────────────

const IMPORT_DELAY_MS = 1200;

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveCategories(products: ProductRecord[]): string[] {
  const cats = Array.from(new Set(products.map((p) => p.category)));
  return ['All', ...cats.sort()];
}

function stockBadgeVariant(p: ProductRecord): 'positive' | 'warning' | 'negative' {
  if (!p.inStock) return 'negative';
  if (p.inventory < 10) return 'warning';
  return 'positive';
}

function stockLabel(p: ProductRecord): string {
  if (!p.inStock) return 'Out of Stock';
  if (p.inventory < 10) return 'Low Stock';
  return 'In Stock';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProductCard({
  product,
  isSelected,
  onClick,
}: {
  product: ProductRecord;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        border: isSelected ? '2px solid #0090FF' : '1px solid #CFD9E0',
        borderRadius: 8,
        background: isSelected ? '#E8F4FF' : '#fff',
        cursor: 'pointer',
        padding: 0,
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {/* Image */}
      <Box
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1/1',
          overflow: 'hidden',
          background: '#F7F9FA',
        }}
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <Flex
            alignItems="center"
            justifyContent="center"
            style={{ width: '100%', height: '100%' }}
          >
            <Text fontColor="gray400">No image</Text>
          </Flex>
        )}

        {/* Selected checkmark overlay */}
        {isSelected && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,144,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#0090FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              ✓
            </Box>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box style={{ padding: '7px 8px 8px' }}>
        <Text
          fontWeight="fontWeightDemiBold"
          style={{ display: 'block', marginBottom: 4, fontSize: 11, lineHeight: '1.3' }}
        >
          {product.name}
        </Text>
        <Flex gap="spacingXs" alignItems="center" style={{ flexWrap: 'wrap', gap: 3 }}>
          <Badge variant="secondary" style={{ fontSize: 9 }}>
            {product.sku}
          </Badge>
          <Text fontColor="gray700" style={{ fontSize: 11, fontWeight: 600 }}>
            ${(product.salePrice ?? product.price ?? 0).toFixed(2)}
          </Text>
        </Flex>
        <Box style={{ marginTop: 3 }}>
          <Badge variant={stockBadgeVariant(product)} style={{ fontSize: 9 }}>
            {stockLabel(product)}
          </Badge>
        </Box>
      </Box>
    </Box>
  );
}

function SkeletonCard() {
  return (
    <Box style={{ border: '1px solid #CFD9E0', borderRadius: 8, overflow: 'hidden' }}>
      <Skeleton.Container>
        <Skeleton.Image width="100%" height={120} />
        <Box style={{ padding: '10px 12px 12px' }}>
          <Skeleton.BodyText numberOfLines={2} />
        </Box>
      </Skeleton.Container>
    </Box>
  );
}

// ── Product detail side panel ─────────────────────────────────────────────────

function ProductDetailPanel({ product }: { product: ProductRecord }) {
  return (
    <Box
      style={{
        width: '30%',
        flexShrink: 0,
        borderLeft: '1px solid #CFD9E0',
        padding: 0,
        background: '#F7F9FA',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Product image — always at top */}
      {product.images?.[0] ? (
        <img
          src={product.images[0]}
          alt={product.name}
          style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 6, display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <Box style={{ width: '100%', aspectRatio: '4/3', background: '#F0F4F8', borderRadius: 6 }} />
      )}

      <Box style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Text fontWeight="fontWeightDemiBold" style={{ fontSize: 13 }}>
        {product.name}
      </Text>

      <Box style={{ borderTop: '1px solid #E5EAEF', paddingTop: 10 }}>
        {/* Price */}
        <Box style={{ marginBottom: 8 }}>
          <Text fontColor="gray500" style={{ fontSize: 10, display: 'block' }}>Price</Text>
          <Flex alignItems="center" gap="spacingXs">
            <Text style={{ fontSize: 13, fontWeight: 600 }}>
              ${(product.salePrice ?? product.price ?? 0).toFixed(2)}
            </Text>
            {product.salePrice && (
              <Text fontColor="gray500" style={{ fontSize: 11, textDecoration: 'line-through' }}>
                ${(product.price ?? 0).toFixed(2)}
              </Text>
            )}
          </Flex>
        </Box>

        {/* Stock */}
        <Box style={{ marginBottom: 8 }}>
          <Text fontColor="gray500" style={{ fontSize: 10, display: 'block' }}>Stock</Text>
          <Badge variant={product.inStock ? (product.inventory < 10 ? 'warning' : 'positive') : 'negative'} style={{ fontSize: 10 }}>
            {product.inStock ? `${product.inventory} units` : 'Out of Stock'}
          </Badge>
        </Box>

        {/* Category */}
        <Box style={{ marginBottom: 8 }}>
          <Text fontColor="gray500" style={{ fontSize: 10, display: 'block' }}>Category</Text>
          <Text style={{ fontSize: 12 }}>{product.category}</Text>
        </Box>

        {/* SKU */}
        <Box style={{ marginBottom: 8 }}>
          <Text fontColor="gray500" style={{ fontSize: 10, display: 'block' }}>SKU</Text>
          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{product.sku}</Text>
        </Box>

        {/* Description */}
        {product.description && (
          <Box style={{ marginBottom: 8 }}>
            <Text fontColor="gray500" style={{ fontSize: 10, display: 'block' }}>Description</Text>
            <Text style={{ fontSize: 11, lineHeight: '1.4' }}>{product.description}</Text>
          </Box>
        )}

        {/* Tags */}
        {product.tags?.length > 0 && (
          <Box>
            <Text fontColor="gray500" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>Tags</Text>
            <Flex style={{ flexWrap: 'wrap', gap: 4 }}>
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" style={{ fontSize: 9 }}>{tag}</Badge>
              ))}
            </Flex>
          </Box>
        )}

        {/* Variants */}
        {product.variants?.colors?.length ? (
          <Box style={{ marginTop: 8 }}>
            <Text fontColor="gray500" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>Colors</Text>
            <Text style={{ fontSize: 11 }}>{product.variants.colors.join(', ')}</Text>
          </Box>
        ) : null}
        {product.variants?.sizes?.length ? (
          <Box style={{ marginTop: 8 }}>
            <Text fontColor="gray500" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>Sizes</Text>
            <Text style={{ fontSize: 11 }}>{product.variants.sizes.join(', ')}</Text>
          </Box>
        ) : null}
      </Box>
      </Box>{/* end padded content */}
    </Box>
  );
}

// ── Full-page picker content (rendered in Contentful dialog) ──────────────────

export interface EcomPickerContentProps {
  simulatorType: SimulatorType;
  onSelect: (product: ProductRecord) => void;
  onClose: () => void;
  /** Accumulate multiple selections (DynamicListing) */
  multiSelect?: boolean;
}

export function EcomPickerContent({
  simulatorType,
  onSelect,
  onClose,
  multiSelect = false,
}: EcomPickerContentProps) {
  const brand = BRAND_CONFIG[simulatorType];
  const headerBg = brand.color;
  const headerLabel = `${brand.label} — Product Catalog`;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetcher = useCallback(
    () => contentfulCatalogAdapter.getProducts(debouncedSearch || undefined),
    [debouncedSearch],
  );
  const { data: products, isLoading } = useFakeFetch<ProductRecord[]>(
    fetcher,
    [debouncedSearch],
  );

  const categories = useMemo(
    () => (products ? deriveCategories(products) : ['All']),
    [products],
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  useEffect(() => {
    setActiveCategory('All');
  }, [debouncedSearch]);

  const toggleSelect = (sku: string) => {
    if (multiSelect) {
      setSelectedSkus((prev) => {
        const next = new Set(prev);
        if (next.has(sku)) next.delete(sku);
        else next.add(sku);
        return next;
      });
    } else {
      setSelectedSkus(new Set([sku]));
    }
  };

  const selectedProducts = products?.filter((p) => selectedSkus.has(p.sku)) ?? [];

  const handleImport = async () => {
    if (selectedProducts.length === 0) return;
    setIsImporting(true);
    await new Promise((r) => setTimeout(r, IMPORT_DELAY_MS));
    setIsImporting(false);
    if (multiSelect) {
      selectedProducts.forEach((p) => onSelect(p));
    } else {
      onSelect(selectedProducts[0]);
    }
    onClose();
  };

  const importLabel = isImporting
    ? 'Importing…'
    : multiSelect && selectedSkus.size > 1
      ? `Add ${selectedSkus.size} Products`
      : 'Import Product';

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Vendor-branded header — full width */}
      <Box
        style={{
          background: headerBg,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* Generic storefront icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
          <polyline points="9 22 9 12 15 12 15 22" fill="white" />
        </svg>
        <Text
          fontWeight="fontWeightDemiBold"
          style={{ color: '#fff', fontSize: 14, letterSpacing: '0.02em' }}
        >
          {headerLabel}
        </Text>
      </Box>

      {/* Body: left column (search + tabs + grid + footer) + right panel */}
      <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left column ───────────────────────────────────────────────── */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Search bar */}
          <Box style={{ padding: '10px 16px', background: headerBg, flexShrink: 0 }}>
            <TextInput
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder={`Search ${brand.label}…`}
              isDisabled={isLoading}
              style={{ borderRadius: 6 }}
            />
          </Box>

          {/* Category tabs */}
          {!isLoading && categories.length > 1 && (
            <Box
              style={{
                background: headerBg,
                padding: '6px 16px',
                display: 'flex',
                gap: 4,
                overflowX: 'auto',
                flexShrink: 0,
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: activeCategory === cat ? 'rgba(255,255,255,0.25)' : 'none',
                    border:
                      activeCategory === cat
                        ? '1px solid rgba(255,255,255,0.6)'
                        : '1px solid transparent',
                    color: '#fff',
                    borderRadius: 4,
                    padding: '3px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </button>
              ))}
            </Box>
          )}

          {/* Product grid */}
          <Box style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {!isLoading && (
              <Text fontColor="gray600" style={{ fontSize: 11, marginBottom: 10, display: 'block' }}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </Text>
            )}
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : filteredProducts.map((product) => (
                    <ProductCard
                      key={product.sku}
                      product={product}
                      isSelected={selectedSkus.has(product.sku)}
                      onClick={() => toggleSelect(product.sku)}
                    />
                  ))}
            </Box>
            {!isLoading && filteredProducts.length === 0 && (
              <Box style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text fontColor="gray500">No products found.</Text>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box
            style={{
              borderTop: '1px solid #CFD9E0',
              padding: '10px 16px',
              background: '#fff',
              flexShrink: 0,
            }}
          >
            <Flex justifyContent="space-between" alignItems="center">
              <Box>
                {selectedSkus.size > 0 && (
                  <Text fontColor="gray600" style={{ fontSize: 12 }}>
                    Selected:{' '}
                    <strong>
                      {selectedProducts.map((p) => p.name).join(', ')}
                      {selectedProducts[0] && ` (${selectedProducts[0].sku})`}
                    </strong>
                  </Text>
                )}
              </Box>
              <Flex gap="spacingS">
                <Button variant="secondary" onClick={onClose} isDisabled={isImporting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleImport}
                  isDisabled={selectedSkus.size === 0}
                  isLoading={isImporting}
                >
                  {importLabel}
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Box>

        {/* ── Right panel (30% — full height alongside left column) ─────── */}
        {selectedProducts[0] && <ProductDetailPanel product={selectedProducts[0]} />}
      </Box>
    </Box>
  );
}
