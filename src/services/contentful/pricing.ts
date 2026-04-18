import type {
  PricingFragment,
  PricingPlanFeatureFragment,
  PricingPlanFragment,
} from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { PRICING_BY_ID } from './queries';

type RawPricingPlanFeature = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
};

type RawPricingPlan = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  name?: string | null;
  blurb?: { json: Record<string, unknown> } | null;
  monthlyPrice?: string | null;
  annualPrice?: string | null;
  perUnitMonthly?: string | null;
  perUnitAnnual?: string | null;
  badge?: string | null;
  colorVariant?: string | null;
  ctaLabel?: { json: Record<string, unknown> } | null;
  ctaUrl?: string | null;
  featuresCollection?: { items: Array<RawPricingPlanFeature | null> } | null;
};

type RawPricing = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  showToggle?: boolean | null;
  plansCollection?: { items: Array<RawPricingPlan | null> } | null;
};

type PricingByIdResponse = {
  pricingCollection: {
    items: Array<RawPricing | null>;
  };
};

function mapPricingPlanFeature(
  item: RawPricingPlanFeature | null,
): PricingPlanFeatureFragment | null {
  if (!item || item.__typename !== 'PricingPlanFeature') return null;
  return {
    __typename: 'PricingPlanFeature',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    label: item.label ?? null,
  };
}

function mapPricingPlan(item: RawPricingPlan | null): PricingPlanFragment | null {
  if (!item || item.__typename !== 'PricingPlan') return null;
  return {
    __typename: 'PricingPlan',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    name: item.name ?? null,
    blurb: item.blurb ?? null,
    monthlyPrice: item.monthlyPrice ?? null,
    annualPrice: item.annualPrice ?? null,
    perUnitMonthly: item.perUnitMonthly ?? null,
    perUnitAnnual: item.perUnitAnnual ?? null,
    badge: item.badge ?? null,
    colorVariant: item.colorVariant ?? null,
    ctaLabel: item.ctaLabel ?? null,
    ctaUrl: item.ctaUrl ?? null,
    featuresCollection: item.featuresCollection
      ? {
          items: item.featuresCollection.items
            .map(mapPricingPlanFeature)
            .filter(Boolean) as PricingPlanFeatureFragment[],
        }
      : null,
  };
}

function mapPricing(item: RawPricing | null): PricingFragment | null {
  if (!item || item.__typename !== 'Pricing') return null;
  return {
    __typename: 'Pricing',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    label: item.label ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    showToggle: item.showToggle ?? null,
    plansCollection: item.plansCollection
      ? {
          items: item.plansCollection.items
            .map(mapPricingPlan)
            .filter(Boolean) as PricingPlanFragment[],
        }
      : null,
  };
}

/** Fetch a single Pricing entry by ID for ID-based live preview. */
export async function getPricingByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<PricingFragment | null> {
  try {
    const data = await fetchGraphQL<PricingByIdResponse>({
      query: PRICING_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.pricingCollection?.items?.[0] ?? null;
    return mapPricing(item);
  } catch {
    return null;
  }
}
