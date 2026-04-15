import Link from 'next/link';

import { BlockRenderer } from '@/block-renderer';
import type { DashboardPageData } from '@/services/contentful/dashboard-page';
import { DashboardNav } from '../_components/dashboard-nav';
import { FeatureItemCard } from '../_components/feature-item-card';
import { UpgradeFaqAccordion } from '../_components/upgrade-faq-accordion';

type Props = { page: DashboardPageData | null };

// TODO(#40): Replace hardcoded offer cards with CMS-driven data from dashboardPage slots
const OFFER_CARDS = [
  {
    badge: 'Best overall value!',
    badgeBg: 'bg-accent text-accent-foreground',
    topAccent: null,
    border: 'border-secondary border-2',
    tier: 'Standard Plan',
    name: 'Great for most households',
    description: 'Best for everyday online usage, HD video streaming, smart homes, video calling, and families with multiple devices',
    price: '$—',
    cta: 'Choose Standard Plan',
  },
  {
    badge: null,
    badgeBg: null,
    topAccent: 'bg-accent',
    border: 'border-accent/60 border-2',
    tier: 'Premium Plan',
    name: 'Maximum speed',
    description: 'Best for larger households, heavy online activity, simultaneous usage on many devices, 4K streaming and serious gaming',
    price: '$—',
    cta: 'Choose Premium Plan',
  },
];

export function UpgradeLayout({ page }: Props) {
  return (
    <div className="min-h-screen bg-muted">
      <DashboardNav />

      {/* ── TOP SLOT (above filter tabs) ─────────────────────────────────── */}
      {page?.top ? (
        page.top.__typename === 'FeatureItem'
          ? <FeatureItemCard data={page.top} />
          : <BlockRenderer data={page.top} />
      ) : null}

      <div className="container py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">

          {/* ── Left: Current Plan sidebar ───────────────────────────── */}
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-lg p-6">
              <span className="inline-block bg-foreground text-background text-xs font-semibold px-3 py-1 rounded mb-4">
                Current Plan
              </span>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1.42 7.73a16 16 0 0 1 21.16 0" />
                    <path d="M5 11.54a11 11 0 0 1 14 0" />
                    <path d="M8.53 15.35a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="19" x2="12.01" y2="19" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Your Current Plan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">—</p>
                </div>
              </div>
              <div className="border-t border-border mt-5 pt-4">
                <p className="text-xs text-muted-foreground">Current monthly rate before tax</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-foreground">$—</span>
                  <a href="#" className="text-secondary text-xs hover:underline font-medium">View Billing Info »</a>
                </div>
              </div>
            </div>

            {/* ── MIDDLE SLOT (promo card under current plan) ── */}
            {page?.middle ? (
              page.middle.__typename === 'FeatureItem'
                ? <FeatureItemCard data={page.middle} />
                : <BlockRenderer data={page.middle} />
            ) : null}
          </div>

          {/* ── Right: Upgrade offers ─────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <button className="flex items-center gap-1.5 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-full">
                Available Offers
                <span className="bg-background text-foreground rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">{OFFER_CARDS.length}</span>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-6">
              <span className="text-accent">Upgrade.</span>{' '}Get the plan you need.
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {OFFER_CARDS.map((card) => (
                <div key={card.tier} className={`bg-card rounded-lg overflow-hidden flex flex-col ${card.border}`}>
                  {card.badge ? (
                    <div className={`text-center text-xs font-semibold py-1.5 ${card.badgeBg}`}>{card.badge}</div>
                  ) : (
                    <div className={`h-1.5 w-full ${card.topAccent}`} />
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs text-muted-foreground font-medium">{card.tier}</p>
                    <h3 className="text-lg font-bold text-foreground mt-1">{card.name}</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed flex-1">{card.description}</p>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground">New monthly total without tax</p>
                      <p className="text-3xl font-bold text-foreground mt-0.5">{card.price}</p>
                    </div>
                    <Link
                      href="/dashboard/checkout"
                      className="block w-full bg-secondary text-secondary-foreground text-center font-semibold text-sm py-2.5 rounded mt-4 hover:bg-secondary/90 transition-colors"
                    >
                      {card.cta}
                    </Link>
                    <div className="flex items-center justify-between mt-3">
                      <a href="#" className="text-secondary text-xs hover:underline leading-tight">
                        View Plan Details
                      </a>
                      <span className="text-secondary text-base ml-2">↓</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── BOTTOM SLOT (FAQ) ──────────────────────────────────────────── */}
        {page?.bottom && page.bottom.__typename === 'Faq' && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-5">
              {page.bottom.title ?? 'Common Questions'}
            </h2>
            <UpgradeFaqAccordion faq={page.bottom} />
          </section>
        )}

      </div>
    </div>
  );
}
