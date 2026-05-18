'use client';

import {
  Badge,
  Box,
  Button,
  Flex,
  Select,
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
import type { AssetCollection } from './connector-types';
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

function deriveTags(assets: AssetRecord[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const a of assets) {
    for (const t of a.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
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
  onSelect: (result: AssetRecord | AssetRecord[] | AssetCollection) => void;
  onClose: () => void;
  /** 'category' enables folder/tag collection picker and returns AssetCollection. */
  pickerMode?: 'single' | 'category' | 'filtered-category';
}

export function DamPickerContent({ simulatorType, onSelect, onClose, pickerMode = 'single' }: DamPickerContentProps) {
  const multiSelect = pickerMode === 'category';
  const headerBg = simulatorType ? BRAND_CONFIG[simulatorType].color : DAM_HEADER;
  const headerLabel = simulatorType
    ? `${BRAND_CONFIG[simulatorType].label} — Media Library`
    : 'Media Library';
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('upload-date');
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

  const displayFolders = useMemo(
    () => folders.filter((f) => f !== 'All'),
    [folders],
  );

  const tags = useMemo(
    () => (assets ? deriveTags(assets) : []),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    const base = activeFolder === 'All' ? assets : assets.filter((a) => a.folder.startsWith(activeFolder));
    if (sortBy === 'upload-date') return base;
    const sorted = [...base];
    if (sortBy === 'filename') sorted.sort((a, b) => a.filename.localeCompare(b.filename));
    else if (sortBy === 'filetype') sorted.sort((a, b) => (a.fileType ?? '').localeCompare(b.fileType ?? ''));
    else if (sortBy === 'filesize') sorted.sort((a, b) => (a.fileSize ?? '').localeCompare(b.fileSize ?? ''));
    return sorted;
  }, [assets, activeFolder, sortBy]);

  // Deduped assets matching any selected folder or tag (multi mode)
  const multiCollectionAssets = useMemo(() => {
    if (!assets) return [];
    const seen = new Set<string>();
    const result: AssetRecord[] = [];
    for (const a of assets) {
      if (seen.has(a.id)) continue;
      const matchesFolder = [...selectedFolders].some((f) => a.folder.startsWith(f));
      const matchesTag = [...selectedTags].some((t) => a.tags.includes(t));
      if (matchesFolder || matchesTag) {
        seen.add(a.id);
        result.push(a);
      }
    }
    return result;
  }, [assets, selectedFolders, selectedTags]);

  const collectionCount = selectedFolders.size + selectedTags.size;

  const collectionLabel = useMemo(() => {
    const parts: string[] = [...selectedFolders, ...selectedTags];
    return parts.join(', ');
  }, [selectedFolders, selectedTags]);

  useEffect(() => {
    setActiveFolder('All');
  }, [debouncedSearch]);

  // Single mode selection
  const selectedAsset = !multiSelect ? (assets?.find((a) => a.id === selectedId) ?? null) : null;

  const toggleFolder = (folder: string) => {
    setSelectedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const clearMultiSelection = () => {
    setSelectedFolders(new Set());
    setSelectedTags(new Set());
  };

  const handleImport = async () => {
    if (multiSelect) {
      if (multiCollectionAssets.length === 0) return;
      setIsImporting(true);
      await new Promise((r) => setTimeout(r, IMPORT_DELAY_MS));
      setIsImporting(false);
      const collection: AssetCollection = {
        collections: [
          ...[...selectedFolders].map((f) => ({ type: 'folder' as const, key: f })),
          ...[...selectedTags].map((t) => ({ type: 'tag' as const, key: t })),
        ],
        label: collectionLabel,
        items: multiCollectionAssets,
      };
      onSelect(collection);
      onClose();
    } else {
      if (!selectedAsset) return;
      setIsImporting(true);
      await new Promise((r) => setTimeout(r, IMPORT_DELAY_MS));
      setIsImporting(false);
      onSelect(selectedAsset);
      onClose();
    }
  };

  const multiImportLabel = isImporting
    ? 'Importing…'
    : multiCollectionAssets.length === 1
      ? 'Use 1 Asset'
      : `Use ${multiCollectionAssets.length} Assets`;

  // ── Multi mode: folder + tag collection picker ────────────────────────────
  if (multiSelect) {
    const hasSelection = collectionCount > 0;

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

        {/* Breadcrumb bar (when collections selected) */}
        {hasSelection && (
          <Box
            style={{
              background: '#F7F9FA',
              padding: '8px 16px',
              borderBottom: '1px solid #E5EAEF',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={clearMultiSelection}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: '#0059C8',
                padding: 0,
                fontWeight: 600,
              }}
            >
              &larr; Back
            </button>
            <Text fontColor="gray600" style={{ fontSize: 12 }}>
              {collectionLabel}
            </Text>
            <Text fontColor="gray500" style={{ fontSize: 12 }}>
              &middot; {multiCollectionAssets.length} asset{multiCollectionAssets.length !== 1 ? 's' : ''}
            </Text>
          </Box>
        )}

        {/* Main content area */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {isLoading ? (
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </Box>
          ) : hasSelection ? (
            /* Read-only asset preview grid */
            <Box style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {multiCollectionAssets.map((asset) => {
                  const isImage = ['PNG', 'JPEG', 'JPG', 'WEBP', 'GIF', 'SVG'].includes(
                    (asset.fileType ?? '').toUpperCase(),
                  );
                  return (
                    <Box
                      key={asset.id}
                      style={{
                        border: '1px solid #CFD9E0',
                        borderRadius: 8,
                        background: '#fff',
                        overflow: 'hidden',
                      }}
                    >
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
                        <Box style={{ position: 'absolute', top: 6, right: 6 }}>
                          <Badge variant={fileTypeBadge(asset.fileType)} style={{ fontSize: 9 }}>
                            {asset.fileType}
                          </Badge>
                        </Box>
                      </Box>
                      <Box style={{ padding: '6px 8px' }}>
                        <Text style={{ display: 'block', fontSize: 11, fontWeight: 600, lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {asset.filename}
                        </Text>
                        <Text fontColor="gray500" style={{ fontSize: 10 }}>
                          {asset.fileSize}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {multiCollectionAssets.length === 0 && (
                <Box style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text fontColor="gray500">No assets match the selected collections.</Text>
                </Box>
              )}
            </Box>
          ) : (
            /* Default view: folders left, tags right */
            <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* LEFT column: Folders */}
              <Box
                style={{
                  width: 240,
                  flexShrink: 0,
                  borderRight: '1px solid #E5EAEF',
                  padding: 12,
                  overflowY: 'auto',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#68778D',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                    display: 'block',
                  }}
                >
                  FOLDERS
                </Text>
                {displayFolders.map((folder) => {
                  const folderAssets = assets?.filter((a) => a.folder.startsWith(folder)) ?? [];
                  const isSelected = selectedFolders.has(folder);
                  const firstThumb = folderAssets.find((a) => a.thumbnailUrl)?.thumbnailUrl;
                  return (
                    <Box
                      key={folder}
                      as="button"
                      type="button"
                      onClick={() => toggleFolder(folder)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 8,
                        borderRadius: 6,
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        border: 'none',
                        background: isSelected ? '#E8F4FF' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      {/* Folder icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#94A3B8" style={{ flexShrink: 0 }}>
                        <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
                      </svg>
                      <Text style={{ fontSize: 12, flex: 1 }}>{folder}</Text>
                      <Text fontColor="gray500" style={{ fontSize: 11 }}>({folderAssets.length})</Text>
                      {firstThumb && (
                        <Box
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 3,
                            overflow: 'hidden',
                            flexShrink: 0,
                            marginLeft: 'auto',
                          }}
                        >
                          <img
                            src={firstThumb}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </Box>
                      )}
                      {isSelected && (
                        <Box
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#0090FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          ✓
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* RIGHT column: Tags */}
              <Box style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#68778D',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                    display: 'block',
                  }}
                >
                  TAGS
                </Text>
                <Flex style={{ flexWrap: 'wrap', gap: 6 }}>
                  {tags.map(({ tag, count }) => {
                    const isSelected = selectedTags.has(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        style={{
                          background: isSelected ? '#0059C8' : '#EEF0F2',
                          color: isSelected ? '#fff' : '#404852',
                          borderRadius: 12,
                          padding: '4px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'background 0.1s, color 0.1s',
                        }}
                      >
                        {tag} ({count})
                      </button>
                    );
                  })}
                </Flex>
                {tags.length === 0 && (
                  <Text fontColor="gray500" style={{ fontSize: 12 }}>No tags found.</Text>
                )}
              </Box>
            </Box>
          )}
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
            <Text fontColor="gray600" style={{ fontSize: 12 }}>
              {collectionCount > 0
                ? `${collectionCount} collection${collectionCount !== 1 ? 's' : ''} · ${multiCollectionAssets.length} asset${multiCollectionAssets.length !== 1 ? 's' : ''}`
                : ''}
            </Text>
            <Flex gap="spacingS">
              <Button variant="secondary" onClick={onClose} isDisabled={isImporting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                isDisabled={collectionCount === 0}
                isLoading={isImporting}
              >
                {multiImportLabel}
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>
    );
  }

  // ── Single mode (unchanged) ───────────────────────────────────────────────
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
            <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 12 }}>
              <Text fontColor="gray600" style={{ fontSize: 12 }}>
                {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
              </Text>
            </Flex>
          )}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedId === asset.id}
                    onClick={() => setSelectedId((prev) => (prev === asset.id ? null : asset.id))}
                  />
                ))}
          </Box>
          {!isLoading && filteredAssets.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text fontColor="gray500">No assets found.</Text>
            </Box>
          )}
        </Box>

        {/* Metadata side panel — single mode only */}
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
