import { Check } from 'lucide-react';

import { BlockRenderer } from '@/block-renderer';
import type { DashboardPageData } from '@/services/contentful/dashboard-page';
import { CheckoutFooter } from '../_components/checkout-footer';
import { FeatureItemCard } from '../_components/feature-item-card';

type Props = { page: DashboardPageData | null };

const STEPS = [
  { label: 'Package Selection', done: true },
  { label: 'Add Ons', done: true },
  { label: 'Review Info', done: false, current: true },
];

function CheckoutStepper() {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
              step.done || step.current
                ? 'bg-secondary border-secondary text-secondary-foreground'
                : 'bg-card border-border text-muted-foreground',
            ].join(' ')}>
              {step.done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
            </div>
            <span className={[
              'text-xs font-medium whitespace-nowrap',
              step.done || step.current ? 'text-secondary' : 'text-muted-foreground',
            ].join(' ')}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={['h-0.5 w-24 sm:w-40 mx-1 mb-5 shrink-0', step.done ? 'bg-secondary' : 'bg-border'].join(' ')} />
          )}
        </div>
      ))}
    </div>
  );
}

export function CheckoutLayout({ page }: Props) {
  return (
    <div className="min-h-screen bg-muted flex flex-col">

      <div className="bg-card border-b border-border">
        <div className="container py-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div />
            <CheckoutStepper />
            <div className="hidden sm:flex items-center justify-end gap-1 text-sm text-muted-foreground whitespace-nowrap">
              Plans available for your area
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10 max-w-2xl mx-auto flex-1 space-y-6 pb-32">

        {/* ── TOP SLOT ─────────────────────────────────────────────────── */}
        {page?.top ? (
          page.top.__typename === 'FeatureItem'
            ? <FeatureItemCard data={page.top} />
            : <BlockRenderer data={page.top} />
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Your selected plan</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Enter your contact information
            </h1>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-8 py-5 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">Your Info</h3>
          </div>
          <div className="p-8 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">First Name <span className="text-accent">*</span></label>
                <input type="text" placeholder="First name" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Last Name <span className="text-accent">*</span></label>
                <input type="text" placeholder="Last name" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Email Address <span className="text-accent">*</span></label>
                <input type="email" placeholder="you@example.com" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Phone Number <span className="text-accent">*</span></label>
                <input type="tel" placeholder="(555) 000-0000" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Service Address <span className="text-accent">*</span></label>
              <input type="text" placeholder="Street address" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-[1fr_100px_120px]">
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">City</label>
                <input type="text" placeholder="City" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">State</label>
                <input type="text" placeholder="ST" maxLength={2} className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">ZIP Code</label>
                <input type="text" placeholder="00000" maxLength={5} className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <CheckoutFooter />

    </div>
  );
}
