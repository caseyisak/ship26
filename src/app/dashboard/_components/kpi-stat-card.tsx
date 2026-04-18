'use client';

import { JetBrains_Mono } from 'next/font/google';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

type KpiStatCardProps = {
  label: string;
  value: string;
  delta: number; // percent, positive = up, negative = down
  deltaLabel?: string;
};

export function KpiStatCard({
  label,
  value,
  delta,
  deltaLabel = 'vs Last Month',
}: KpiStatCardProps) {
  const isUp = delta >= 0;

  return (
    <div className="bg-card flex flex-col gap-1 border border-border p-4 rounded-none min-w-0 overflow-hidden">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className={cn('text-2xl font-semibold tracking-tight', jetBrainsMono.className)}
      >
        {value}
      </p>
      <div
        className={cn(
          'flex items-center gap-1 text-xs font-medium',
          isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
        )}
      >
        {isUp ? (
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>
          {isUp ? '+' : ''}
          {delta}%
        </span>
        <span className="text-muted-foreground font-normal">{deltaLabel}</span>
      </div>
    </div>
  );
}
