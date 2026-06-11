'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { useNinetailed, useProfile } from '@ninetailed/experience.js-react';
import { X } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import type { BannerFragment, BlockProps } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { resolveMergeTagsInDoc } from '@/lib/merge-tags';
import { NT_EVENTS } from '@/lib/nt-events';
import { useMergeTagRenderOptions } from '@/lib/rich-text-merge-tags';
import { parseSectionStyle } from '@/lib/section-style-types';
import { sectionBgClass, sectionTextClass } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';

const SPACING_MAP = {
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

/**
 * Returns true if the given hex color is "dark" (luminance < 0.5).
 * Falls back to true (treat as dark) for non-hex values.
 */
function isDarkColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return true;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.5;
}

// ── Style variant → layout + padding ─────────────────────────────────────────
const VARIANT_CLASSES: Record<string, { width: string; padding: string }> = {
  'full-width':    { width: 'w-full px-8',                padding: 'py-4' },
  container:       { width: 'max-w-7xl mx-auto px-8',     padding: 'py-4' },
  slim:            { width: 'max-w-7xl mx-auto px-8',     padding: 'py-3' },
  'large-callout': { width: 'w-full px-8',                padding: 'py-24' },
  default:         { width: 'max-w-7xl mx-auto px-8',     padding: 'py-4' },
};

