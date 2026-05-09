'use client';

import {
  Badge,
  Box,
  Button,
  Flex,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@contentful/f36-components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { contentfulCatalogAdapter } from '@/lib/integration-adapters/contentful-catalog';
import type { AssetRecord } from '@/lib/integration-adapters/types';

import { BRAND_CONFIG } from './connector-types';
import type { SimulatorType } from './connector-types';
import { useFakeFetch } from './shared/use-fake-fetch';

// ── Constants ─────────────────────────────────────────────────────────────────

const DAM_HEADER = '#2E3F4B';
const DAM_HEADER_DARK = '#1E2D38';
const IMPORT_DELAY_MS = 1000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveFolders(assets: AssetRecord[]): string[] {
  const topLevel = Array.from(new Set(assets.map((a) => a.folder.split('/')[0])));
  return ['All', ...topLevel.sort()];
}

function fileTypeBadge(fileType: string | null | undefined): 'positive' | 'secondary' | 'warning' | 'negative' {
  if (!fileType) return 'secondary';
  const t = fileType.toUpperCase();
  if (['PNG', 'JPEG', 'JPG', 'WEBP', 'GIF'].includes(t)) return 'positive';
  if (['SVG', 'PDF'].includes(t)) return 'secondary';
  if (['MP4', 'MOV'].includes(t)) return 'warning';
  return 'negative';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FileTypeIcon({ fileType }: { fileType: string | null | undefined }) {
  const t = (fileType ?? '').toUpperCase();
  // Simple SVG icons — no emoji
  if (['MP4', 'MOV'].includes(t)) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#94A3B8">
        <path d="M15 10l4.553-2.277A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14v-4zm-2-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      </svg>
    );
  }
  if (t === 'PDF') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#94A3B8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm2-5V3.5L18.5 9H15z" />
      </svg>
    );
  }
  // Generic file / zip
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#94A3B8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
    </svg>
  );
}

function AssetCard({
  asset,
  isSelected,
  onClick,
}: {
  asset: AssetRecord;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isImage = ['PNG', 'JPEG', 'JPG', 'WEBP', 'GIF', 'SVG'].includes(
    (asset.fileType ?? '').toUpperCase(),
  );

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
      {/* Thumbnail */}
      <Box
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          overflow: 'hidden',
          background: '#F0F4F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isImage ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <FileTypeIcon fileType={asset.fileType} />
        )}

        {/* File type badge */}
        <Box style={{ position: 'absolute', top: 6, right: 6 }}>
          <Badge variant={fileTypeBadge(asset.fileType)} style={{ fontSize: 9 }}>
            {asset.fileType}
          </Badge>
        </Box>

        {/* Selected overlay */}
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
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#0090FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ✓
            </Box>
          </Box>
        )}
      </Box>

      {/* Filename + meta */}
      <Box style={{ padding: '8px 10px 10px' }}>
        <Text
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {asset.filename}
        </Text>
        {asset.dimensions && (
          <Text fontColor="gray500" style={{ fontSize: 10 }}>
            {asset.dimensions.width}×{asset.dimensions.height}
          </Text>
        )}
        <Text fontColor="gray500" style={{ fontSize: 10 }}>
          {asset.fileSize}
        </Text>
      </Box>
    </Box>
  );
}

function SkeletonCard() {
  return (
    <Box style={{ border: '1px solid #CFD9E0', borderRadius: 8, overflow: 'hidden' }}>
      <Skeleton.Container>
        <Skeleton.Image width="100%" height={100} />
        <Box style={{ padding: '8px 10px 10px' }}>
          <Skeleton.BodyText numberOfLines={2} />
        </Box>
      </Skeleton.Container>
    </Box>
  );
}

