'use client';

import {
  Badge,
  Box,
  Button,
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
} from '@contentful/f36-icons';
import React, { useState } from 'react';

// ── Brand config ───────────────────────────────────────────────────────────────

type DamType = 'BYNDER' | 'ADOBE' | 'BRANDFOLDER';

const BRAND_CONFIG: Record<DamType, { label: string; color: string; textColor: string }> = {
  BYNDER:      { label: 'Bynder',           color: '#00A1E4', textColor: '#fff' },
  ADOBE:       { label: 'Adobe AEM Assets', color: '#FA0F00', textColor: '#fff' },
  BRANDFOLDER: { label: 'Brandfolder',      color: '#0033CC', textColor: '#fff' },
};

const DAM_TYPES: DamType[] = ['BYNDER', 'ADOBE', 'BRANDFOLDER'];

// ── Mock data ──────────────────────────────────────────────────────────────────

type FileType = 'PNG' | 'JPEG' | 'SVG' | 'MP4' | 'PDF' | 'WEBP';

type MockAsset = {
  id: string;
  filename: string;
  title: string;
  fileType: FileType;
  fileSize: string;
  dimensions: { width: number; height: number } | null;
  folder: string;
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  thumbnailUrl: string;
};

const MOCK_ASSETS: MockAsset[] = [
  {
    id: '1', filename: 'hero-banner-q1.png', title: 'Hero Banner Q1',
    fileType: 'PNG', fileSize: '2.4 MB', dimensions: { width: 2400, height: 1350 },
    folder: 'Marketing/Campaigns', tags: ['hero', 'brand', 'homepage'],
    uploadedAt: '2025-01-15', uploadedBy: 'design-team',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=320&q=80',
  },
  {
    id: '2', filename: 'brand-logo-horizontal.svg', title: 'Logo — Horizontal',
    fileType: 'SVG', fileSize: '48 KB', dimensions: { width: 1200, height: 400 },
    folder: 'Brand/Logos', tags: ['logo', 'brand'],
    uploadedAt: '2024-06-01', uploadedBy: 'brand-team',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=320&q=80',
  },
  {
    id: '3', filename: 'webinar-thumb-apr.png', title: 'Webinar Thumbnail April',
    fileType: 'PNG', fileSize: '1.1 MB', dimensions: { width: 1920, height: 1080 },
    folder: 'Events/Webinars', tags: ['webinar', 'thumbnail'],
    uploadedAt: '2025-03-28', uploadedBy: 'marketing-ops',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=320&q=80',
  },
  {
    id: '4', filename: 'product-keyboard-lifestyle.jpg', title: 'Keyboard Lifestyle Shot',
    fileType: 'JPEG', fileSize: '3.8 MB', dimensions: { width: 3000, height: 2000 },
    folder: 'Product/Photography', tags: ['product', 'photography'],
    uploadedAt: '2025-02-10', uploadedBy: 'studio-team',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=320&q=80',
  },
  {
    id: '5', filename: 'brand-overview.pdf', title: 'Brand Overview Deck',
    fileType: 'PDF', fileSize: '8.2 MB', dimensions: null,
    folder: 'Brand/Guidelines', tags: ['brand', 'guidelines', 'pdf'],
    uploadedAt: '2025-01-05', uploadedBy: 'brand-team',
    thumbnailUrl: '',
  },
  {
    id: '6', filename: 'product-demo-video.mp4', title: 'Product Demo Video',
    fileType: 'MP4', fileSize: '42 MB', dimensions: { width: 1920, height: 1080 },
    folder: 'Video/Demos', tags: ['video', 'demo', 'product'],
    uploadedAt: '2025-02-22', uploadedBy: 'video-team',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=320&q=80',
  },
];

const FILLED_ASSET = MOCK_ASSETS[0]; // hero-banner-q1.png

// ── Helpers ────────────────────────────────────────────────────────────────────

const IMAGE_TYPES: FileType[] = ['PNG', 'JPEG', 'WEBP', 'SVG'];

