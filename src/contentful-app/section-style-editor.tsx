'use client';

import { AlignCenter, AlignLeft, AlignRight, ChevronDown, LayoutGrid, Palette, Type } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type {
  SectionStyleConfig,
  SectionStyleSpacing,
  SectionStyleTextAlign,
  SectionStyleTile,
  SectionStyleTileId,
} from '@/lib/section-style-types';
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_GRID_ROWS,
  DEFAULT_SECTION_STYLE_CONFIG,
  getDefaultTiles,
  parseSectionStyle,
} from '@/lib/section-style-types';
import { cn } from '@/lib/utils';

import { SectionGridCanvas } from './section-grid-canvas';

const SECTION_STYLE_FIELD_ID = 'sectionStyle';
const SECTION_STYLE_UPDATED_AT_FIELD_ID = 'sectionStyleUpdatedAt';
const BACKGROUND_FIELD_ID = 'background';

/** Token names that map to app CSS vars (from globals.css) */
const COLOR_TOKEN_OPTIONS = [
  { name: 'primary', var: 'var(--primary)' },
  { name: 'secondary', var: 'var(--secondary)' },
  { name: 'muted', var: 'var(--muted)' },
  { name: 'background', var: 'var(--background)' },
  { name: 'accent', var: 'var(--accent)' },
] as const;

type SdkField = {
  getValue: () => unknown;
  setValue: (v: unknown) => Promise<void>;
};

type SdkEntry = {
  fields: Record<string, SdkField>;
};

function getFieldFromSdk(
  sdk: {
    field?: SdkField;
    entry?: SdkEntry;
  },
  isEntryField: boolean,
): SdkField | null {
  if (isEntryField && sdk?.field) return sdk.field;
  const entryFields = sdk?.entry?.fields;
  if (entryFields && SECTION_STYLE_FIELD_ID in entryFields) {
    return entryFields[SECTION_STYLE_FIELD_ID];
  }
  return null;
}

/** Get the timestamp field used to trigger live preview updates */
function getTimestampFieldFromSdk(sdk: { entry?: SdkEntry }): SdkField | null {
  const entryFields = sdk?.entry?.fields;
  if (entryFields && SECTION_STYLE_UPDATED_AT_FIELD_ID in entryFields) {
    return entryFields[SECTION_STYLE_UPDATED_AT_FIELD_ID];
  }
  return null;
}

/** Check if entry has a background asset field with a value */
async function checkHasBackgroundAsset(sdk: {
  entry?: SdkEntry;
}): Promise<boolean> {
  const bgField = sdk?.entry?.fields?.[BACKGROUND_FIELD_ID];
  if (!bgField) return false;
  try {
    const value = await Promise.resolve(bgField.getValue());
    return value != null && value !== '';
  } catch {
    return false;
  }
}

