import { BlockRenderer } from '@/block-renderer';
import type { DashboardPageData } from '@/services/contentful/dashboard-page';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '../_components/app-sidebar';
import { DashboardTopBar } from '../_components/dashboard-top-bar';
import { DashboardAuthGuard } from '../_components/dashboard-auth-guard';
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
 * GenericDashboard — Contentful-driven dashboard layout.
 *
 * Layout order (top to bottom):
 *   1. DashboardTopBar    — KPI strip (inline) + gear (demo mode) + logout
 *   2. headerBlock        — full-width, conditional
 *   3. KPI metric cards   — 5-card row
 *   4. primaryBlock       — full-width, conditional (omit if null)
 *   5. [Content Perf chart] | [secondaryBlock]   — 2-col, secondaryBlock conditional
 *   6. [User Engagement chart] | [tertiaryBlock] — 2-col, tertiaryBlock conditional
 *   7. quaternaryBlock    — full-width, conditional (omit if null)
 *
 * All Contentful slots only render when non-null — no empty placeholders.
 * Wrapped in DashboardAuthGuard which redirects to /login if no session.
 */
export function GenericDashboard({ page }: Props) {
  return (
    <DashboardAuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardTopBar />

          <div className="flex flex-col gap-6 p-6">

            {/* ── 1. Header block ── */}
            {page?.headerBlock ? (
              <section aria-label="Header content">
                <BlockRenderer data={page.headerBlock} />
              </section>
            ) : null}

            {/* ── 2. KPI metric cards row ── */}
            <section aria-label="Key metrics">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {KPI_STATS.map((stat) => (
                  <div key={stat.label} className="min-w-0 overflow-hidden">
                    <KpiStatCard
                      label={stat.label}
                      value={stat.value}
                      delta={stat.delta}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* ── 3. Primary block — full-width, omit if null ── */}
            {page?.primaryBlock ? (
              <section aria-label="Primary content">
                <div className="min-w-0 overflow-hidden border border-border bg-card rounded-none">
                  <div className="w-full max-w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full">
                    <BlockRenderer data={page.primaryBlock} />
                  </div>
                </div>
              </section>
            ) : null}

            {/* ── 4. Content Performance | Secondary block ── */}
            <section aria-label="Performance and secondary content">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ContentPerformanceChart />
                {page?.secondaryBlock ? (
                  <div className="min-w-0 overflow-hidden border border-border bg-card rounded-none">
                    <div className="w-full max-w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full">
                      <BlockRenderer data={page.secondaryBlock} />
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {/* ── 5. User Engagement | Tertiary block ── */}
            <section aria-label="Engagement and tertiary content">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <UserEngagementChart />
                {page?.tertiaryBlock ? (
                  <div className="min-w-0 overflow-hidden border border-border bg-card rounded-none">
                    <div className="w-full max-w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full">
                      <BlockRenderer data={page.tertiaryBlock} />
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {/* ── 6. Quaternary block — full-width, omit if null ── */}
            {page?.quaternaryBlock ? (
              <section aria-label="Quaternary content">
                <div className="min-w-0 overflow-hidden border border-border bg-card rounded-none">
                  <div className="w-full max-w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full">
                    <BlockRenderer data={page.quaternaryBlock} />
                  </div>
                </div>
              </section>
            ) : null}

          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardAuthGuard>
  );
}
