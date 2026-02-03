'use client';

import { ChevronDown, LayoutGrid, Palette } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { SectionStyleConfig } from '@/lib/section-style-types';
import {
  DEFAULT_SECTION_STYLE_CONFIG,
  parseSectionStyle,
} from '@/lib/section-style-types';
import { cn } from '@/lib/utils';

const SECTION_STYLE_FIELD_ID = 'sectionStyle';

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

function getFieldFromSdk(
  sdk: {
    field?: SdkField;
    entry?: { fields: Record<string, SdkField> };
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

export function SectionStyleEditor({
  sdk,
  isEntryField,
}: {
  sdk: unknown;
  isEntryField: boolean;
}) {
  const field = getFieldFromSdk(
    sdk as Parameters<typeof getFieldFromSdk>[0],
    isEntryField,
  );
  const [config, setConfig] = useState<SectionStyleConfig>(() => ({
    ...DEFAULT_SECTION_STYLE_CONFIG,
  }));
  const [showBackground, setShowBackground] = useState(true);
  const [showLayout, setShowLayout] = useState(true);
  const [ready, setReady] = useState(false);

  const persist = useCallback(
    (next: SectionStyleConfig) => {
      if (!field) return;
      // Contentful JSON field expects type Object; pass the object, not a string.
      field.setValue(next).catch(() => {});
    },
    [field],
  );

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

  useEffect(() => {
    if (
      ready &&
      (sdk as { app?: { setReady: () => Promise<void> } })?.app?.setReady
    ) {
      (sdk as { app: { setReady: () => Promise<void> } }).app
        .setReady()
        .catch(() => {});
    }
  }, [ready, sdk]);

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
      className="flex flex-col gap-4 p-4"
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
        </CollapsibleContent>
      </Collapsible>

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
                onChange={(e) => update({ imageBlur: Number(e.target.value) })}
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
    </div>
  );
}
