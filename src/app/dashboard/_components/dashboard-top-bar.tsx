'use client';

import { useEffect, useState } from 'react';
import { JetBrains_Mono } from 'next/font/google';
import { Settings, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNinetailed } from '@ninetailed/experience.js-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { LoginModal } from '@/components/layout/login-modal';
import { useSettings } from '@/personalization/settings-context';
import { PERSONAS } from '@/components/persona-switcher';

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
});

// ─── KPI strip data ──────────────────────────────────────────────────────────

const KPI_STATS = [
  { label: 'Active Users', value: '24,891', delta: 12 },
  { label: 'Content Published', value: '1,204', delta: 8 },
  { label: 'Page Views', value: '318K', delta: -3 },
  { label: 'Conversion Rate', value: '4.7%', delta: 21 },
  { label: 'API Calls', value: '2.1M', delta: 5 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiStatItem({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: number;
}) {
  const isUp = delta >= 0;
  return (
    <div className="flex flex-col gap-0.5 px-4 shrink-0">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-none">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('text-sm font-semibold leading-none', jetBrainsMono.className)}>
          {value}
        </span>
        <span
          className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium leading-none',
            isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
          )}
        >
          {isUp ? (
            <ArrowUpRight className="h-2.5 w-2.5 shrink-0" />
          ) : (
            <ArrowDownRight className="h-2.5 w-2.5 shrink-0" />
          )}
          {isUp ? '+' : ''}{delta}%
        </span>
      </div>
    </div>
  );
}

// Gear button — calls window.ninetailed.plugins.preview.toggle() (same as main navbar)
function NtGearButton() {
  const handleClick = () => {
    (
      window as unknown as {
        ninetailed?: { plugins?: { preview?: { toggle?: () => void } } };
      }
    ).ninetailed?.plugins?.preview?.toggle?.();
  };
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      className="h-7 w-7 p-0 shrink-0"
      aria-label="Open personalization panel"
    >
      <Settings className="h-3.5 w-3.5" />
    </Button>
  );
}

// Persona pills — compact A/B/C buttons
type WindowNT = {
  ninetailed?: {
    plugins?: {
      preview?: {
        activateAudience: (id: string) => void;
        resetAudience: (id: string) => void;
      };
    };
  };
};

function PersonaPills() {
  const ninetailed = useNinetailed();
  const allAudienceIds = PERSONAS.map((p) => p.audienceId);

  const handlePersona = async (persona: typeof PERSONAS[0]) => {
    await ninetailed.identify('visitor', { customerType: persona.customerType });
    const win = window as unknown as WindowNT;
    const preview = win.ninetailed?.plugins?.preview;
    if (!preview) return;
    allAudienceIds.forEach((id) => { if (id) preview.resetAudience(id); });
    if (persona.audienceId) preview.activateAudience(persona.audienceId);
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {PERSONAS.map((persona) => (
        <button
          key={persona.customerType}
          onClick={() => handlePersona(persona)}
          className={cn(
            'text-white text-[10px] font-bold px-2 py-1 leading-none rounded-sm transition-colors shrink-0',
            persona.color,
          )}
          title={`Simulate ${persona.label} (${persona.customerType})`}
        >
          {persona.label.replace('Persona ', '')}
        </button>
      ))}
    </div>
  );
}

// Login/logout — mirrors the main site nav button
function DashboardLoginButton() {
  const ninetailed = useNinetailed();
  const settings = useSettings();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const metadata = settings?.loggedInMetadata as Record<string, unknown> | null | undefined;
  const initials =
    [metadata?.firstName, metadata?.lastName]
      .filter(Boolean)
      .map((n) => (n as string)[0].toUpperCase())
      .join('') || 'U';

  const handleLogin = () => {
    setIsLoggedIn(true);
    setModalOpen(false);
  };

  const handleLogout = () => {
    ninetailed.reset();
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
          {initials}
        </div>
        <Button size="sm" variant="outline" onClick={handleLogout} className="h-7 text-xs px-2">
          Log Out
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setModalOpen(true)}
        className="h-7 text-xs px-2 shrink-0"
      >
        Login
      </Button>
      <LoginModal open={modalOpen} onOpenChange={setModalOpen} onLogin={handleLogin} />
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DashboardTopBar() {
  // Read DEMO_MODE client-side to avoid hydration mismatch
  const [isDemoMode, setIsDemoMode] = useState(false);
  useEffect(() => {
    setIsDemoMode(process.env.NEXT_PUBLIC_DEMO_MODE === 'true');
  }, []);

  return (
    <header className="flex h-14 items-center gap-0 border-b border-border bg-card sticky top-0 z-40 overflow-hidden">
      {/* Left: sidebar toggle + breadcrumb */}
      <div className="flex items-center gap-2 px-3 shrink-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Dashboard</span>
      </div>

      <Separator orientation="vertical" className="h-8 shrink-0" />

      {/* Center: KPI stat strip — scrollable on narrow viewports */}
      <div className="flex items-center flex-1 overflow-x-auto scrollbar-none min-w-0">
        <div className="flex items-center divide-x divide-border">
          {KPI_STATS.map((stat) => (
            <KpiStatItem
              key={stat.label}
              label={stat.label}
              value={stat.value}
              delta={stat.delta}
            />
          ))}
        </div>
      </div>

      {/* Right: gear + personas + login */}
      <div className="flex items-center gap-2 px-3 shrink-0 border-l border-border ml-auto">
        {isDemoMode && (
          <>
            <NtGearButton />
            <Separator orientation="vertical" className="h-4" />
            <PersonaPills />
            <Separator orientation="vertical" className="h-4" />
          </>
        )}
        <DashboardLoginButton />
      </div>
    </header>
  );
}
