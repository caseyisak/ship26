import { BlockRenderer } from '@/block-renderer';
import type { DashboardPageData } from '@/services/contentful/dashboard-page';
import type { DashboardSettingsData } from '@/services/contentful/dashboard-settings';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '../_components/app-sidebar';
import { DashboardTopBar } from '../_components/dashboard-top-bar';
import { KpiStatCard } from '../_components/kpi-stat-card';
import { ContentPerformanceChart } from '../_components/content-performance-chart';
import { UserEngagementChart } from '../_components/user-engagement-chart';

// Fallback metric data used when Contentful dashboardSettings entry is absent
const FALLBACK_METRICS = [
  { label: 'Active Users', value: '24,891', delta: 12 },
  { label: 'Content Published', value: '1,204', delta: 8 },
  { label: 'Page Views', value: '318K', delta: -3 },
  { label: 'Conversion Rate', value: '4.7%', delta: 21 },
];

type Props = {
  page: DashboardPageData | null;
  settings?: DashboardSettingsData | null;
  loggedInMetadata?: Record<string, unknown> | null;
};

/**
 * GenericDashboard — Contentful-driven dashboard layout.
 *
 * Layout (top to bottom, viewport-fit — no full-page scroll):
 *   Top bar:      [sidebar toggle] [Dashboard] ... [gear] [Log Out]
 *   ─────────────────────────────────────────────────────────────
 *   headerBlock   (full-width, conditional)
 *   KPI cards     (4-card row, shrink-0)
 *   ┌──────────────────────┬──────────────────────┐
 *   │ Content Perf (chart1)│ primaryBlock          │  ← flex-1, min-h-0
 *   ├──────────────────────┼──────────────────────┤
 *   │ User Engagement (ch2)│ chart3 or placeholder │  ← flex-1, min-h-0
 *   └──────────────────────┴──────────────────────┘
 *   secondaryBlock (full-width, conditional, shrink-0)
 *
 * Editable Contentful slots: headerBlock, primaryBlock, secondaryBlock (3 zones).
 * Chart data: driven by dashboardSettings JSON fields (chart1, chart2, chart3).
 * KPI metric cards: driven by dashboardSettings.metricCard1-4.
 */
export function GenericDashboard({ page, settings, loggedInMetadata }: Props) {
  // Build metric cards from settings or fallback
  const metricCards = settings
    ? [settings.metricCard1, settings.metricCard2, settings.metricCard3, settings.metricCard4].filter(
        Boolean,
      )
    : FALLBACK_METRICS;

  return (
    <SidebarProvider>
      <AppSidebar
        siteTitle={settings?.siteTitle ?? 'Metafi'}
        siteHomeUrl={settings?.siteHomeUrl ?? '/page/home'}
      />
      {/* SidebarInset: fills remaining width beside sidebar */}
      <SidebarInset className="flex flex-col min-h-screen">
        <DashboardTopBar loggedInMetadata={loggedInMetadata ?? null} />

        {/* Main content — scrolls naturally, no viewport-fit constraint */}
        <div className="flex flex-col gap-4 p-4">

          {/* ── 1. Header block — full-width, conditional ── */}
          {page?.headerBlock ? (
            <section aria-label="Header content">
              <BlockRenderer data={page.headerBlock} />
            </section>
          ) : null}

          {/* ── 2. KPI metric cards row ── */}
          <section aria-label="Key metrics">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metricCards.map((card) => {
                if (!card) return null;
                return (
                  <div key={card.label} className="min-w-0 overflow-hidden">
                    <KpiStatCard
                      label={card.label}
                      value={card.value}
                      delta={card.delta}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 3. chart1 | primaryBlock — 2-col ── */}
          <section aria-label="Performance and primary content">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="h-80">
                <ContentPerformanceChart chartData={settings?.chart1 ?? null} />
              </div>
              {page?.primaryBlock ? (
                <div className="h-80 min-w-0 overflow-hidden border border-border bg-card rounded-none flex flex-col">
                  <div className="flex-1 w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full [&_.banner-inner]:!flex-col [&_.banner-inner]:!items-start [&_.banner-inner]:!gap-4">
                    <BlockRenderer data={page.primaryBlock} />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* ── 4. chart2 | chart3 — 2-col ── */}
          <section aria-label="Engagement charts">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="h-80">
                <UserEngagementChart chartData={settings?.chart2 ?? null} />
              </div>
              {settings?.chart3 ? (
                <div className="h-80">
                  <UserEngagementChart chartData={settings.chart3} />
                </div>
              ) : (
                <div className="h-80 border border-border border-dashed bg-card/40 rounded-none flex items-center justify-center p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Chart 3 — configure in <strong>dashboardSettings</strong>
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── 5. secondaryBlock — full-width, conditional ── */}
          {page?.secondaryBlock ? (
            <section aria-label="Secondary content">
              <div className="min-w-0 overflow-hidden border border-border bg-card rounded-none">
                <div className="w-full max-w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full">
                  <BlockRenderer data={page.secondaryBlock} />
                </div>
              </div>
            </section>
          ) : null}

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
