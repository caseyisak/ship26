import { BlockRenderer } from '@/block-renderer';
import type { DashboardPageData } from '@/services/contentful/dashboard-page';
import { DashboardNav } from '../_components/dashboard-nav';

type Props = { page: DashboardPageData | null };

/**
 * GenericDashboard — 3-slot layout driven entirely by Contentful.
 *
 * Slots:
 *   headerBlock  — full-width banner/hero rendered above the content area
 *   primaryBlock — main content area (supports NT personalisation via ntExperiencesCollection)
 *   secondaryBlock — side/supplemental content area (supports NT personalisation)
 *
 * Each slot renders whatever block type Contentful links to via BlockRenderer.
 * The layout itself is intentionally minimal so demo editors can focus on content.
 */
export function GenericDashboard({ page }: Props) {
  return (
    <div className="min-h-screen bg-muted">
      <DashboardNav />

      {/* Header block — full width, above content grid */}
      {page?.headerBlock ? (
        <BlockRenderer data={page.headerBlock} />
      ) : null}

      <div className="container py-6 space-y-5">

        {/* Primary + Secondary two-column row */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

          {/* Primary slot — main personalization zone */}
          <div>
            {page?.primaryBlock ? (
              <BlockRenderer data={page.primaryBlock} />
            ) : (
              <div className="bg-card rounded-lg p-10 text-center">
                <p className="text-muted-foreground text-sm">
                  No primary content configured. Link a block to the{' '}
                  <code className="font-mono text-xs bg-muted px-1 rounded">primaryBlock</code>{' '}
                  slot in Contentful.
                </p>
              </div>
            )}
          </div>

          {/* Secondary slot — supplemental / sidebar zone */}
          <div>
            {page?.secondaryBlock ? (
              <BlockRenderer data={page.secondaryBlock} />
            ) : (
              <div className="bg-card rounded-lg p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No secondary content configured.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
