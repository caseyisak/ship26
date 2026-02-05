'use client';

import type { ComponentType } from 'react';

import AnimationCheckout from '@/components/ui/animation-checkout';
import AnimationInvoicing from '@/components/ui/animation-invoicing';
import AnimationPaymentLink from '@/components/ui/animation-payment-link';
import AnimationRecurringBilling from '@/components/ui/animation-recurring-bill';

/**
 * Reusable animation keys for feature (and other) blocks.
 * Add new keys and components here so they can be referenced from Contentful
 * (e.g. Feature Item.animationKey) and reused anywhere.
 */
export const FEATURE_VISUAL_KEYS = [
  'checkout',
  'recurring-billing',
  'invoicing',
  'payment-link',
] as const;

export type FeatureVisualKey = (typeof FEATURE_VISUAL_KEYS)[number];

const REGISTRY: Record<
  FeatureVisualKey,
  ComponentType<{ className?: string }>
> = {
  checkout: AnimationCheckout,
  'recurring-billing': AnimationRecurringBilling,
  invoicing: AnimationInvoicing,
  'payment-link': AnimationPaymentLink,
};

export function getFeatureVisualComponent(
  key: string | null | undefined,
): ComponentType<{ className?: string }> | null {
  if (!key || !FEATURE_VISUAL_KEYS.includes(key as FeatureVisualKey))
    return null;
  return REGISTRY[key as FeatureVisualKey] ?? null;
}
