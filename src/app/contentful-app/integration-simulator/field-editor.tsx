'use client';

import { Badge, Box, Button, Flex, Text } from '@contentful/f36-components';
import React, { useEffect, useState } from 'react';

import type {
  AssetRecord,
  ProductRecord,
} from '@/lib/integration-adapters/types';

import type { AppParams, MappingRow, SimulatorType } from './config-screen';
import { BRAND_CONFIG, isEcomType } from './config-screen';

// ── SDK type ──────────────────────────────────────────────────────────────────

type FieldSdk = {
  field: {
    id: string;
    getValue: () => unknown;
    setValue: (v: unknown) => Promise<unknown>;
    removeValue: () => Promise<unknown>;
  };
  contentType: {
    sys: { id: string };
  };
  parameters: {
    installation?: AppParams;
  };
  dialogs: {
    openCurrentApp: (options: {
      title?: string;
      width?: 'small' | 'medium' | 'large' | 'fullWidth' | number;
      minHeight?: number | string;
      parameters?: Record<string, unknown>;
      shouldCloseOnOverlayClick?: boolean;
      shouldCloseOnEscapePress?: boolean;
      allowHeightOverflow?: boolean;
    }) => Promise<ProductRecord | AssetRecord | null>;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSimulatorType(sdk: FieldSdk): SimulatorType | null {
  const mappings: Omit<MappingRow, '_id'>[] =
    sdk.parameters?.installation?.mappings ?? [];
  const ctId = sdk.contentType?.sys?.id;
  const fieldId = sdk.field?.id;
  const match = mappings.find(
    (m) => m.contentTypeId === ctId && m.fieldId === fieldId,
  );
  return match?.simulatorType ?? null;
}

function fileTypeBadgeVariant(
  fileType: string | null | undefined,
): 'positive' | 'secondary' | 'warning' | 'negative' {
  if (!fileType) return 'secondary';
  const t = fileType.toUpperCase();
  if (['PNG', 'JPEG', 'JPG', 'WEBP', 'GIF'].includes(t)) return 'positive';
  if (['SVG', 'PDF'].includes(t)) return 'secondary';
  if (['MP4', 'MOV'].includes(t)) return 'warning';
  return 'negative';
}

// ── Brand pill ────────────────────────────────────────────────────────────────

function BrandPill({ simulatorType }: { simulatorType: SimulatorType }) {
  const brand = BRAND_CONFIG[simulatorType];
  return (
    <span
      style={{
        display: 'inline-block',
        width: 'fit-content',
        background: brand.color,
        color: brand.textColor,
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {brand.label}
    </span>
  );
}

// ── Labeled metadata row ──────────────────────────────────────────────────────

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Text
        fontColor="gray500"
        style={{ fontSize: 10, lineHeight: '1.6', paddingTop: 1 }}
      >
        {label}
      </Text>
      <Box style={{ display: 'flex', alignItems: 'center' }}>{children}</Box>
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function IntegrationSimulatorField({ sdk }: { sdk: unknown }) {
  const fieldSdk = sdk as FieldSdk;
  const simulatorType = getSimulatorType(fieldSdk);

  const [fieldValue, setFieldValue] = useState<
    ProductRecord | AssetRecord | null
  >(null);

  useEffect(() => {
    const raw = fieldSdk.field.getValue();
    if (raw && typeof raw === 'object') {
      setFieldValue(raw as ProductRecord | AssetRecord);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClear = async () => {
    await fieldSdk.field.removeValue();
    setFieldValue(null);
  };

  const openPicker = async () => {
    const result = await fieldSdk.dialogs.openCurrentApp({
      title:
        simulatorType && isEcomType(simulatorType)
          ? 'Select Product'
          : 'Select Asset',
      width: 'fullWidth',
      minHeight: 650,
      parameters: { mode: simulatorType },
      shouldCloseOnOverlayClick: true,
      shouldCloseOnEscapePress: true,
      allowHeightOverflow: true,
    });
    if (!result) return;
    await fieldSdk.field.setValue(result);
    setFieldValue(result);
  };

  const isEcom = simulatorType ? isEcomType(simulatorType) : false;
  const product = isEcom ? (fieldValue as ProductRecord | null) : null;
  const asset = !isEcom ? (fieldValue as AssetRecord | null) : null;

  // ── No mapping configured ─────────────────────────────────────────────────
  if (!simulatorType) {
    return (
      <Box
        padding="spacingM"
        style={{
          border: '1px solid #CFD9E0',
          borderRadius: 6,
          background: '#F7F9FA',
        }}
      >
        <Text fontColor="gray600">
          No mapping configured for this field. Open the Integration Simulator
          app settings to add a mapping.
        </Text>
      </Box>
    );
  }

  // ── Filled state ──────────────────────────────────────────────────────────
  if (fieldValue) {
    return (
      <Box
        style={{
          border: '1px solid #CFD9E0',
          borderRadius: 6,
          overflow: 'hidden',
          minHeight: 380,
        }}
      >
        <Flex style={{ minHeight: 380 }}>
          {/* ═══ ECOM: image left + labeled metadata right ═══ */}
          {isEcom && product && (
            <>
              {/* Left: product image */}
              <Box
                style={{
                  width: 250,
                  flexShrink: 0,
                  background: '#F7F9FA',
                  borderRight: '1px solid #CFD9E0',
                  overflow: 'hidden',
                  alignSelf: 'stretch',
                }}
              >
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'scale-down',
                      display: 'block',
                    }}
                  />
                ) : (
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    style={{ height: '100%' }}
                  >
                    <Text fontColor="gray400" style={{ fontSize: 11 }}>
                      No image
                    </Text>
                  </Flex>
                )}
              </Box>

              {/* Right: details */}
              <Flex
                flexDirection="column"
                style={{ flex: 1, padding: '12px 14px', gap: 8 }}
              >
                <BrandPill simulatorType={simulatorType} />

                <Text
                  fontWeight="fontWeightDemiBold"
                  style={{ fontSize: 14, lineHeight: '1.3' }}
                >
                  {product.name}
                </Text>

                {/* Labeled metadata grid */}
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'max-content 1fr',
                    columnGap: 10,
                    rowGap: 4,
                    alignItems: 'start',
                  }}
                >
                  <MetaRow label="SKU">
                    <Text style={{ fontSize: 11, fontFamily: 'monospace' }}>
                      {product.sku}
                    </Text>
                  </MetaRow>

                  <MetaRow label="Price">
                    <Flex alignItems="center" gap="spacingXs">
                      <Text style={{ fontSize: 12, fontWeight: 600 }}>
                        ${(product.salePrice ?? product.price).toFixed(2)}
                      </Text>
                      {product.salePrice && (
                        <Text
                          fontColor="gray500"
                          style={{
                            fontSize: 11,
                            textDecoration: 'line-through',
                          }}
                        >
                          ${product.price.toFixed(2)}
                        </Text>
                      )}
                    </Flex>
                  </MetaRow>

                  <MetaRow label="Stock">
                    <Badge
                      variant={
                        product.inStock
                          ? product.inventory < 10
                            ? 'warning'
                            : 'positive'
                          : 'negative'
                      }
                      style={{ fontSize: 9 }}
                    >
                      {product.inStock
                        ? product.inventory < 10
                          ? `${product.inventory} left`
                          : 'In Stock'
                        : 'Out of Stock'}
                    </Badge>
                  </MetaRow>

                  {product.category && (
                    <MetaRow label="Category">
                      <Text style={{ fontSize: 11 }}>{product.category}</Text>
                    </MetaRow>
                  )}
                </Box>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <Flex gap="spacingXs" style={{ flexWrap: 'wrap' }}>
                    {product.tags.slice(0, 6).map((tag) => (
                      <Badge
                        key={tag}
                        variant="primary-filled"
                        style={{ fontSize: 9 }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Flex>
                )}

                <Box style={{ flex: 1 }} />

                <Flex
                  justifyContent="flex-end"
                  gap="spacingS"
                  style={{ paddingTop: 8, borderTop: '1px solid #E5EAEF' }}
                >
                  <Button variant="secondary" size="small" onClick={openPicker}>
                    Change Product
                  </Button>
                  <Button
                    variant="transparent"
                    size="small"
                    style={{ color: '#C13B36' }}
                    onClick={handleClear}
                  >
                    Remove
                  </Button>
                </Flex>
              </Flex>
            </>
          )}

          {/* ═══ DAM: image left + metadata right ═══ */}
          {!isEcom && asset && (
            <>
              {/* Left: large image */}
              {asset.thumbnailUrl && (
                <Box
                  style={{
                    width: 160,
                    flexShrink: 0,
                    background: '#F0F4F8',
                    borderRight: '1px solid #CFD9E0',
                    overflow: 'hidden',
                    alignSelf: 'stretch',
                  }}
                >
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.filename}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
              )}

              {/* Right: metadata */}
              <Flex
                flexDirection="column"
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  gap: 8,
                  overflow: 'hidden',
                }}
              >
                <BrandPill simulatorType={simulatorType} />

                <Text
                  fontWeight="fontWeightDemiBold"
                  style={{
                    fontSize: 13,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  {asset.filename}
                </Text>

                {/* Labeled metadata grid */}
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'max-content 1fr',
                    columnGap: 10,
                    rowGap: 4,
                    alignItems: 'start',
                  }}
                >
                  <MetaRow label="Type">
                    <Badge
                      variant={fileTypeBadgeVariant(asset.fileType)}
                      style={{ fontSize: 9 }}
                    >
                      {asset.fileType}
                    </Badge>
                  </MetaRow>

                  <MetaRow label="Size">
                    <Text style={{ fontSize: 11 }}>{asset.fileSize}</Text>
                  </MetaRow>

                  {asset.dimensions && (
                    <MetaRow label="Dimensions">
                      <Text style={{ fontSize: 11 }}>
                        {asset.dimensions.width}×{asset.dimensions.height}
                      </Text>
                    </MetaRow>
                  )}

                  <MetaRow label="Folder">
                    <Text style={{ fontSize: 11 }}>{asset.folder}</Text>
                  </MetaRow>

                  <MetaRow label="Uploaded">
                    <Text style={{ fontSize: 11 }}>{asset.uploadedAt}</Text>
                  </MetaRow>
                </Box>

                {/* Tags */}
                {asset.tags && asset.tags.length > 0 && (
                  <Flex gap="spacingXs" style={{ flexWrap: 'wrap' }}>
                    {asset.tags.slice(0, 6).map((tag) => (
                      <Badge
                        key={tag}
                        variant="primary-filled"
                        style={{ fontSize: 9 }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Flex>
                )}

                <Box style={{ flex: 1 }} />

                <Flex
                  justifyContent="flex-end"
                  gap="spacingS"
                  style={{ paddingTop: 8, borderTop: '1px solid #E5EAEF' }}
                >
                  <Button variant="secondary" size="small" onClick={openPicker}>
                    Change Asset
                  </Button>
                  <Button
                    variant="transparent"
                    size="small"
                    style={{ color: '#C13B36' }}
                    onClick={handleClear}
                  >
                    Remove
                  </Button>
                </Flex>
              </Flex>
            </>
          )}
        </Flex>
      </Box>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  return (
    <Box
      padding="spacingL"
      style={{
        border: '1px solid #CFD9E0',
        borderRadius: 6,
        background: '#F7F9FA',
        textAlign: 'center',
      }}
    >
      <Flex flexDirection="column" alignItems="center" style={{ gap: 12 }}>
        <Text fontColor="gray600">
          {isEcom
            ? 'No product linked. Connect a product from your e-commerce store.'
            : 'No asset linked. Connect a file from your media library.'}
        </Text>
        <Button variant="primary" onClick={openPicker}>
          {isEcom ? 'Add Product' : 'Add Asset'}
        </Button>
      </Flex>
    </Box>
  );
}
