import Link from 'next/link';

import { BlockRenderer } from '@/block-renderer';
import type { DashboardPageData } from '@/services/contentful/dashboard-page';
import { DashboardNav } from '../_components/dashboard-nav';
import { FeatureItemCard } from '../_components/feature-item-card';

type Props = { page: DashboardPageData | null };

export function HomeLayout({ page }: Props) {
  return (
    <div className="min-h-screen bg-muted">
      <DashboardNav />

      {page?.top ? <BlockRenderer data={page.top} /> : null}

      <div className="container py-6 space-y-5">

        {/* ── Row 1: Welcome + Billing Summary ─────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">

          {/* Welcome card */}
          <div className="bg-card rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-foreground leading-snug">
              Welcome back to your account.
            </h2>
            <div className="mt-6 flex justify-center">
              <div className="w-48 h-36 bg-muted rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 180 130" className="w-44 h-32 opacity-40" aria-hidden="true">
                  <circle cx="70" cy="28" r="12" fill="currentColor" />
                  <line x1="70" y1="40" x2="70" y2="85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="70" y1="55" x2="50" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="70" y1="55" x2="90" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="70" y1="85" x2="55" y2="110" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="70" y1="85" x2="85" y2="110" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="115" cy="28" r="12" fill="currentColor" />
                  <line x1="115" y1="40" x2="115" y2="85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="115" y1="55" x2="95" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="115" y1="55" x2="135" y2="72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="115" y1="85" x2="100" y2="110" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="115" y1="85" x2="130" y2="110" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Billing summary card */}
          <div className="bg-card rounded-lg p-6 flex flex-col">
            <div className="space-y-2.5 text-sm">
              {[
                ['Amount of Last Bill', '—'],
                ['Billing Date', '—'],
                ['Last Payment', '—'],
                ['Last Payment Date', '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AutoPay</span>
                <a href="#" className="text-secondary text-xs font-semibold hover:underline">Sign Up</a>
              </div>
            </div>
            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-foreground">Account Balance</span>
                <span className="text-3xl font-bold text-foreground">$0.00</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <a href="#" className="text-secondary text-sm font-medium hover:underline">View My Bills</a>
              <button className="ml-auto bg-secondary text-secondary-foreground text-sm px-4 py-2 rounded font-semibold hover:bg-secondary/90 transition-colors">
                Make a Payment
              </button>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              View Recent Transaction History
              <a href="#" className="text-secondary font-medium hover:underline ml-1">Recent Transactions →</a>
            </div>
          </div>
        </div>

        {/* ── Row 2: Account Management + Promo Slot ───────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          <div className="bg-card rounded-lg p-8">
            <h3 className="text-lg font-semibold text-foreground">Managing your account is easy.</h3>
            <div className="mt-5 flex justify-center">
              <div className="w-36 h-28 bg-muted rounded flex items-center justify-center">
                <svg viewBox="0 0 120 90" className="w-32 h-24 opacity-40" aria-hidden="true">
                  <circle cx="60" cy="18" r="10" fill="currentColor" />
                  <line x1="60" y1="28" x2="60" y2="60" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="60" y1="42" x2="42" y2="55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="60" y1="42" x2="78" y2="55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="60" y1="60" x2="48" y2="80" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="60" y1="60" x2="72" y2="80" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <rect x="28" y="56" width="64" height="4" rx="2" fill="currentColor" opacity="0.5" />
                  <rect x="34" y="46" width="28" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              With your online account manager you can pay your bills, update your profile information, and check your services.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <button className="bg-secondary text-secondary-foreground text-sm px-5 py-2 rounded font-semibold hover:bg-secondary/90 transition-colors">
                Manage Profile
              </button>
              <a href="#" className="text-secondary text-sm font-medium hover:underline">Live Chat &gt;</a>
            </div>
          </div>

          {/* ── MIDDLE SLOT ── CMS-driven promo / personalization zone */}
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Messages for You</h3>
            {page?.middle ? (
              page.middle.__typename === 'FeatureItem'
                ? <FeatureItemCard data={page.middle} />
                : <BlockRenderer data={page.middle} />
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                No messages at this time.
              </div>
            )}
            <div className="mt-4">
              <Link
                href="/dashboard/upgrade"
                className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                See upgrade options →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Row 3: Billing Preferences + Service Snapshot ───────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Billing Preferences</h3>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">AutoPay</span>
              <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                <span>OFF</span>
                <span className="text-muted-foreground text-lg leading-none">›</span>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Your Service Snapshot</h3>
            <p className="text-sm font-semibold text-foreground">Your Plan</p>
            <p className="text-xs text-muted-foreground mt-1">—</p>
            <a href="#" className="text-secondary text-xs font-medium mt-3 inline-block hover:underline">View service details →</a>
          </div>
        </div>

      </div>
    </div>
  );
}
