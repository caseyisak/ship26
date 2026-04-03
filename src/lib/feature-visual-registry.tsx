'use client';

import type { ComponentType } from 'react';

import AnimationFadeDown from '@/components/ui/animation-fade-down';
import AnimationFadeLeft from '@/components/ui/animation-fade-left';
import AnimationFadeRight from '@/components/ui/animation-fade-right';
import AnimationFadeUp from '@/components/ui/animation-fade-up';
import AnimationSlideUp from '@/components/ui/animation-slide-up';
import AnimationZoomIn from '@/components/ui/animation-zoom-in';

/**
 * Generic entrance animation keys for Card blocks.
 * Keys match the validated enum on the Contentful `featureItem.animationKey` field.
 * Add new keys + components here to extend the registry.
 *
 * NOTE: The original MetaFi product animations (checkout, recurring-billing,
 * invoicing, payment-link) remain available as React components in
 * src/components/ui/animation-*.tsx but are no longer registered here —
 * they are MetaFi-brand-specific and not exposed to Contentful editors.
 */
export const FEATURE_VISUAL_KEYS = [
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'zoom-in',
  'slide-up',
] as const;

export type FeatureVisualKey = (typeof FEATURE_VISUAL_KEYS)[number];

const REGISTRY: Record<
  FeatureVisualKey,
  ComponentType<{ className?: string }>
> = {
  'fade-up': AnimationFadeUp,
  'fade-down': AnimationFadeDown,
  'fade-left': AnimationFadeLeft,
  'fade-right': AnimationFadeRight,
  'zoom-in': AnimationZoomIn,
  'slide-up': AnimationSlideUp,
};

export function getFeatureVisualComponent(
  key: string | null | undefined,
): ComponentType<{ className?: string }> | null {
  if (!key || !FEATURE_VISUAL_KEYS.includes(key as FeatureVisualKey))
    return null;
  return REGISTRY[key as FeatureVisualKey] ?? null;
}
