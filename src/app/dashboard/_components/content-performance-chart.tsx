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

const mixBase = 'var(--background)';
const palette = {
  primary: 'var(--primary)',
  secondary: `color-mix(in oklch, var(--primary) 75%, ${mixBase})`,
  tertiary: `color-mix(in oklch, var(--primary) 55%, ${mixBase})`,
};

const data = [
  { month: 'Oct', views: 3200, published: 18 },
  { month: 'Nov', views: 4100, published: 22 },
  { month: 'Dec', views: 3800, published: 15 },
  { month: 'Jan', views: 5200, published: 29 },
  { month: 'Feb', views: 4800, published: 24 },
  { month: 'Mar', views: 6100, published: 31 },
  { month: 'Apr', views: 5700, published: 27 },
];

const TARGET_VIEWS = 5000;

export function ContentPerformanceChart() {
  const springValue = useSpring(0, { stiffness: 60, damping: 18 });
  const [refLineY, setRefLineY] = useState(0);

  useEffect(() => {
    springValue.set(TARGET_VIEWS);
  }, [springValue]);

  useMotionValueEvent(springValue, 'change', (latest) => {
    setRefLineY(Math.round(latest));
  });

  return (
    <div className="bg-card border border-border rounded-none p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Content Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monthly page views with target reference
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: palette.primary }}
            />
            Page Views
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="35%">
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
          <ReferenceLine
            y={refLineY}
            stroke={palette.tertiary}
            strokeDasharray="4 3"
            label={{
              value: `Target ${TARGET_VIEWS.toLocaleString()}`,
              fill: 'var(--muted-foreground)',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Bar dataKey="views" fill={palette.primary} radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
