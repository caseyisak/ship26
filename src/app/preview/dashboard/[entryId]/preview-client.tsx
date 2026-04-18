'use client';

import type { DashboardPageData, DashboardPageRaw } from '@/services/contentful/dashboard-page';
import { mapSlot } from '@/services/contentful/dashboard-page';
import { useLiveUpdates } from '@/lib/live-preview';
import { GenericDashboard } from '@/app/dashboard/_layouts/generic-dashboard';

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
    slug: liveRaw.slug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headerBlock: mapSlot((liveRaw.headerBlock ?? null) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    primaryBlock: mapSlot((liveRaw.primaryBlock ?? null) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    secondaryBlock: mapSlot((liveRaw.secondaryBlock ?? null) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tertiaryBlock: mapSlot((liveRaw.tertiaryBlock ?? null) as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quaternaryBlock: mapSlot((liveRaw.quaternaryBlock ?? null) as any),
  };

  return <GenericDashboard page={transformed} />;
}
