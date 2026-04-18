import { fetchGraphQL } from './client';
import { DASHBOARD_SETTINGS } from './queries';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PersonaData = {
  name: string;
  label: string;
  customerType: string;
  color: string;
};

export type MetricCardData = {
  label: string;
  value: string;
  delta: number;
  format?: 'currency' | 'percent' | 'number' | 'compact';
};

export type ChartDataPoint = Record<string, string | number>;

export type ChartData = {
  type: 'bar' | 'area' | 'line';
  title: string;
  subtitle?: string;
  /** Primary series data key (e.g. "views", "sessions") */
  dataKey: string;
  /** Secondary series data key for dual-series charts (e.g. "returning") */
  dataKey2?: string;
  /** Legend label for primary series */
  label?: string;
  /** Legend label for secondary series */
  label2?: string;
  /** Target reference line value (bar charts) */
  targetValue?: number;
  /** Target reference line label */
  targetLabel?: string;
  data: ChartDataPoint[];
};

export type DashboardSettingsData = {
  sys: { id: string };
  internalName: string;
  metricCard1?: MetricCardData | null;
  metricCard2?: MetricCardData | null;
  metricCard3?: MetricCardData | null;
  metricCard4?: MetricCardData | null;
  chart1?: ChartData | null;
  chart2?: ChartData | null;
  chart3?: ChartData | null;
  personaA?: PersonaData | null;
  personaB?: PersonaData | null;
  personaC?: PersonaData | null;
};

// ── Response type ─────────────────────────────────────────────────────────────

type DashboardSettingsResponse = {
  dashboardSettingsCollection: {
    items: Array<{
      sys: { id: string };
      internalName: string;
      metricCard1?: MetricCardData | null;
      metricCard2?: MetricCardData | null;
      metricCard3?: MetricCardData | null;
      metricCard4?: MetricCardData | null;
      chart1?: ChartData | null;
      chart2?: ChartData | null;
      chart3?: ChartData | null;
      personaA?: PersonaData | null;
      personaB?: PersonaData | null;
      personaC?: PersonaData | null;
    }>;
  };
};

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getDashboardSettings({
  preview = false,
}: {
  preview?: boolean;
} = {}): Promise<DashboardSettingsData | null> {
  try {
    const data = await fetchGraphQL<DashboardSettingsResponse>({
      query: DASHBOARD_SETTINGS,
      variables: { preview },
      preview,
    });
    const raw = data.dashboardSettingsCollection?.items?.[0];
    if (!raw) return null;
    return raw;
  } catch {
    return null;
  }
}
