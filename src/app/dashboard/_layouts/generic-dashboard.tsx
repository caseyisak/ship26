import { BlockRenderer } from '@/block-renderer';
import type { DashboardPageData } from '@/services/contentful/dashboard-page';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '../_components/app-sidebar';
import { KpiStatCard } from '../_components/kpi-stat-card';
import { ContentPerformanceChart } from '../_components/content-performance-chart';
import { UserEngagementChart } from '../_components/user-engagement-chart';

type Props = { page: DashboardPageData | null };

const KPI_STATS = [
  { label: 'Active Users', value: '24,891', delta: 12 },
  { label: 'Content Published', value: '1,204', delta: 8 },
  { label: 'Page Views', value: '318K', delta: -3 },
  { label: 'Conversion Rate', value: '4.7%', delta: 21 },
  { label: 'API Calls', value: '2.1M', delta: 5 },
];

/**
 * GenericDashboard — 3-slot Contentful-driven layout with dashboard-8 inspired chrome.
 *
 * Layout:
 *   - Collapsible icon sidebar (AppSidebar) with Metafi brand + nav + persona switcher
 *   - Main content: KPI row → headerBlock (full-width) → primaryBlock/secondaryBlock grid → charts
 *
 * Contentful slots:
 *   headerBlock    — full-width block above the content grid
 *   primaryBlock   — main personalization zone (NT experiences slot)
 *   secondaryBlock — supplemental / side zone (NT experiences slot)
 *
 * Each slot renders via <BlockRenderer> — whatever __typename Contentful links to.
 */
export function GenericDashboard({ page }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top bar with sidebar trigger */}
        <header className="flex h-12 items-center gap-2 border-b border-border bg-card px-4 sticky top-0 z-40">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium text-foreground">Dashboard</span>
        </header>

        <div className="flex flex-col gap-6 p-6">
          {/* KPI stat row — 5 cards */}
          <section aria-label="Key metrics">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {KPI_STATS.map((stat) => (
                <KpiStatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  delta={stat.delta}
                />
              ))}
            </div>
          </section>

          {/* Header block — full width Contentful slot */}
          {page?.headerBlock ? (
            <section aria-label="Header content">
              <BlockRenderer data={page.headerBlock} />
            </section>
          ) : null}

          {/* Primary + Secondary two-column Contentful grid */}
          <section aria-label="Personalized content blocks">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
              {/* Primary slot — main personalization zone */}
              <div>
                {page?.primaryBlock ? (
                  <BlockRenderer data={page.primaryBlock} />
                ) : (
                  <div className="border border-border bg-card p-10 text-center rounded-none">
                    <p className="text-muted-foreground text-sm">
                      No primary content configured. Link a block to the{' '}
                      <code className="font-mono text-xs bg-muted px-1">primaryBlock</code>{' '}
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
                  <div className="border border-border bg-card p-8 text-center rounded-none">
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
