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
  BarChart3,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { PersonaSwitcher } from '@/components/persona-switcher';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: Home },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Upgrades', href: '/dashboard/upgrade', icon: ArrowUpCircle },
  { label: 'Services', href: '/dashboard/services', icon: Layers },
  { label: 'Account', href: '/dashboard/account', icon: Settings },
  { label: 'Support', href: '/dashboard/support', icon: HeadphonesIcon },
];

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border py-4 px-4">
        {/* Logo — full expanded state */}
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold text-xs">
            M
          </div>
          <span className="font-semibold text-sm text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Metafi
          </span>
        </div>
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
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                    >
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

      {isDemoMode && (
        <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Demo Personas
            </span>
            <PersonaSwitcher />
          </div>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
