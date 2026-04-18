import { BlockRenderer } from '@/block-renderer';
import type { DashboardPageData } from '@/services/contentful/dashboard-page';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '../_components/app-sidebar';
import { DashboardTopBar } from '../_components/dashboard-top-bar';
import { ContentPerformanceChart } from '../_components/content-performance-chart';
import { UserEngagementChart } from '../_components/user-engagement-chart';

type Props = { page: DashboardPageData | null };

/**
 * GenericDashboard — 3-slot Contentful-driven layout.
 *
 * Chrome:
 *   - Collapsible icon sidebar (AppSidebar): Metafi brand + 7 nav items
 *   - Sticky top bar (DashboardTopBar): sidebar trigger, KPI stat strip,
 *     gear (NT panel) + persona A/B/C pills + login — all in one h-14 bar
 *
 * Content (below top bar):
 *   headerBlock    — full-width Contentful slot
 *   primaryBlock   — main personalization zone (NT experiences), left col
 *   secondaryBlock — supplemental zone (NT experiences), right col
 *   Charts row     — Content Performance + User Engagement
 */
export function GenericDashboard({ page }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardTopBar />

        <div className="flex flex-col gap-6 p-6">
          {/* Header block — full-width Contentful slot */}
          {page?.headerBlock ? (
            <section aria-label="Header content">
              <BlockRenderer data={page.headerBlock} />
            </section>
          ) : null}

          {/* Primary + Secondary two-column Contentful grid */}
          <section aria-label="Personalized content blocks">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Primary slot — main personalization zone */}
              <div className="min-w-0 overflow-hidden border border-border bg-card rounded-none">
                {page?.primaryBlock ? (
                  <div className="w-full max-w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full">
                    <BlockRenderer data={page.primaryBlock} />
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-muted-foreground text-sm">
                      No primary content configured. Link a block to the{' '}
                      <code className="font-mono text-xs bg-muted px-1">primaryBlock</code>{' '}
                      slot in Contentful.
                    </p>
                  </div>
                )}
              </div>

              {/* Secondary slot — supplemental / sidebar zone */}
              <div className="min-w-0 overflow-hidden border border-border bg-card rounded-none">
                {page?.secondaryBlock ? (
                  <div className="w-full max-w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full">
                    <BlockRenderer data={page.secondaryBlock} />
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No secondary content configured.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Charts row */}
          <section aria-label="Analytics charts">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ContentPerformanceChart />
              <UserEngagementChart />
            </div>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
