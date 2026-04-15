'use client';

import type { DashboardPageData, DashboardPageRaw } from '@/services/contentful/dashboard-page';
import { mapSlot } from '@/services/contentful/dashboard-page';
import { useLiveUpdates } from '@/lib/live-preview';
import { CheckoutLayout } from '@/app/dashboard/_layouts/checkout-layout';
import { HomeLayout } from '@/app/dashboard/_layouts/home-layout';
import { UpgradeLayout } from '@/app/dashboard/_layouts/upgrade-layout';

/**
 * Subscribes to Contentful Live Preview updates on the DashboardPage entry.
 *
 * Receives RAW slot data (not pre-mapped) so the SDK can properly update reference
 * fields when linked entries are added or changed in the editor. Slots are mapped
 * via mapSlot() after useLiveUpdates, matching the PageContentLive pattern.
 */
export function DashboardPreviewClient({ page }: { page: DashboardPageRaw }) {
  const liveRaw = useLiveUpdates(page) as DashboardPageRaw;

  const transformed: DashboardPageData = {
    sys: liveRaw.sys,
    internalName: liveRaw.internalName,
    title: liveRaw.title,
    slug: liveRaw.slug,
    pageType: liveRaw.pageType as DashboardPageData['pageType'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    top: mapSlot((liveRaw.top ?? null) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middle: mapSlot((liveRaw.middle ?? null) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bottom: mapSlot((liveRaw.bottom ?? null) as any),
  };

  if (transformed.pageType === 'upgrades') return <UpgradeLayout page={transformed} />;
  if (transformed.pageType === 'checkout') return <CheckoutLayout page={transformed} />;
  return <HomeLayout page={transformed} />;
}