function isImage(a: MockAsset) {
  return IMAGE_TYPES.includes(a.fileType);
}

function fileTypeBadgeVariant(ft: FileType): 'positive' | 'secondary' | 'warning' | 'negative' {
  if (['PNG', 'JPEG', 'WEBP'].includes(ft)) return 'positive';
  if (['SVG', 'PDF'].includes(ft)) return 'secondary';
  if (ft === 'MP4') return 'warning';
  return 'negative';
}

// ── File type icon SVGs ────────────────────────────────────────────────────────

function FileTypeIcon({ fileType }: { fileType: FileType }) {
  if (fileType === 'MP4') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#94A3B8">
        <path d="M15 10l4.553-2.277A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14v-4zm-2-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      </svg>
    );
  }
  if (fileType === 'PDF') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#94A3B8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm2-5V3.5L18.5 9H15z" />
      </svg>
    );
  }
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#94A3B8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
    </svg>
  );
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

function BrandPill({ brand }: { brand: DamType }) {
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

function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      style={{
        maxWidth: 672, background: '#fff',
        border: '1px solid #CFD9E0', borderRadius: 6, overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

// ── 1. Loading state ───────────────────────────────────────────────────────────

function LoadingState({ brand }: { brand: DamType }) {
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
      <Flex alignItems="center" justifyContent="center" style={{ padding: '28px 24px', gap: 10 }}>
        <Spinner size="medium" style={{ color: cfg.color }} />
        <Text style={{ fontSize: 13, color: '#6B7585' }}>Loading asset…</Text>
      </Flex>
    </FieldCard>
  );
}

// ── 2. Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ brand }: { brand: DamType }) {
  const cfg = BRAND_CONFIG[brand];

  // DAM icon — generic media/image SVG
  const DamIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#8895A7">
      <path d="M4 6h16v2H4zm2-4h12v2H6zm14 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-8 9l-5-3 5-3 5 3-5 3z" />
    </svg>
  );

  return (
    <FieldCard>
      <Flex flexDirection="column" alignItems="center" style={{ padding: '32px 24px', gap: 12, textAlign: 'center' }}>
        <Box
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#F0F4F8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <DamIcon />
        </Box>
        <Box>
          <Text fontWeight="fontWeightDemiBold" style={{ display: 'block', fontSize: 14, color: '#2A3039', marginBottom: 4 }}>
            No asset linked
          </Text>
          <Paragraph style={{ fontSize: 13, color: '#6B7585', margin: 0, lineHeight: '1.5' }}>
            Browse your {cfg.label} library to connect a file to this entry
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
          Link asset
        </button>
      </Flex>
    </FieldCard>
  );
}

// ── 3. Filled state ────────────────────────────────────────────────────────────

