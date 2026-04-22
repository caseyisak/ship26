'use client';

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Paragraph,
  Select,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@contentful/f36-components';
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShoppingCartSimpleIcon,
} from '@contentful/f36-icons';
import React, { useState } from 'react';

// ── Brand config ───────────────────────────────────────────────────────────────

type SimulatorType = 'SHOPIFY' | 'COMMERCETOOLS' | 'BIGCOMMERCE';

const BRAND_CONFIG: Record<SimulatorType, { label: string; color: string; textColor: string }> = {
  SHOPIFY:       { label: 'Shopify',       color: '#96BF48', textColor: '#fff' },
  COMMERCETOOLS: { label: 'commercetools', color: '#FF7C00', textColor: '#fff' },
  BIGCOMMERCE:   { label: 'BigCommerce',   color: '#2776C6', textColor: '#fff' },
};

const ECOM_TYPES: SimulatorType[] = ['SHOPIFY', 'COMMERCETOOLS', 'BIGCOMMERCE'];

// ── Mock data ──────────────────────────────────────────────────────────────────

type MockProduct = {
  id: string;
  sku: string;
  name: string;
  price: number;
  salePrice?: number;
  currency: string;
  inStock: boolean;
  inventory: number;
  category: string;
  tags: string[];
  image: string;
};

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1', sku: 'MF-MON-001', name: 'ProDisplay 27"', price: 649.00,
    currency: 'USD', inStock: true, inventory: 8, category: 'Monitors', tags: ['IPS', '4K', 'USB-C'],
    image: 'https://images.unsplash.com/photo-1527443224154-c4a573d005e1?w=300&q=80',
  },
  {
    id: '2', sku: 'MF-MON-002', name: 'UltraWide 34"', price: 899.00, salePrice: 749.00,
    currency: 'USD', inStock: true, inventory: 24, category: 'Monitors', tags: ['Ultrawide', '144hz', 'QHD'],
    image: 'https://images.unsplash.com/photo-1593640408182-31c228e53691?w=300&q=80',
  },
  {
    id: '3', sku: 'MF-KEY-001', name: 'MechKeys Pro', price: 189.00,
    currency: 'USD', inStock: false, inventory: 0, category: 'Keyboards', tags: ['Mechanical', 'Wireless'],
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&q=80',
  },
  {
    id: '4', sku: 'MF-MSE-001', name: 'Precision Mouse X', price: 79.00,
    currency: 'USD', inStock: true, inventory: 156, category: 'Mice', tags: ['Wireless', 'Ergonomic'],
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&q=80',
  },
  {
    id: '5', sku: 'MF-HUB-001', name: 'USB-C Hub 7-in-1', price: 49.00,
    currency: 'USD', inStock: true, inventory: 45, category: 'Accessories', tags: ['USB-C', 'HDMI'],
    image: 'https://images.unsplash.com/photo-1625315714128-2c97c9c5d1a1?w=300&q=80',
  },
  {
    id: '6', sku: 'MF-CAM-001', name: 'StreamCam HD', price: 129.00,
    currency: 'USD', inStock: true, inventory: 12, category: 'Cameras', tags: ['1080p', 'Auto-focus'],
    image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=300&q=80',
  },
];

const FILLED_PRODUCT = MOCK_PRODUCTS[1]; // UltraWide 34"

// ── Helpers ────────────────────────────────────────────────────────────────────

function stockVariant(p: MockProduct): 'positive' | 'warning' | 'negative' {
  if (!p.inStock) return 'negative';
  if (p.inventory < 10) return 'warning';
  return 'positive';
}

function stockLabel(p: MockProduct): string {
  if (!p.inStock) return 'Out of stock';
  if (p.inventory < 10) return `Low stock (${p.inventory})`;
  return 'In stock';
}

