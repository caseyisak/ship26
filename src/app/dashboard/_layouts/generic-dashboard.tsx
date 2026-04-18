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

type Props = { page: DashboardPageData | null; settings?: DashboardSettingsData | null };

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
export function GenericDashboard({ page, settings }: Props) {
  // Build metric cards from settings or fallback
  const metricCards = settings
    ? [settings.metricCard1, settings.metricCard2, settings.metricCard3, settings.metricCard4].filter(
        Boolean,
      )
    : FALLBACK_METRICS;

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* SidebarInset: fills remaining width beside sidebar */}
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <DashboardTopBar />

        {/* Main scrollable content — fills remaining height */}
        <div className="flex flex-col flex-1 min-h-0 overflow-auto gap-4 p-4">

          {/* ── 1. Header block — full-width, conditional ── */}
          {page?.headerBlock ? (
            <section aria-label="Header content" className="shrink-0">
              <BlockRenderer data={page.headerBlock} />
            </section>
          ) : null}

          {/* ── 2. KPI metric cards row ── */}
          <section aria-label="Key metrics" className="shrink-0">
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

          {/* ── 3. chart1 | primaryBlock — 2-col, flex-1 ── */}
          <section
            aria-label="Performance and primary content"
            className="flex-1 min-h-0"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 h-full">
              <ContentPerformanceChart chartData={settings?.chart1 ?? null} />
              {page?.primaryBlock ? (
                <div className="min-w-0 overflow-hidden border border-border bg-card rounded-none flex flex-col">
                  {/* Force block content to render in a stacked vertical layout */}
                  <div className="flex-1 w-full overflow-hidden [&>*]:!w-full [&>*]:!max-w-full [&_.banner-inner]:!flex-col [&_.banner-inner]:!items-start [&_.banner-inner]:!gap-4">
                    <BlockRenderer data={page.primaryBlock} />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* ── 4. chart2 | chart3 — 2-col, flex-1 ── */}
          <section
            aria-label="Engagement charts"
            className="flex-1 min-h-0"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 h-full">
              <UserEngagementChart chartData={settings?.chart2 ?? null} />
              {settings?.chart3 ? (
                <UserEngagementChart chartData={settings.chart3} />
              ) : (
                // Placeholder keeps the grid shape when chart3 is not configured
                <div className="border border-border border-dashed bg-card/40 rounded-none flex items-center justify-center p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Chart 3 — configure in <strong>dashboardSettings</strong>
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── 5. secondaryBlock — full-width, conditional ── */}
          {page?.secondaryBlock ? (
            <section aria-label="Secondary content" className="shrink-0">
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
