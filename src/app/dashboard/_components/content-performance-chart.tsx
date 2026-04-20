'use client';

import { useEffect, useState } from 'react';
import { useSpring, useMotionValueEvent } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '@/services/contentful/dashboard-settings';

// Use semantic chart colors from the theme (--chart-1 through --chart-5)
const mixBase = 'var(--background)';
const palette = {
  bar: 'var(--chart-1)',
  refLine: `color-mix(in oklch, var(--chart-1) 55%, ${mixBase})`,
  legend: 'var(--chart-1)',
};

// Fallback data used when no Contentful chartData is provided
const FALLBACK_DATA = [
  { label: 'Oct', views: 3200 },
  { label: 'Nov', views: 4100 },
  { label: 'Dec', views: 3800 },
  { label: 'Jan', views: 5200 },
  { label: 'Feb', views: 4800 },
  { label: 'Mar', views: 6100 },
  { label: 'Apr', views: 5700 },
];

const FALLBACK_CONFIG = {
  title: 'Content Performance',
  subtitle: 'Monthly page views with target reference',
  dataKey: 'views',
  targetValue: 5000,
  targetLabel: 'Target',
};

type Props = {
  chartData?: ChartData | null;
};

export function ContentPerformanceChart({ chartData }: Props) {
  const title = chartData?.title ?? FALLBACK_CONFIG.title;
  const subtitle = chartData?.subtitle ?? FALLBACK_CONFIG.subtitle;
  const dataKey = chartData?.dataKey ?? FALLBACK_CONFIG.dataKey;
  const targetValue = chartData?.targetValue ?? FALLBACK_CONFIG.targetValue;
  const targetLabel = chartData?.targetLabel ?? FALLBACK_CONFIG.targetLabel;
  const data = chartData?.data ?? FALLBACK_DATA;

  // Remap data: use "label" key as the X-axis category key (recharts needs a named key)
  const chartPoints = data.map((pt) => ({
    month: pt.label,
    ...pt,
  }));

  const springValue = useSpring(0, { stiffness: 60, damping: 18 });
  const [refLineY, setRefLineY] = useState(0);

  useEffect(() => {
    springValue.set(targetValue ?? 0);
  }, [springValue, targetValue]);

  useMotionValueEvent(springValue, 'change', (latest) => {
    setRefLineY(Math.round(latest));
  });

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
              style={{ background: palette.legend }}
            />
            {chartData?.label ?? 'Page Views'}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartPoints} barCategoryGap="35%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
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
            cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
          />
          {targetValue != null && (
            <ReferenceLine
              y={refLineY}
              stroke={palette.refLine}
              strokeDasharray="4 3"
              label={{
                value: `${targetLabel} ${targetValue.toLocaleString()}`,
                fill: 'var(--muted-foreground)',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
          )}
          <Bar dataKey={dataKey} fill={palette.bar} radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
