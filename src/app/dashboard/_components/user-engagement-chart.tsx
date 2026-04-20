'use client';

// Use semantic chart colors (--chart-2, --chart-3) so the chart is visible
// regardless of the --primary color value (which may be near-black in light mode).
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '@/services/contentful/dashboard-settings';

const FALLBACK_DATA = [
  { label: 'W1', sessions: 1240, returning: 680 },
  { label: 'W2', sessions: 1580, returning: 920 },
  { label: 'W3', sessions: 1380, returning: 810 },
  { label: 'W4', sessions: 1920, returning: 1100 },
  { label: 'W5', sessions: 1750, returning: 1040 },
  { label: 'W6', sessions: 2100, returning: 1280 },
  { label: 'W7', sessions: 1960, returning: 1150 },
  { label: 'W8', sessions: 2340, returning: 1420 },
];

type Props = {
  chartData?: ChartData | null;
};

export function UserEngagementChart({ chartData }: Props) {
  const title = chartData?.title ?? 'User Engagement';
  const subtitle = chartData?.subtitle ?? 'Weekly sessions — all vs returning';
  const dataKey = chartData?.dataKey ?? 'sessions';
  const dataKey2 = chartData?.dataKey2 ?? 'returning';
  const label = chartData?.label ?? 'All Sessions';
  const label2 = chartData?.label2 ?? 'Returning';
  const rawData = chartData?.data ?? FALLBACK_DATA;

  // Remap data: use "label" key as the X-axis category key
  const chartPoints = rawData.map((pt) => ({
    week: pt.label,
    ...pt,
  }));

  return (
    <div className="bg-card border border-border rounded-none p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: 'var(--chart-2)' }}
            />
            {label}
          </span>
          {dataKey2 && (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: 'var(--chart-3)' }}
              />
              {label2}
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartPoints}>
          <defs>
            <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradReturning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '0',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
            itemStyle={{ color: 'var(--muted-foreground)' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill="url(#gradSessions)"
          />
          {dataKey2 && (
            <Area
              type="monotone"
              dataKey={dataKey2}
              stroke="var(--chart-3)"
              strokeWidth={2}
              fill="url(#gradReturning)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