export function SectionStyleEditor({
  sdk,
  isEntryField,
}: {
  sdk: unknown;
  isEntryField: boolean;
}) {
  const typedSdk = sdk as {
    field?: SdkField;
    entry?: SdkEntry;
    app?: { setReady: () => Promise<void> };
  };
  const field = getFieldFromSdk(typedSdk, isEntryField);
  const timestampField = getTimestampFieldFromSdk(typedSdk);
  const [config, setConfig] = useState<SectionStyleConfig>(() => ({
    ...DEFAULT_SECTION_STYLE_CONFIG,
  }));
  const [showBackground, setShowBackground] = useState(true);
  const [showLayout, setShowLayout] = useState(true);
  const [showContentStyle, setShowContentStyle] = useState(true);
  const [showButtonStyle, setShowButtonStyle] = useState(true);
  const [ready, setReady] = useState(false);
  const [hasBackgroundAsset, setHasBackgroundAsset] = useState(false);

  const persist = useCallback(
    (next: SectionStyleConfig) => {
      if (!field) return;
      // Contentful JSON field expects type Object; pass the object, not a string.
      field.setValue(next).catch(() => {});

      // Update timestamp field to trigger live preview refresh
      // This is necessary because Contentful's Live Preview SDK doesn't detect JSON field changes
      if (timestampField) {
        timestampField.setValue(Date.now()).catch(() => {});
      }
    },
    [field, timestampField],
  );

  // Check if entry has a background asset
  useEffect(() => {
    checkHasBackgroundAsset(typedSdk).then(setHasBackgroundAsset);
  }, [typedSdk]);

  // Load initial field value
  useEffect(() => {
    if (!field) {
      setReady(true);
      return;
    }
    Promise.resolve(field.getValue())
      .then((raw) => {
        if (raw == null || raw === '') {
          const defaultConfig = { ...DEFAULT_SECTION_STYLE_CONFIG };
          setConfig(defaultConfig);
          field.setValue(defaultConfig).catch(() => {});
          return;
        }
        const str =
          typeof raw === 'string' ? raw : JSON.stringify(raw as object);
        const parsed = parseSectionStyle(str);
        setConfig(parsed);
        // If field held a string (e.g. from an older app version), persist object so Contentful validation passes.
        if (typeof raw === 'string') {
          field.setValue(parsed).catch(() => {});
        }
      })
      .catch(() => {
        const defaultConfig = { ...DEFAULT_SECTION_STYLE_CONFIG };
        setConfig(defaultConfig);
        field.setValue(defaultConfig).catch(() => {});
      })
      .finally(() => setReady(true));
  }, [field]);

  const update = useCallback(
    (patch: Partial<SectionStyleConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  // Handle switching to Custom Grid
  const switchToCustomGrid = useCallback(() => {
    setConfig((prev) => {
      // Preserve existing tiles if set, otherwise use defaults
      const tiles = prev.tiles ?? getDefaultTiles(hasBackgroundAsset);
      const next: SectionStyleConfig = {
        ...prev,
        layout: 'customGrid',
        gridColumns: prev.gridColumns ?? DEFAULT_GRID_COLUMNS,
        gridRows: prev.gridRows ?? DEFAULT_GRID_ROWS,
        tiles,
      };
      persist(next);
      return next;
    });
  }, [hasBackgroundAsset, persist]);

  // Handle tile changes from grid canvas
  const handleTilesChange = useCallback(
    (tiles: SectionStyleTile[]) => {
      update({ tiles });
    },
    [update],
  );

  // Handle grid rows change
  const handleGridRowsChange = useCallback(
    (rows: number) => {
      update({ gridRows: rows });
    },
    [update],
  );

  // Toggle tile visibility
  const toggleTileVisibility = useCallback(
    (tileId: SectionStyleTileId) => {
      setConfig((prev) => {
        const tiles = prev.tiles ?? getDefaultTiles(hasBackgroundAsset);
        const updatedTiles = tiles.map((t) =>
          t.id === tileId
            ? { ...t, visible: t.visible === false ? true : false }
            : t,
        );
        const next = { ...prev, tiles: updatedTiles };
        persist(next);
        return next;
      });
    },
    [hasBackgroundAsset, persist],
  );

  useEffect(() => {
    if (ready && typedSdk?.app?.setReady) {
      typedSdk.app.setReady().catch(() => {});
    }
  }, [ready, typedSdk]);

  if (!ready) {
    return (
      <div
        className="flex min-h-[200px] items-center justify-center p-4"
        style={{ color: 'var(--gray-600)' }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4 p-0"
      style={{
        color: 'var(--gray-800)',
        fontFamily: 'var(--font-stack-primary, inherit)',
        fontSize: 'var(--font-size-m, 14px)',
      }}
    >
      <div
        className="flex items-center justify-between gap-4 rounded-[var(--border-radius-medium)] border p-3"
        style={{
          backgroundColor: 'var(--gray-100)',
          borderColor: 'var(--gray-300)',
        }}
      >
        <Label
          htmlFor="use-style-override"
          className="font-medium"
          style={{ fontSize: 'var(--font-size-m)', color: 'var(--gray-800)' }}
        >
          Use style override
        </Label>
        <Switch
          id="use-style-override"
          checked={config.useStyleOverride}
          onCheckedChange={(checked) =>
            update({ useStyleOverride: Boolean(checked) })
          }
        />
      </div>

      {/* Layout section - only show when style override is enabled */}
      {config.useStyleOverride && (
        <Collapsible open={showLayout} onOpenChange={setShowLayout}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between rounded-[var(--border-radius-medium)] border-[var(--gray-300)] bg-[var(--gray-100)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-200)]"
              type="button"
            >
              <span className="flex items-center gap-2">
                <LayoutGrid
                  className="h-4 w-4"
                  style={{ color: 'var(--gray-600)' }}
                />
                Layout / tile grid
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showLayout && 'rotate-180',
                )}
                style={{ color: 'var(--gray-600)' }}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent
            className="mt-2 space-y-3 rounded-[var(--border-radius-medium)] border p-3"
            style={{
              backgroundColor: 'var(--gray-100)',
              borderColor: 'var(--gray-200)',
            }}
          >
            <div
              className="text-xs font-medium"
              style={{ color: 'var(--gray-600)' }}
            >
              Overlay
            </div>
            <div className="flex flex-wrap gap-2">
              {(['center', 'left', 'right'] as const).map((pos) => {
                const isSelected =
                  config.layout === 'overlay' && config.contentPosition === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    className={cn(
                      'rounded-[var(--border-radius-small)] border px-3 py-1.5 text-sm font-medium transition-colors',
                      isSelected
                        ? 'border-[var(--blue-500)] bg-[var(--blue-500)] text-white hover:bg-[var(--blue-600)]'
                        : 'border-[var(--gray-300)] bg-white text-[var(--gray-700)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-100)]',
                    )}
                    onClick={() =>
                      update({ layout: 'overlay', contentPosition: pos })
                    }
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
            <div
              className="text-xs font-medium"
              style={{ color: 'var(--gray-600)' }}
            >
              Split
            </div>
            <div className="flex flex-wrap gap-2">
              {(['50%', '33%'] as const).map((width) => {
                const isSelected =
                  config.layout === 'split' && config.contentWidth === width;
                return (
                  <button
                    key={width}
                    type="button"
                    className={cn(
                      'rounded-[var(--border-radius-small)] border px-3 py-1.5 text-sm font-medium transition-colors',
                      isSelected
                        ? 'border-[var(--blue-500)] bg-[var(--blue-500)] text-white hover:bg-[var(--blue-600)]'
                        : 'border-[var(--gray-300)] bg-white text-[var(--gray-700)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-100)]',
                    )}
                    onClick={() =>
                      update({ layout: 'split', contentWidth: width })
                    }
                  >
                    Content {width}
                  </button>
                );
              })}
            </div>

            {/* Custom Grid preset */}
            <div
              className="text-xs font-medium"
              style={{ color: 'var(--gray-600)' }}
            >
              Custom Grid
            </div>
            <button
              type="button"
              className={cn(
                'w-full rounded-[var(--border-radius-small)] border px-3 py-2 text-sm font-medium transition-colors',
                config.layout === 'customGrid'
                  ? 'border-[var(--blue-500)] bg-[var(--blue-500)] text-white hover:bg-[var(--blue-600)]'
                  : 'border-[var(--gray-300)] bg-white text-[var(--gray-700)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-100)]',
              )}
              onClick={switchToCustomGrid}
            >
              Drag and resize tiles
            </button>

            {/* Custom Grid controls (shown when customGrid is selected) */}
            {config.layout === 'customGrid' && (
              <div className="space-y-3 pt-2">
                {/* Tile visibility checkboxes */}
                <div
                  className="flex flex-wrap items-center gap-3 rounded-[var(--border-radius-small)] p-2"
                  style={{ backgroundColor: 'var(--gray-200)' }}
                >
                  {(['content', 'media'] as const).map((tileId) => {
                    const tile = config.tiles?.find((t) => t.id === tileId);
                    const isVisible = tile?.visible !== false;
                    return (
                      <label
                        key={tileId}
                        className="flex cursor-pointer items-center gap-1.5 text-xs font-medium"
                        style={{ color: 'var(--gray-700)' }}
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleTileVisibility(tileId)}
                          className="accent-[var(--blue-500)]"
                        />
                        {tileId.charAt(0).toUpperCase() + tileId.slice(1)}
                      </label>
                    );
                  })}
                  {hasBackgroundAsset && (
                    <label
                      className="flex cursor-pointer items-center gap-1.5 text-xs font-medium"
                      style={{ color: 'var(--gray-700)' }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          config.tiles?.find((t) => t.id === 'background')
                            ?.visible !== false
                        }
                        onChange={() => toggleTileVisibility('background')}
                        className="accent-[var(--blue-500)]"
                      />
                      Background
                    </label>
                  )}
                </div>

                {/* Grid canvas */}
                <SectionGridCanvas
                  tiles={config.tiles ?? getDefaultTiles(hasBackgroundAsset)}
                  gridColumns={config.gridColumns ?? DEFAULT_GRID_COLUMNS}
                  gridRows={config.gridRows ?? DEFAULT_GRID_ROWS}
                  onTilesChange={handleTilesChange}
                  onGridRowsChange={handleGridRowsChange}
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Content Style section */}
      {config.useStyleOverride && (
        <Collapsible open={showContentStyle} onOpenChange={setShowContentStyle}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between rounded-[var(--border-radius-medium)] border-[var(--gray-300)] bg-[var(--gray-100)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-200)]"
              type="button"
            >
              <span className="flex items-center gap-2">
                <Type className="h-4 w-4" style={{ color: 'var(--gray-600)' }} />
                Content Style
              </span>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', showContentStyle && 'rotate-180')}
                style={{ color: 'var(--gray-600)' }}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent
            className="mt-2 space-y-4 rounded-[var(--border-radius-medium)] border p-3"
            style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--gray-200)' }}
          >
            {/* Text alignment */}
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Text alignment
              </Label>
              <div className="mt-1 flex gap-2">
                {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as [SectionStyleTextAlign, React.ElementType][]).map(([val, Icon]) => (
                  <button
                    key={val}
                    type="button"
                    title={val}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-[var(--border-radius-small)] border transition-colors',
                      config.textAlign === val
                        ? 'border-[var(--blue-500)] bg-[var(--blue-500)] text-white'
                        : 'border-[var(--gray-300)] bg-white text-[var(--gray-700)] hover:border-[var(--gray-400)]',
                    )}
                    onClick={() => update({ textAlign: val })}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            {/* Spacing */}
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Spacing
              </Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {(['sm', 'md', 'lg', 'xl'] as SectionStyleSpacing[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={cn(
                      'rounded-[var(--border-radius-small)] border px-3 py-1.5 text-sm font-medium transition-colors',
                      config.contentSpacing === s
                        ? 'border-[var(--blue-500)] bg-[var(--blue-500)] text-white'
                        : 'border-[var(--gray-300)] bg-white text-[var(--gray-700)] hover:border-[var(--gray-400)]',
                    )}
                    onClick={() => update({ contentSpacing: s })}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {/* Headline color */}
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Headline color
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_TOKEN_OPTIONS.map(({ name, var: cssVar }) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    className={cn(
                      'h-8 w-8 rounded-[var(--border-radius-small)] border-2 transition-all',
                      config.headlineColor === cssVar || config.headlineColor === name
                        ? 'border-[var(--blue-500)] ring-2 ring-[var(--blue-200)]'
                        : 'border-[var(--gray-300)] hover:border-[var(--gray-500)]',
                    )}
                    style={{ backgroundColor: `var(--${name})` }}
                    onClick={() => update({ headlineColor: cssVar })}
                  />
                ))}
              </div>
            </div>
            {/* Subheadline color */}
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Subheadline color
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_TOKEN_OPTIONS.map(({ name, var: cssVar }) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    className={cn(
                      'h-8 w-8 rounded-[var(--border-radius-small)] border-2 transition-all',
                      config.subheadlineColor === cssVar || config.subheadlineColor === name
                        ? 'border-[var(--blue-500)] ring-2 ring-[var(--blue-200)]'
                        : 'border-[var(--gray-300)] hover:border-[var(--gray-500)]',
                    )}
                    style={{ backgroundColor: `var(--${name})` }}
                    onClick={() => update({ subheadlineColor: cssVar })}
                  />
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Button Style section */}
      {config.useStyleOverride && (
        <Collapsible open={showButtonStyle} onOpenChange={setShowButtonStyle}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between rounded-[var(--border-radius-medium)] border-[var(--gray-300)] bg-[var(--gray-100)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-200)]"
              type="button"
            >
              <span className="flex items-center gap-2">
                <Palette className="h-4 w-4" style={{ color: 'var(--gray-600)' }} />
                Button Style
              </span>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', showButtonStyle && 'rotate-180')}
                style={{ color: 'var(--gray-600)' }}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent
            className="mt-2 space-y-4 rounded-[var(--border-radius-medium)] border p-3"
            style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--gray-200)' }}
          >
            {/* Button bg color */}
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Button background color
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_TOKEN_OPTIONS.map(({ name, var: cssVar }) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    className={cn(
                      'h-8 w-8 rounded-[var(--border-radius-small)] border-2 transition-all',
                      config.buttonBgColor === cssVar || config.buttonBgColor === name
                        ? 'border-[var(--blue-500)] ring-2 ring-[var(--blue-200)]'
                        : 'border-[var(--gray-300)] hover:border-[var(--gray-500)]',
                    )}
                    style={{ backgroundColor: `var(--${name})` }}
                    onClick={() => update({ buttonBgColor: cssVar })}
                  />
                ))}
              </div>
            </div>
            {/* Button hover color */}
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Button hover color
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_TOKEN_OPTIONS.map(({ name, var: cssVar }) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    className={cn(
                      'h-8 w-8 rounded-[var(--border-radius-small)] border-2 transition-all',
                      config.buttonHoverColor === cssVar || config.buttonHoverColor === name
                        ? 'border-[var(--blue-500)] ring-2 ring-[var(--blue-200)]'
                        : 'border-[var(--gray-300)] hover:border-[var(--gray-500)]',
                    )}
                    style={{ backgroundColor: `var(--${name})` }}
                    onClick={() => update({ buttonHoverColor: cssVar })}
                  />
                ))}
              </div>
            </div>
            {/* Button spacing */}
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Button spacing
              </Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {(['sm', 'md', 'lg', 'xl'] as SectionStyleSpacing[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={cn(
                      'rounded-[var(--border-radius-small)] border px-3 py-1.5 text-sm font-medium transition-colors',
                      config.buttonSpacing === s
                        ? 'border-[var(--blue-500)] bg-[var(--blue-500)] text-white'
                        : 'border-[var(--gray-300)] bg-white text-[var(--gray-700)] hover:border-[var(--gray-400)]',
                    )}
                    onClick={() => update({ buttonSpacing: s })}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {/* Button placement */}
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Button placement
              </Label>
              <div className="mt-1 flex gap-2">
                {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as [SectionStyleTextAlign, React.ElementType][]).map(([val, Icon]) => (
                  <button
                    key={val}
                    type="button"
                    title={val}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-[var(--border-radius-small)] border transition-colors',
                      config.buttonPlacement === val
                        ? 'border-[var(--blue-500)] bg-[var(--blue-500)] text-white'
                        : 'border-[var(--gray-300)] bg-white text-[var(--gray-700)] hover:border-[var(--gray-400)]',
                    )}
                    onClick={() => update({ buttonPlacement: val })}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Background section - only show when style override is enabled */}
      {config.useStyleOverride && (
        <Collapsible open={showBackground} onOpenChange={setShowBackground}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between rounded-[var(--border-radius-medium)] border-[var(--gray-300)] bg-[var(--gray-100)] hover:border-[var(--gray-400)] hover:bg-[var(--gray-200)]"
              type="button"
            >
              <span className="flex items-center gap-2">
                <Palette
                  className="h-4 w-4"
                  style={{ color: 'var(--gray-600)' }}
                />
                Background
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showBackground && 'rotate-180',
                )}
                style={{ color: 'var(--gray-600)' }}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent
            className="mt-2 space-y-4 rounded-[var(--border-radius-medium)] border p-3"
            style={{
              backgroundColor: 'var(--gray-100)',
              borderColor: 'var(--gray-200)',
            }}
          >
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Image blur
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={
                    config.imageBlur ?? DEFAULT_SECTION_STYLE_CONFIG.imageBlur
                  }
                  onChange={(e) =>
                    update({ imageBlur: Number(e.target.value) })
                  }
                  className="h-2 flex-1 accent-[var(--blue-500)]"
                />
                <span
                  className="w-8 text-right text-xs tabular-nums"
                  style={{ color: 'var(--gray-600)' }}
                >
                  {config.imageBlur ?? 0}%
                </span>
              </div>
            </div>
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Background / overlay color
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_TOKEN_OPTIONS.map(({ name, var: cssVar }) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    className={cn(
                      'h-8 w-8 rounded-[var(--border-radius-small)] border-2 transition-all',
                      config.backgroundColor === cssVar ||
                        config.backgroundColor === name
                        ? 'border-[var(--blue-500)] ring-2 ring-[var(--blue-200)]'
                        : 'border-[var(--gray-300)] hover:border-[var(--gray-500)]',
                    )}
                    style={{ backgroundColor: `var(--${name})` }}
                    onClick={() => update({ backgroundColor: cssVar })}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs" style={{ color: 'var(--gray-600)' }}>
                Overlay opacity
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={
                    config.overlayOpacity ??
                    DEFAULT_SECTION_STYLE_CONFIG.overlayOpacity
                  }
                  onChange={(e) =>
                    update({ overlayOpacity: Number(e.target.value) })
                  }
                  className="h-2 flex-1 accent-[var(--blue-500)]"
                />
                <span
                  className="w-8 text-right text-xs tabular-nums"
                  style={{ color: 'var(--gray-600)' }}
                >
                  {config.overlayOpacity ?? 0}%
                </span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
