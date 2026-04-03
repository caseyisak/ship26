'use client';

import { X } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import type { BannerFragment, BlockProps } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { parseSectionStyle } from '@/lib/section-style-types';
import { cn } from '@/lib/utils';

function rtToPlainText(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return '';
  const node = doc as {
    nodeType?: string;
    value?: string;
    content?: unknown[];
  };
  if (node.nodeType === 'text') return node.value ?? '';
  return (node.content ?? []).map(rtToPlainText).join('');
}

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
  // Perceived luminance formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.5;
}

export function Banner({ data: rawData }: BlockProps<BannerFragment>) {
  const data = useLiveUpdates(rawData);
  const getProps = useContentfulInspectorModeProps(rawData.sys.id);
  const [isVisible, setIsVisible] = useState(true);

  const { headlineRt, subheadlineRt, ctaText, ctaUrl, variant, colorVariant } =
    data as BannerFragment;

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

  const title = rtToPlainText(headlineRt?.json);
  const description = rtToPlainText(subheadlineRt?.json);

  if (!isVisible) return null;

  // ── Variant-based layout ──────────────────────────────────────────────────
  // variant controls outer wrapper width + padding; sectionStyle controls colors.
  const variantClasses: Record<string, string> = {
    'full-width': 'w-full px-8',
    container: 'max-w-7xl mx-auto px-8',
    slim: 'max-w-7xl mx-auto px-8 py-3',
    'large-callout': 'w-full px-8 py-24',
    default: 'max-w-7xl mx-auto px-8',
  };
  const layoutClass =
    variantClasses[variant ?? 'default'] ?? variantClasses['default'];

  // ── colorVariant class map (only applied when sectionStyle override is NOT active) ──
  const COLOR_VARIANT_MAP: Record<string, string> = {
    light: 'bg-background text-foreground',
    dark: 'bg-foreground text-background',
    alt: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
  };
  const colorVariantClass =
    !useOverride && colorVariant ? (COLOR_VARIANT_MAP[colorVariant] ?? '') : '';

  // ── Section-level color overrides ─────────────────────────────────────────
  const sectionStyle_inline: React.CSSProperties =
    useOverride && sectionStyle.backgroundColor
      ? { backgroundColor: sectionStyle.backgroundColor }
      : {};

  const textAlign = useOverride ? sectionStyle.textAlign : undefined;
  const spacingClass =
    useOverride && sectionStyle.contentSpacing
      ? SPACING_MAP[sectionStyle.contentSpacing]
      : variant === 'slim' || variant === 'large-callout'
        ? '' // padding already baked into layoutClass for these variants
        : 'p-4';

  // ── Text contrast enforcement ─────────────────────────────────────────────
  // When a backgroundColor override is set but no explicit headline/subheadline
  // color, default to white on dark backgrounds and navy on light backgrounds.
  const bgColor = useOverride ? sectionStyle.backgroundColor : undefined;
  const defaultTextColor = bgColor
    ? isDarkColor(bgColor)
      ? '#ffffff'
      : '#1a1a2e'
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

  // ── CTA button contrast enforcement ──────────────────────────────────────
  // Button text is always white when a buttonBgColor is set (primary/accent bg).
  // If no override, use default accent styling.
  const ctaStyle: React.CSSProperties = {};
  if (useOverride && sectionStyle.buttonBgColor) {
    ctaStyle.backgroundColor = sectionStyle.buttonBgColor;
  }
  const ctaTextClass =
    useOverride && sectionStyle.buttonBgColor
      ? 'text-white'
      : 'text-accent-foreground';

  return (
    <section
      className={cn(
        'w-full',
        colorVariantClass
          ? colorVariantClass
          : !useOverride || !sectionStyle.backgroundColor
            ? 'bg-primary'
            : '',
      )}
      style={sectionStyle_inline}
    >
      <div className={cn(layoutClass, spacingClass)}>
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
            className="text-primary-foreground absolute top-0 right-0 h-8 w-8 md:hidden"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-primary-foreground flex flex-col items-center gap-3 pt-2 md:flex-row md:items-center md:pt-0">
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <p
                className={cn(
                  'text-sm font-medium',
                  !useOverride && !bgColor ? 'text-primary-foreground' : '',
                )}
                style={headlineStyle}
                {...getProps({ fieldId: 'headlineRt' })}
              >
                {title}
              </p>
              <p
                className={cn(
                  'text-sm',
                  !useOverride && !bgColor ? 'text-primary-foreground/80' : '',
                )}
                style={subheadlineStyle}
                {...getProps({ fieldId: 'subheadlineRt' })}
              >
                {description}
              </p>
            </div>
          </div>

          {(ctaText ?? 'Learn More') && (
            <div className="flex items-center gap-2">
              <a
                href={ctaUrl ?? '#'}
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
                className="text-primary-foreground hidden h-8 w-8 md:inline-flex"
                onClick={() => setIsVisible(false)}
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