function formatPrice(p: MockProduct): string {
  const effective = p.salePrice ?? p.price;
  return `$${effective.toFixed(2)}`;
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        display: 'block', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', color: '#8895A7',
        textTransform: 'uppercase', marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

// ── Brand pill ─────────────────────────────────────────────────────────────────

function BrandPill({ brand }: { brand: SimulatorType }) {
  const cfg = BRAND_CONFIG[brand];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: cfg.color, color: cfg.textColor,
        borderRadius: 4, padding: '2px 8px',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}

// ── Field card wrapper ─────────────────────────────────────────────────────────

function FieldCard({ children, maxWidth = 672 }: { children: React.ReactNode; maxWidth?: number | string }) {
  return (
    <Box
      style={{
        maxWidth, background: '#fff',
        border: '1px solid #CFD9E0', borderRadius: 6, overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

// ── 1. Loading state ───────────────────────────────────────────────────────────

function LoadingState({ brand }: { brand: SimulatorType }) {
  const cfg = BRAND_CONFIG[brand];
  return (
    <FieldCard>
      <Box
        style={{
          padding: '6px 14px', background: '#F7F9FA',
          borderBottom: '1px solid #E5EAEF',
          display: 'flex', alignItems: 'center',
        }}
      >
        <BrandPill brand={brand} />
      </Box>
      <Flex
        alignItems="center"
        justifyContent="center"
        style={{ padding: '28px 24px', gap: 10 }}
      >
        <Spinner size="medium" style={{ color: cfg.color }} />
        <Text style={{ fontSize: 13, color: '#6B7585' }}>Loading product…</Text>
      </Flex>
    </FieldCard>
  );
}

// ── 2. Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ brand }: { brand: SimulatorType }) {
  const cfg = BRAND_CONFIG[brand];
  return (
    <FieldCard>
      <Flex
        flexDirection="column"
        alignItems="center"
        style={{ padding: '32px 24px', gap: 12, textAlign: 'center' }}
      >
        <Box
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#F0F4F8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ShoppingCartSimpleIcon style={{ width: 26, height: 26, color: '#8895A7' }} />
        </Box>
        <Box>
          <Text
            fontWeight="fontWeightDemiBold"
            style={{ display: 'block', fontSize: 14, color: '#2A3039', marginBottom: 4 }}
          >
            No product linked
          </Text>
          <Paragraph style={{ fontSize: 13, color: '#6B7585', margin: 0, lineHeight: '1.5' }}>
            Search your {cfg.label} store to connect a product to this entry
          </Paragraph>
        </Box>
        <button
          style={{
            marginTop: 4, padding: '8px 18px',
            background: cfg.color, color: cfg.textColor,
            border: 'none', borderRadius: 4,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <PlusIcon style={{ width: 14, height: 14 }} />
          Link product
        </button>
      </Flex>
    </FieldCard>
  );
}

// ── 3. Filled state ────────────────────────────────────────────────────────────

function FilledState({ brand }: { brand: SimulatorType }) {
  const p = FILLED_PRODUCT;
  const hasSale = !!p.salePrice;

  return (
    <FieldCard>
      {/* Brand header strip */}
      <Box
        style={{
          padding: '6px 14px', background: '#F7F9FA',
          borderBottom: '1px solid #E5EAEF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <BrandPill brand={brand} />
        <Text style={{ fontSize: 11, color: '#8895A7' }}>1 product linked</Text>
      </Box>

      {/* Product row with real image */}
      <Flex style={{ padding: 14, gap: 14, alignItems: 'flex-start' }}>
        {/* Image */}
        <Box
          style={{
            width: 100, height: 100, flexShrink: 0,
            border: '1px solid #E5EAEF', borderRadius: 4,
            background: '#F7F9FA', overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.image}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        {/* Metadata */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            fontWeight="fontWeightDemiBold"
            style={{ display: 'block', fontSize: 14, color: '#2A3039', marginBottom: 8 }}
          >
            {p.name}
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              ['SKU', <span key="sku" style={{ fontFamily: 'monospace', fontSize: 11, background: '#F0F4F8', padding: '1px 5px', borderRadius: 2 }}>{p.sku}</span>],
              ['Price', (
                <Flex key="price" alignItems="center" style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: '#2A3039' }}>{formatPrice(p)}</Text>
                  {hasSale && <Text style={{ fontSize: 11, color: '#8895A7', textDecoration: 'line-through' }}>${p.price.toFixed(2)}</Text>}
                </Flex>
              )],
              ['Stock', <Badge key="stock" variant={stockVariant(p)} style={{ fontSize: 10 }}>{stockLabel(p)}</Badge>],
              ['Category', <Text key="cat" style={{ fontSize: 12, color: '#2A3039' }}>{p.category}</Text>],
            ].map(([label, value]) => (
              <Flex key={String(label)} style={{ gap: 0, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: '#8895A7', width: 60, flexShrink: 0 }}>{label}</Text>
                {value}
              </Flex>
            ))}
          </Box>
          {p.tags.length > 0 && (
            <Flex style={{ flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {p.tags.map((tag) => (
                <Badge key={tag} variant="secondary" style={{ fontSize: 9 }}>{tag}</Badge>
              ))}
            </Flex>
          )}
        </Box>

        {/* Actions */}
        <Flex style={{ flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <Button variant="secondary" size="small">Change</Button>
          <Button variant="negative" size="small">Remove</Button>
        </Flex>
      </Flex>
    </FieldCard>
  );
}

// ── 4. Picker modal (inline simulation) ───────────────────────────────────────

const HEADER_H = 42;
const TOOLBAR_H = 52;
const RESULT_H = 28;
const FOOTER_H = 52;
const DETAIL_W = 230;

function PickerModal({ brand }: { brand: SimulatorType }) {
  const cfg = BRAND_CONFIG[brand];
  const [selectedId, setSelectedId] = useState<string>('2');
  const [inStockOnly, setInStockOnly] = useState(false);

  const selected = MOCK_PRODUCTS.find((p) => p.id === selectedId);
  const visible = inStockOnly ? MOCK_PRODUCTS.filter((p) => p.inStock) : MOCK_PRODUCTS;

  return (
    <Box
      style={{
        width: '75vw', height: '60vh',
        display: 'flex', flexDirection: 'column',
        background: '#fff', border: '1px solid #CFD9E0', borderRadius: 6, overflow: 'hidden',
      }}
    >
      {/* Branded header */}
      <Box
        style={{
          height: HEADER_H, background: cfg.color, padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}
      >
        <ShoppingCartSimpleIcon style={{ width: 16, height: 16, color: cfg.textColor }} />
        <Text
          fontWeight="fontWeightDemiBold"
          style={{ color: cfg.textColor, fontSize: 13, letterSpacing: '0.02em' }}
        >
          {cfg.label} — Product Catalog
        </Text>
      </Box>

      {/* Body */}
      <Flex style={{ flex: 1, overflow: 'hidden' }}>

        {/* Left: search + grid + footer */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Toolbar */}
          <Box
            style={{
              height: TOOLBAR_H, padding: '0 14px', flexShrink: 0,
              borderBottom: '1px solid #E5EAEF',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <Box style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MagnifyingGlassIcon
                style={{
                  position: 'absolute', left: 10,
                  width: 14, height: 14, color: '#8895A7',
                  pointerEvents: 'none', zIndex: 1,
                }}
              />
              <TextInput
                aria-label="Search products"
                placeholder="Search products…"
                style={{ paddingLeft: 30, width: '100%' }}
              />
            </Box>
            <Select aria-label="Category filter" style={{ width: 148 }}>
              <Select.Option value="all">All categories</Select.Option>
              <Select.Option value="monitors">Monitors</Select.Option>
              <Select.Option value="keyboards">Keyboards</Select.Option>
              <Select.Option value="mice">Mice</Select.Option>
              <Select.Option value="accessories">Accessories</Select.Option>
              <Select.Option value="cameras">Cameras</Select.Option>
            </Select>
            <Checkbox
              isChecked={inStockOnly}
              onChange={() => setInStockOnly((v) => !v)}
              style={{ whiteSpace: 'nowrap', fontSize: 12 }}
            >
              In stock only
            </Checkbox>
          </Box>

          {/* Result count */}
          <Box
            style={{
              height: RESULT_H, padding: '0 14px', flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 11, color: '#8895A7' }}>
              {visible.length} product{visible.length !== 1 ? 's' : ''}
            </Text>
          </Box>

          {/* Product grid — 5 columns, no scroll */}
          <Box
            style={{
              flex: 1, overflow: 'hidden',
              padding: '0 14px 8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
              alignContent: 'start',
            }}
          >
            {visible.map((product) => {
              const isSel = product.id === selectedId;
              return (
                <Box
                  key={product.id}
                  as="button"
                  type="button"
                  onClick={() => setSelectedId(product.id)}
                  style={{
                    position: 'relative',
                    border: isSel ? `2px solid ${cfg.color}` : '1px solid #CFD9E0',
                    borderRadius: 6,
                    background: isSel ? `${cfg.color}18` : '#fff',
                    cursor: 'pointer', padding: 0,
                    textAlign: 'left', overflow: 'hidden',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    style={{
                      position: 'relative', width: '100%', aspectRatio: '1/1',
                      background: '#F0F4F8', overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />

                    {/* Selected overlay */}
                    {isSel && (
                      <Box
                        style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Box
                          style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: cfg.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <CheckCircleIcon style={{ width: 16, height: 16, color: '#fff' }} />
                        </Box>
                      </Box>
                    )}

                    {/* Out of stock badge */}
                    {!product.inStock && (
                      <Box style={{ position: 'absolute', top: 4, right: 4 }}>
                        <Badge variant="negative" style={{ fontSize: 9 }}>Out of stock</Badge>
                      </Box>
                    )}
                  </Box>

                  {/* Info */}
                  <Box style={{ padding: '5px 7px 6px' }}>
                    <Text
                      fontWeight="fontWeightDemiBold"
                      style={{
                        display: 'block', fontSize: 11, lineHeight: '1.3',
                        marginBottom: 2, color: '#2A3039',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {product.name}
                    </Text>
                    <Flex alignItems="center" style={{ gap: 4 }}>
                      <Text
                        style={{
                          fontFamily: 'monospace', fontSize: 9, color: '#8895A7',
                          background: '#F0F4F8', padding: '1px 3px', borderRadius: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%',
                        }}
                      >
                        {product.sku}
                      </Text>
                      <Text
                        style={{ fontSize: 11, fontWeight: 600, color: '#2A3039', marginLeft: 'auto', whiteSpace: 'nowrap' }}
                      >
                        {formatPrice(product)}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Footer */}
          <Box
            style={{
              height: FOOTER_H, flexShrink: 0,
              borderTop: '1px solid #E5EAEF', padding: '0 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Box>
              {selected && (
                <Text style={{ fontSize: 12, color: '#6B7585' }}>
                  Selected:{' '}
                  <strong style={{ color: '#2A3039' }}>{selected.name}</strong>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, marginLeft: 6, color: '#8895A7' }}>
                    {selected.sku}
                  </span>
                </Text>
              )}
            </Box>
            <Flex style={{ gap: 8 }}>
              <Button variant="secondary" size="small">Cancel</Button>
              <button
                disabled={!selected}
                style={{
                  padding: '6px 14px', borderRadius: 4, border: 'none',
                  background: selected ? cfg.color : '#CFD9E0',
                  color: selected ? cfg.textColor : '#8895A7',
                  fontSize: 13, fontWeight: 600, cursor: selected ? 'pointer' : 'default',
                }}
              >
                Import product
              </button>
            </Flex>
          </Box>
        </Box>

        {/* Right: detail panel */}
        {selected && (
          <Box
            style={{
              width: DETAIL_W, flexShrink: 0,
              borderLeft: '1px solid #E5EAEF',
              background: '#F7F9FA',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Product image */}
            <Box
              style={{
                width: '100%', aspectRatio: '1/1',
                background: '#E5EAEF', overflow: 'hidden', flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.image}
                alt={selected.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>

            {/* Metadata */}
            <Box
              style={{
                padding: '12px 14px', display: 'flex', flexDirection: 'column',
                gap: 8, overflow: 'hidden',
              }}
            >
              <Text
                fontWeight="fontWeightDemiBold"
                style={{ fontSize: 13, color: '#2A3039', lineHeight: '1.3' }}
              >
                {selected.name}
              </Text>

              <Box
                style={{
                  borderTop: '1px solid #E5EAEF', paddingTop: 8,
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                {/* SKU */}
                <Flex style={{ gap: 6 }}>
                  <Text style={{ fontSize: 10, color: '#8895A7', width: 52, flexShrink: 0 }}>SKU</Text>
                  <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#2A3039' }}>{selected.sku}</Text>
                </Flex>
                {/* Price */}
                <Flex style={{ gap: 6, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: '#8895A7', width: 52, flexShrink: 0 }}>Price</Text>
                  <Flex alignItems="center" style={{ gap: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: '#2A3039' }}>{formatPrice(selected)}</Text>
                    {selected.salePrice && (
                      <Text style={{ fontSize: 11, color: '#8895A7', textDecoration: 'line-through' }}>
                        ${selected.price.toFixed(2)}
                      </Text>
                    )}
                  </Flex>
                </Flex>
                {/* Stock */}
                <Flex style={{ gap: 6, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: '#8895A7', width: 52, flexShrink: 0 }}>Stock</Text>
                  <Badge variant={stockVariant(selected)} style={{ fontSize: 10 }}>{stockLabel(selected)}</Badge>
                </Flex>
                {/* Category */}
                <Flex style={{ gap: 6 }}>
                  <Text style={{ fontSize: 10, color: '#8895A7', width: 52, flexShrink: 0 }}>Category</Text>
                  <Text style={{ fontSize: 12, color: '#2A3039' }}>{selected.category}</Text>
                </Flex>
                {/* Tags */}
                {selected.tags.length > 0 && (
                  <Flex style={{ gap: 6 }}>
                    <Text style={{ fontSize: 10, color: '#8895A7', width: 52, flexShrink: 0, paddingTop: 2 }}>Tags</Text>
                    <Flex style={{ flexWrap: 'wrap', gap: 3 }}>
                      {selected.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" style={{ fontSize: 9 }}>{tag}</Badge>
                      ))}
                    </Flex>
                  </Flex>
                )}
              </Box>

              <button
                style={{
                  marginTop: 8, padding: '8px 14px', borderRadius: 4, border: 'none',
                  background: cfg.color, color: cfg.textColor,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%',
                }}
              >
                Import product
              </button>
            </Box>
          </Box>
        )}
      </Flex>
    </Box>
  );
}

// ── Brand switcher ─────────────────────────────────────────────────────────────

function BrandSwitcher({ active, onChange }: { active: SimulatorType; onChange: (b: SimulatorType) => void }) {
  return (
    <Flex style={{ gap: 8 }}>
      {ECOM_TYPES.map((brand) => {
        const cfg = BRAND_CONFIG[brand];
        const isActive = brand === active;
        return (
          <button
            key={brand}
            onClick={() => onChange(brand)}
            style={{
              padding: '6px 16px', borderRadius: 20,
              border: `2px solid ${cfg.color}`,
              background: isActive ? cfg.color : 'transparent',
              color: isActive ? cfg.textColor : cfg.color,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.12s', letterSpacing: '0.01em',
            }}
          >
            {cfg.label}
          </button>
        );
      })}
    </Flex>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function EcommPickerMockupPage() {
  const [activeBrand, setActiveBrand] = useState<SimulatorType>('SHOPIFY');

  return (
    <Box
      style={{
        padding: 32, minHeight: '100vh', background: '#f7f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Box style={{ maxWidth: '80vw', margin: '0 auto' }}>
        {/* Page header */}
        <Box style={{ marginBottom: 28 }}>
          <Text
            fontWeight="fontWeightDemiBold"
            style={{ display: 'block', fontSize: 22, color: '#2A3039', marginBottom: 6 }}
          >
            Ecomm Picker — Improved UI
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7585' }}>
            Forma-36 component patterns · Design review mockup
          </Text>
        </Box>

        {/* Brand switcher card */}
        <Box
          style={{
            marginBottom: 32, padding: '14px 20px',
            background: '#fff', border: '1px solid #E5EAEF', borderRadius: 8,
          }}
        >
          <Text
            style={{
              display: 'block', fontSize: 11, fontWeight: 700, color: '#8895A7',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
            }}
          >
            Integration theme
          </Text>
          <BrandSwitcher active={activeBrand} onChange={setActiveBrand} />
        </Box>

        <Stack flexDirection="column" spacing="spacingXl">
          <Box>
            <SectionLabel>Loading state</SectionLabel>
            <LoadingState brand={activeBrand} />
          </Box>

          <Box>
            <SectionLabel>Empty state</SectionLabel>
            <EmptyState brand={activeBrand} />
          </Box>

          <Box>
            <SectionLabel>Filled state</SectionLabel>
            <FilledState brand={activeBrand} />
          </Box>

          <Box>
            <SectionLabel>Picker modal (inline simulation)</SectionLabel>
            <PickerModal brand={activeBrand} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
