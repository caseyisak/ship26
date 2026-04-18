'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import {
  CreditCard,
  Settings,
  ArrowUpCircle,
  Layers,
  HeadphonesIcon,
  BarChart3,
  LayoutDashboard,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Upgrades', href: '/dashboard/upgrade', icon: ArrowUpCircle },
  { label: 'Services', href: '/dashboard/services', icon: Layers },
  { label: 'Account', href: '/dashboard/account', icon: Settings },
  { label: 'Support', href: '/dashboard/support', icon: HeadphonesIcon },
];

type AppSidebarProps = {
  siteTitle?: string;
  siteHomeUrl?: string;
};

/**
 * AppSidebar — collapsible icon sidebar with site branding + nav items.
 * siteTitle/siteHomeUrl come from dashboardSettings so editors can change them.
 */
export function AppSidebar({ siteTitle = 'Metafi', siteHomeUrl = '/page/home' }: AppSidebarProps) {
  const pathname = usePathname();
  const initial = siteTitle.charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border py-4 px-4">
        <Link
          href={siteHomeUrl}
          className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center hover:opacity-80 transition-opacity"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold text-xs">
            {initial}
          </div>
          <span className="font-semibold text-sm text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {siteTitle}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={label}>
                      <Link href={href}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
