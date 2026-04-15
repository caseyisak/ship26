'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CreditCard,
  Settings,
  ArrowUpCircle,
  Layers,
  HeadphonesIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Overview', href: '/dashboard', icon: Home },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Account', href: '/dashboard/account', icon: Settings },
  { label: 'Upgrades', href: '/dashboard/upgrade', icon: ArrowUpCircle },
  { label: 'Services', href: '/dashboard/services', icon: Layers },
  { label: 'Support', href: '/dashboard/support', icon: HeadphonesIcon },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container">
        <nav className="flex overflow-x-auto scrollbar-none" aria-label="Dashboard navigation">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap px-5 py-4 text-sm font-medium border-b-2 transition-colors shrink-0',
                  active
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