export function Banner({ data: rawData }: BlockProps<BannerFragment>) {
  const data = useLiveUpdates(rawData);
  const getProps = useContentfulInspectorModeProps(rawData.sys.id);
  const [isVisible, setIsVisible] = useState(true);

  const { track } = useNinetailed();
  const profileState = useProfile();
  const traits = (profileState.profile?.traits ?? {}) as Record<string, unknown>;
  const segment = (traits.customer_type as string) ?? 'new-visitor';
  const entryId = rawData.sys.id;

  const { headlineRt, subheadlineRt, ctaText, ctaUrl, variant, colorVariant } = data;

  const resolvedHeadlineRt = resolveMergeTagsInDoc(
    headlineRt?.json as unknown as Parameters<typeof resolveMergeTagsInDoc>[0],
    traits,
  );
  const resolvedSubheadlineRt = resolveMergeTagsInDoc(
    subheadlineRt?.json as unknown as Parameters<typeof resolveMergeTagsInDoc>[0],
    traits,
  );

  // Parse sectionStyle — live preview may return object or string
  const rawSectionStyle = (data as BannerFragment).sectionStyle;
  const sectionStyle = parseSectionStyle(
    rawSectionStyle == null
      ? null
      : typeof rawSectionStyle === 'string'
        ? rawSectionStyle
        : typeof rawSectionStyle === 'object'
          ? JSON.stringify(rawSectionStyle)
          : String(rawSectionStyle),
  );
  const useOverride = sectionStyle.useStyleOverride;

  const renderOptions = useMergeTagRenderOptions();

  if (!isVisible) return null;

  // ── Layout ────────────────────────────────────────────────────────────────
  const variantLayout = VARIANT_CLASSES[variant ?? 'default'] ?? VARIANT_CLASSES['default'];
  const { width: widthClass, padding: paddingClass } = variantLayout;

  // ── colorVariant classes (only when sectionStyle override is NOT active) ──
  const resolvedColorVariant = colorVariant ?? 'primary';
  const colorBgClass = !useOverride ? sectionBgClass(resolvedColorVariant) : '';
  const colorTextClass = !useOverride ? sectionTextClass(resolvedColorVariant) : '';

  // ── Section-level color overrides ─────────────────────────────────────────
  const sectionStyle_inline: React.CSSProperties = useOverride && sectionStyle.backgroundColor
    ? { backgroundColor: sectionStyle.backgroundColor }
    : {};

  const textAlign = useOverride ? sectionStyle.textAlign : undefined;
  const spacingClass = useOverride && sectionStyle.contentSpacing
    ? SPACING_MAP[sectionStyle.contentSpacing]
    : '';

  // ── Text contrast enforcement for sectionStyle overrides ──────────────────
  const bgColor = useOverride ? sectionStyle.backgroundColor : undefined;
  const defaultTextColor = bgColor
    ? isDarkColor(bgColor) ? '#ffffff' : '#1a1a2e'
    : undefined;

  const headlineStyle: React.CSSProperties =
    useOverride && sectionStyle.headlineColor
      ? { color: sectionStyle.headlineColor }
      : defaultTextColor
        ? { color: defaultTextColor }
        : {};

  const subheadlineStyle: React.CSSProperties =
    useOverride && sectionStyle.subheadlineColor
      ? { color: sectionStyle.subheadlineColor }
      : defaultTextColor
        ? { color: defaultTextColor, opacity: 0.8 }
        : {};

  // ── CTA button ────────────────────────────────────────────────────────────
  const ctaStyle: React.CSSProperties = {};
  if (useOverride && sectionStyle.buttonBgColor) {
    ctaStyle.backgroundColor = sectionStyle.buttonBgColor;
  }
  const ctaTextClass = useOverride && sectionStyle.buttonBgColor
    ? 'text-white'
    : 'text-accent-foreground';

  // ── Dismiss button — always contrasting ───────────────────────────────────
  const dismissClass = useOverride
    ? (defaultTextColor === '#ffffff' ? 'text-white' : 'text-foreground')
    : colorTextClass;

  return (
    <section
      className={cn('w-full', colorBgClass)}
      style={sectionStyle_inline}
    >
      <div className={cn(widthClass, paddingClass, spacingClass)}>
        <div
          className={cn(
            'relative flex flex-col gap-4 md:flex-row md:items-center',
            textAlign === 'left'
              ? 'md:justify-start'
              : textAlign === 'right'
                ? 'md:justify-end'
                : 'text-center md:justify-center',
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn('absolute top-0 right-0 h-8 w-8 md:hidden', dismissClass)}
            onClick={() => { track(NT_EVENTS.BANNER_DISMISSED, { entryId, segment }); setIsVisible(false); }}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className={cn('flex flex-col items-center gap-3 pt-2 md:flex-row md:items-center md:pt-0', colorTextClass)}>
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              {/* Headline */}
              <div
                className="text-sm font-medium"
                style={headlineStyle}
                {...getProps({ fieldId: 'headlineRt' })}
              >
                {resolvedHeadlineRt
                  ? documentToReactComponents(resolvedHeadlineRt as unknown as Parameters<typeof documentToReactComponents>[0], renderOptions)
                  : null}
              </div>
              {/* Subheadline */}
              <div
                className="text-sm"
                style={subheadlineStyle}
                {...getProps({ fieldId: 'subheadlineRt' })}
              >
                {resolvedSubheadlineRt
                  ? documentToReactComponents(resolvedSubheadlineRt as unknown as Parameters<typeof documentToReactComponents>[0], renderOptions)
                  : null}
              </div>
            </div>
          </div>

          {(ctaText ?? 'Learn More') && (
            <div className="flex items-center gap-2">
              <a
                href={ctaUrl ?? '#'}
                onClick={() => track(NT_EVENTS.BANNER_CTA_CLICKED, { entryId, segment, ctaText: ctaText ?? '' })}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold hover:opacity-90',
                  !useOverride || !sectionStyle.buttonBgColor
                    ? 'bg-accent text-accent-foreground'
                    : ctaTextClass,
                )}
                style={ctaStyle}
                {...getProps({ fieldId: 'ctaText' })}
              >
                {ctaText ?? 'Learn More'}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className={cn('hidden h-8 w-8 md:inline-flex', dismissClass)}
                onClick={() => { track(NT_EVENTS.BANNER_DISMISSED, { entryId, segment }); setIsVisible(false); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