function FilledState({ brand }: { brand: DamType }) {
  const a = FILLED_ASSET;

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
        <Text style={{ fontSize: 11, color: '#8895A7' }}>1 asset linked</Text>
      </Box>

      {/* Asset row with thumbnail */}
      <Flex style={{ padding: 14, gap: 14, alignItems: 'flex-start' }}>
        {/* Thumbnail */}
        <Box
          style={{
            width: 100, height: 100, flexShrink: 0,
            border: '1px solid #E5EAEF', borderRadius: 4,
            background: '#F7F9FA', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isImage(a) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.thumbnailUrl}
              alt={a.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <FileTypeIcon fileType={a.fileType} />
          )}
        </Box>

        {/* Metadata */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fontWeight="fontWeightDemiBold" style={{ display: 'block', fontSize: 14, color: '#2A3039', marginBottom: 8 }}>
            {a.title}
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              ['File', <span key="file" style={{ fontFamily: 'monospace', fontSize: 11, background: '#F0F4F8', padding: '1px 5px', borderRadius: 2 }}>{a.filename}</span>],
              ['Type', <Badge key="type" variant={fileTypeBadgeVariant(a.fileType)} style={{ fontSize: 10 }}>{a.fileType}</Badge>],
              ['Size', <Text key="size" style={{ fontSize: 12, color: '#2A3039' }}>{a.fileSize}</Text>],
              ...(a.dimensions ? [['Dimensions', <Text key="dim" style={{ fontSize: 12, color: '#2A3039' }}>{a.dimensions.width} × {a.dimensions.height}</Text>]] : []),
              ['Folder', <Text key="folder" style={{ fontSize: 12, color: '#2A3039' }}>{a.folder}</Text>],
              ['Uploaded', <Text key="up" style={{ fontSize: 12, color: '#2A3039' }}>{a.uploadedAt} · {a.uploadedBy}</Text>],
            ].map(([label, value]) => (
              <Flex key={String(label)} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: '#8895A7', width: 72, flexShrink: 0 }}>{label}</Text>
                {value}
              </Flex>
            ))}
          </Box>
          {a.tags.length > 0 && (
            <Flex style={{ flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {a.tags.map((tag) => (
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

// ── 4. Picker modal ────────────────────────────────────────────────────────────

const HEADER_H = 42;
const TOOLBAR_H = 52;
const FOLDER_H = 40;
const RESULT_H = 28;
const FOOTER_H = 52;
const DETAIL_W = 230;

function PickerModal({ brand }: { brand: DamType }) {
  const cfg = BRAND_CONFIG[brand];
  const [selectedId, setSelectedId] = useState<string>('1');
  const [activeFolder, setActiveFolder] = useState('All');

  const folders = ['All', 'Brand', 'Marketing', 'Events', 'Product', 'Video'];
  const selected = MOCK_ASSETS.find((a) => a.id === selectedId);

  const visibleAssets = activeFolder === 'All'
    ? MOCK_ASSETS
    : MOCK_ASSETS.filter((a) => a.folder.startsWith(activeFolder));

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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M4 6h16v2H4zm2-4h12v2H6zm14 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-8 9l-5-3 5-3 5 3-5 3z" />
        </svg>
        <Text fontWeight="fontWeightDemiBold" style={{ color: cfg.textColor, fontSize: 13, letterSpacing: '0.02em' }}>
          {cfg.label} — Media Library
        </Text>
      </Box>

      {/* Body */}
      <Flex style={{ flex: 1, overflow: 'hidden' }}>

        {/* Left: search + folders + grid + footer */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Search toolbar */}
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
                aria-label="Search assets"
                placeholder="Search your media library…"
                style={{ paddingLeft: 30, width: '100%' }}
              />
            </Box>
            <Select aria-label="File type filter" style={{ width: 140 }}>
              <Select.Option value="all">All file types</Select.Option>
              <Select.Option value="image">Images (PNG, JPEG)</Select.Option>
              <Select.Option value="svg">SVG</Select.Option>
              <Select.Option value="video">Video (MP4)</Select.Option>
              <Select.Option value="pdf">PDF</Select.Option>
            </Select>
          </Box>

          {/* Folder tabs */}
          <Box
            style={{
              height: FOLDER_H, padding: '0 14px', flexShrink: 0,
              borderBottom: '1px solid #E5EAEF',
              display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto',
            }}
          >
            {folders.map((folder) => {
              const isActive = folder === activeFolder;
              return (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  style={{
                    padding: '3px 10px', borderRadius: 4, whiteSpace: 'nowrap',
                    background: isActive ? cfg.color : 'transparent',
                    border: `1px solid ${isActive ? cfg.color : '#CFD9E0'}`,
                    color: isActive ? cfg.textColor : '#6B7585',
                    fontSize: 12, fontWeight: isActive ? 700 : 400, cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {folder}
                </button>
              );
            })}
          </Box>

          {/* Result count */}
          <Box
            style={{
              height: RESULT_H, padding: '0 14px', flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 11, color: '#8895A7' }}>
              {visibleAssets.length} asset{visibleAssets.length !== 1 ? 's' : ''}
            </Text>
          </Box>

          {/* Asset grid — 5 columns, no scroll */}
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
            {visibleAssets.map((asset) => {
              const isSel = asset.id === selectedId;
              return (
                <Box
                  key={asset.id}
                  as="button"
                  type="button"
                  onClick={() => setSelectedId(asset.id)}
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
                      position: 'relative', width: '100%', aspectRatio: '4/3',
                      background: '#F0F4F8', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isImage(asset) && asset.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FileTypeIcon fileType={asset.fileType} />
                    )}

                    {/* File type badge */}
                    <Box style={{ position: 'absolute', top: 4, right: 4 }}>
                      <Badge variant={fileTypeBadgeVariant(asset.fileType)} style={{ fontSize: 9 }}>
                        {asset.fileType}
                      </Badge>
                    </Box>

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
                      {asset.filename}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#8895A7' }}>
                      {asset.fileSize}
                      {asset.dimensions ? ` · ${asset.dimensions.width}×${asset.dimensions.height}` : ''}
                    </Text>
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
                  Selected: <strong style={{ color: '#2A3039' }}>{selected.filename}</strong>
                  <span style={{ fontSize: 11, marginLeft: 6, color: '#8895A7' }}>{selected.fileSize}</span>
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
                Use asset
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
            {/* Preview */}
            <Box
              style={{
                width: '100%', aspectRatio: '4/3',
                background: '#E5EAEF', overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isImage(selected) && selected.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.thumbnailUrl}
                  alt={selected.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <FileTypeIcon fileType={selected.fileType} />
              )}
            </Box>

            {/* Metadata */}
            <Box
              style={{
                padding: '12px 14px', display: 'flex', flexDirection: 'column',
                gap: 8, overflow: 'hidden',
              }}
            >
              <Text fontWeight="fontWeightDemiBold" style={{ fontSize: 13, color: '#2A3039', lineHeight: '1.3' }}>
                {selected.title}
              </Text>

              <Box style={{ borderTop: '1px solid #E5EAEF', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Type', <Badge key="type" variant={fileTypeBadgeVariant(selected.fileType)} style={{ fontSize: 10 }}>{selected.fileType}</Badge>],
                  ['Size', <Text key="size" style={{ fontSize: 12, color: '#2A3039' }}>{selected.fileSize}</Text>],
                  ...(selected.dimensions ? [['Dims', <Text key="dims" style={{ fontSize: 12, color: '#2A3039' }}>{selected.dimensions.width} × {selected.dimensions.height}</Text>]] : []),
                  ['Folder', <Text key="folder" style={{ fontSize: 12, color: '#2A3039', wordBreak: 'break-word' as const }}>{selected.folder}</Text>],
                  ['By', <Text key="by" style={{ fontSize: 12, color: '#2A3039' }}>{selected.uploadedBy}</Text>],
                ].map(([label, value]) => (
                  <Flex key={String(label)} style={{ gap: 6, alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 10, color: '#8895A7', width: 44, flexShrink: 0, paddingTop: 1 }}>{label}</Text>
                    {value}
                  </Flex>
                ))}

                {selected.tags.length > 0 && (
                  <Flex style={{ gap: 6 }}>
                    <Text style={{ fontSize: 10, color: '#8895A7', width: 44, flexShrink: 0, paddingTop: 2 }}>Tags</Text>
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
                Use asset
              </button>
            </Box>
          </Box>
        )}
      </Flex>
    </Box>
  );
}

// ── Brand switcher ─────────────────────────────────────────────────────────────

function BrandSwitcher({ active, onChange }: { active: DamType; onChange: (b: DamType) => void }) {
  return (
    <Flex style={{ gap: 8 }}>
      {DAM_TYPES.map((brand) => {
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

export default function DamPickerMockupPage() {
  const [activeBrand, setActiveBrand] = useState<DamType>('BYNDER');

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
          <Text fontWeight="fontWeightDemiBold" style={{ display: 'block', fontSize: 22, color: '#2A3039', marginBottom: 6 }}>
            DAM Picker — Improved UI
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7585' }}>
            Forma-36 component patterns · Design review mockup
          </Text>
        </Box>

        {/* Brand switcher */}
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
