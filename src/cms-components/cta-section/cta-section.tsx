'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import * as React from 'react';

import type { BlockProps, CtaSectionFragment } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { useMergeTagRenderOptions } from '@/lib/rich-text-merge-tags';
import { parseSectionStyle } from '@/lib/section-style-types';
import { ctaPrimaryBtnStyle, ctaSecondaryBtnStyle, sectionBgClass, sectionTextClass } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';

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

/**
 * Renders rich text JSON via documentToReactComponents, or returns null if absent.
 */
function RtField({
  rt,
}: {
  rt?: { json: Record<string, unknown> } | null;
}): React.ReactElement | null {
  if (!rt?.json) return null;
  return (
    <>
      {documentToReactComponents(
        rt.json as unknown as Parameters<typeof documentToReactComponents>[0],
      )}
    </>
  );
}

export function CtaSection({ data: rawData }: BlockProps<CtaSectionFragment>) {
  const data = useLiveUpdates(rawData);
  const getProps = useContentfulInspectorModeProps(rawData.sys.id);
  const rtOptions = useMergeTagRenderOptions();

  const {
    headlineRt,
    subheadlineRt,
    ctaPrimaryLabelRt,
    ctaPrimaryUrl,
    primaryCtaPage,
    ctaSecondaryLabelRt,
    ctaSecondaryUrl,
    secondaryCtaPage,
    colorVariant,
    showDottedPattern,
  } = data;

  // Parse sectionStyle — live preview may return object or string
  const rawSectionStyle = (data as CtaSectionFragment).sectionStyle;
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

  // ── Variant resolution ────────────────────────────────────────────────────
  const resolvedVariant = colorVariant ?? 'primary';
  const isImageVariant = resolvedVariant === 'image';

  const colorBgClass =
    !useOverride && !isImageVariant
      ? sectionBgClass(resolvedVariant)
      : '';
  const colorTextClass = !useOverride
    ? sectionTextClass(resolvedVariant)
    : '';

  // ── Section-level inline styles ───────────────────────────────────────────
  const sectionInlineStyle: React.CSSProperties = {};
  if (useOverride && sectionStyle.backgroundColor) {
    sectionInlineStyle.backgroundColor = sectionStyle.backgroundColor;
  }

  // Background image (image variant or sectionStyle override)
  const rawBgUrl = (data as CtaSectionFragment).backgroundImage?.url;
  const backgroundImageUrl = rawBgUrl?.startsWith('//')
    ? `https:${rawBgUrl}`
    : (rawBgUrl ?? undefined);

  if (isImageVariant && backgroundImageUrl) {
    sectionInlineStyle.backgroundImage = `url(${backgroundImageUrl})`;
    sectionInlineStyle.backgroundSize = 'cover';
    sectionInlineStyle.backgroundPosition = 'center';
    sectionInlineStyle.backgroundRepeat = 'no-repeat';
  }

  // ── Text color overrides (sectionStyle) ───────────────────────────────────
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

  // Overlay opacity for image variant
  const overlayOpacity = isImageVariant
    ? (sectionStyle.overlayOpacity ?? 50) / 100
    : 0;

  // Page reference takes precedence over raw URL — matches issue spec
  const resolvedPrimaryUrl = primaryCtaPage?.slug
    ? `/page/${primaryCtaPage.slug}`
    : (ctaPrimaryUrl ?? null);
  const resolvedSecondaryUrl = secondaryCtaPage?.slug
    ? `/page/${secondaryCtaPage.slug}`
    : (ctaSecondaryUrl ?? null);

  const hasPrimary = !!(ctaPrimaryLabelRt?.json && resolvedPrimaryUrl);
  const hasSecondary = !!(ctaSecondaryLabelRt?.json && resolvedSecondaryUrl);

  // Map colorVariant → data-variant for the CSS contrast system
  const dataVariant =
    resolvedVariant === 'primary' || resolvedVariant === 'alt'
      ? 'accent'
      : resolvedVariant === 'dark'
        ? 'dark'
        : 'light';

  // Button inline styles — override shadcn's bg-primary/bg-background base classes.
  // Inline styles guarantee contrast regardless of Tailwind specificity order.

  // Merge sectionStyle.buttonBgColor override on top of variant defaults
  const primaryInlineStyle: React.CSSProperties = {
    ...ctaPrimaryBtnStyle(resolvedVariant),
    ...(useOverride && sectionStyle.buttonBgColor
      ? { backgroundColor: sectionStyle.buttonBgColor }
      : {}),
  };
  const secondaryBtnStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    ...ctaSecondaryBtnStyle(resolvedVariant),
  };

  return (
    <section
      data-variant={dataVariant}
      className={cn('relative w-full overflow-hidden', colorBgClass)}
      style={sectionInlineStyle}
    >
      {/* Dark overlay for image variant */}
      {isImageVariant && overlayOpacity > 0 && (
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor: '#000000', opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}

      {/* Dotted pattern overlay — shown when showDottedPattern is true OR for image variant */}
      {(showDottedPattern || isImageVariant) && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'relative z-10 mx-auto max-w-3xl px-6 py-20 text-center',
          colorTextClass,
        )}
      >
        {/* Headline */}
        {headlineRt?.json && (
          <div
            className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl"
            style={headlineStyle}
            {...getProps({ fieldId: 'headlineRt' })}
          >
            {documentToReactComponents(
              headlineRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
              rtOptions,
            )}
          </div>
        )}

        {/* Subheadline */}
        {subheadlineRt?.json && (
          <div
            className="mt-4 text-lg opacity-90 sm:text-xl"
            style={subheadlineStyle}
            {...getProps({ fieldId: 'subheadlineRt' })}
          >
            {documentToReactComponents(
              subheadlineRt.json as unknown as Parameters<typeof documentToReactComponents>[0],
              rtOptions,
            )}
          </div>
        )}

        {/* CTA Buttons */}
        {(hasPrimary || hasSecondary) && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            {hasPrimary && (
              <Button
                asChild
                className="min-w-[160px] hover:opacity-90"
                style={primaryInlineStyle}
                {...getProps({ fieldId: 'ctaPrimaryLabelRt' })}
              >
                <a href={resolvedPrimaryUrl!}>
                  <RtField rt={ctaPrimaryLabelRt} />
                </a>
              </Button>
            )}
            {hasSecondary && (
              <Button
                asChild
                variant="outline"
                className="min-w-[160px] hover:opacity-80"
                style={secondaryBtnStyle}
                {...getProps({ fieldId: 'ctaSecondaryLabelRt' })}
              >
                <a href={resolvedSecondaryUrl!}>
                  <RtField rt={ctaSecondaryLabelRt} />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
