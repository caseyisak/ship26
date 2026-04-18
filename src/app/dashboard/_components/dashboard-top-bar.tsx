'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Check } from 'lucide-react';
import { useNinetailed } from '@ninetailed/experience.js-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { clearPersona, getPersona, setPersona } from '@/lib/persona-session';
import type { Persona } from '@/lib/persona-session';
import type { DashboardSettingsData } from '@/services/contentful/dashboard-settings';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

// Gear button — opens the NT personalization panel via the preview plugin
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

// Persona dropdown — shows active persona, allows switching, log out
function PersonaDropdown({
  activePersona,
  allPersonas,
  onPersonaChange,
}: {
  activePersona: Persona;
  allPersonas: Persona[];
  onPersonaChange: (p: Persona | null) => void;
}) {
  const ninetailed = useNinetailed();
  const router = useRouter();

  const handleSwitch = (persona: Persona) => {
    setPersona(persona);
    onPersonaChange(persona);
    router.refresh();
  };

  const handleLogout = () => {
    ninetailed.reset();
    clearPersona();
    onPersonaChange(null);
    router.push('/page/home');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 h-7 rounded-none border border-border bg-card px-2.5 text-xs font-medium hover:bg-accent transition-colors shrink-0"
          aria-label="Persona menu"
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: activePersona.color }}
            aria-hidden="true"
          />
          <span className="text-foreground">{activePersona.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-none">
        {allPersonas.map((p) => {
          const isActive = p.customerType === activePersona.customerType;
          return (
            <DropdownMenuItem
              key={p.customerType}
              onClick={() => !isActive && handleSwitch(p)}
              className="gap-2 cursor-pointer"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: p.color }}
                aria-hidden="true"
              />
              <span className="flex-1">
                {p.label}
              </span>
              {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DashboardTopBar() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    setIsDemoMode(process.env.NEXT_PUBLIC_DEMO_MODE === 'true');

    // Read active persona from localStorage
    const persona = getPersona();
    setActivePersona(persona);

    // Fetch all personas from the API route
    fetch('/api/dashboard-settings')
      .then((r) => r.json())
      .then((data: DashboardSettingsData | null) => {
        if (!data) return;
        const list: Persona[] = [data.personaA, data.personaB, data.personaC].filter(
          (p): p is Persona => Boolean(p),
        );
        if (list.length > 0) setAllPersonas(list);
        // If we don't have an active persona yet, try first in list
        if (!persona && list.length > 0) {
          setActivePersona(list[0]);
        }
      })
      .catch(() => {
        // API unavailable — keep fallback
      });
  }, []);

  // Fallback personas for when the API hasn't loaded yet
  const personasForDropdown =
    allPersonas.length > 0
      ? allPersonas
      : [
          { name: 'Persona A', label: 'New Visitor', customerType: 'new-visitor', color: '#6366f1' },
          { name: 'Persona B', label: 'Returning', customerType: 'returning', color: '#10b981' },
          { name: 'Persona C', label: 'Premium', customerType: 'premium', color: '#f59e0b' },
        ];

  return (
    <header className="flex h-12 shrink-0 items-center gap-0 border-b border-border bg-card z-40">
      {/* Left: sidebar toggle + breadcrumb */}
      <div className="flex items-center gap-2 px-3 shrink-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">Dashboard</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: persona dropdown + gear (demo mode only) */}
      <div className="flex items-center gap-2 px-3 shrink-0 border-l border-border">
        {activePersona && (
          <PersonaDropdown
            activePersona={activePersona}
            allPersonas={personasForDropdown}
            onPersonaChange={(p) => setActivePersona(p)}
          />
        )}
        {isDemoMode && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <NtGearButton />
          </>
        )}
      </div>
    </header>
  );
}