function MetadataPanel({ asset }: { asset: AssetRecord }) {
  return (
    <Box
      style={{
        width: 220,
        flexShrink: 0,
        borderLeft: '1px solid #CFD9E0',
        padding: '16px 14px',
        background: '#F7F9FA',
        overflowY: 'auto',
      }}
    >
      <Stack flexDirection="column" spacing="spacingS">
        <Text fontWeight="fontWeightDemiBold" style={{ fontSize: 13 }}>
          {asset.filename}
        </Text>
        <Box style={{ borderTop: '1px solid #E5EAEF', paddingTop: 10 }}>
          {[
            ['Dimensions', asset.dimensions ? `${asset.dimensions.width} × ${asset.dimensions.height}` : '—'],
            ['File type', asset.fileType],
            ['File size', asset.fileSize],
            ['Folder', asset.folder],
            ['Uploaded', asset.uploadedAt],
            ['By', asset.uploadedBy],
          ].map(([label, value]) => (
            <Box key={label} style={{ marginBottom: 8 }}>
              <Text fontColor="gray500" style={{ fontSize: 10, display: 'block' }}>
                {label}
              </Text>
              <Text style={{ fontSize: 12 }}>{value}</Text>
            </Box>
          ))}

          {asset.tags.length > 0 && (
            <Box style={{ marginTop: 4 }}>
              <Text fontColor="gray500" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
                Tags
              </Text>
              <Flex style={{ flexWrap: 'wrap', gap: 4 }}>
                {asset.tags.map((tag) => (
                  <Badge key={tag} variant="primary-filled" style={{ fontSize: 9 }}>
                    {tag}
                  </Badge>
                ))}
              </Flex>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

// ── Full-page picker content (rendered in Contentful dialog) ──────────────────

export interface DamPickerContentProps {
  simulatorType?: SimulatorType;
  onSelect: (asset: AssetRecord) => void;
  onClose: () => void;
}

export function DamPickerContent({ simulatorType, onSelect, onClose }: DamPickerContentProps) {
  const headerBg = simulatorType ? BRAND_CONFIG[simulatorType].color : DAM_HEADER;
  const headerLabel = simulatorType
    ? `${BRAND_CONFIG[simulatorType].label} — Media Library`
    : 'Media Library';
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetcher = useCallback(
    () => contentfulCatalogAdapter.getAssets(debouncedSearch || undefined),
    [debouncedSearch],
  );
  const { data: assets, isLoading } = useFakeFetch<AssetRecord[]>(
    fetcher,
    [debouncedSearch],
  );

  const folders = useMemo(
    () => (assets ? deriveFolders(assets) : ['All']),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    if (activeFolder === 'All') return assets;
    return assets.filter((a) => a.folder.startsWith(activeFolder));
  }, [assets, activeFolder]);

  useEffect(() => {
    setActiveFolder('All');
  }, [debouncedSearch]);

  const selectedAsset = assets?.find((a) => a.id === selectedId) ?? null;

  const handleImport = async () => {
    if (!selectedAsset) return;
    setIsImporting(true);
    await new Promise((r) => setTimeout(r, IMPORT_DELAY_MS));
    setIsImporting(false);
    onSelect(selectedAsset);
    onClose();
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Vendor-branded header */}
      <Box
        style={{
          background: headerBg,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* Generic media library icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M4 6h16v2H4zm2-4h12v2H6zm14 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-8 9l-5-3 5-3 5 3-5 3z" />
        </svg>
        <Text
          fontWeight="fontWeightDemiBold"
          style={{ color: '#fff', fontSize: 15, letterSpacing: '0.03em' }}
        >
          {headerLabel}
        </Text>
      </Box>

      {/* Search */}
      <Box style={{ padding: '12px 20px', background: headerBg, flexShrink: 0 }}>
        <TextInput
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search your media library…"
          isDisabled={isLoading}
          style={{ borderRadius: 6 }}
        />
      </Box>

      {/* Folder tabs */}
      {!isLoading && folders.length > 1 && (
        <Box
          style={{
            background: headerBg,
            padding: '8px 20px',
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          {folders.map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => setActiveFolder(folder)}
              style={{
                background: activeFolder === folder ? 'rgba(255,255,255,0.2)' : 'none',
                border:
                  activeFolder === folder
                    ? '1px solid rgba(255,255,255,0.5)'
                    : '1px solid transparent',
                color: '#fff',
                borderRadius: 4,
                padding: '3px 10px',
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {folder}
            </button>
          ))}
        </Box>
      )}

      {/* Content area — grid + optional metadata panel */}
      <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Asset grid */}
        <Box style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          {!isLoading && (
            <Text fontColor="gray600" style={{ fontSize: 12, marginBottom: 12, display: 'block' }}>
              {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
            </Text>
          )}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedId === asset.id}
                    onClick={() => setSelectedId(selectedId === asset.id ? null : asset.id)}
                  />
                ))}
          </Box>
          {!isLoading && filteredAssets.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text fontColor="gray500">No assets found.</Text>
            </Box>
          )}
        </Box>

        {/* Metadata side panel */}
        {selectedAsset && <MetadataPanel asset={selectedAsset} />}
      </Box>

      {/* Footer */}
      <Box
        style={{
          borderTop: '1px solid #CFD9E0',
          padding: '12px 20px',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            {selectedAsset && (
              <Text fontColor="gray600" style={{ fontSize: 13 }}>
                Selected: <strong>{selectedAsset.filename}</strong>
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
              isDisabled={!selectedAsset}
              isLoading={isImporting}
            >
              {isImporting ? 'Importing…' : 'Use Asset'}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
