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
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

const FALLBACK_PERSONAS: Persona[] = [
  { name: 'Persona A', label: 'New Visitor', customerType: 'new-visitor', color: '#6366f1' },
  { name: 'Persona B', label: 'Returning Customer', customerType: 'returning', color: '#10b981' },
  { name: 'Persona C', label: 'Premium User', customerType: 'premium', color: '#f59e0b' },
];

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

// Persona dropdown — shows displayName as trigger, personas as items, log out
function PersonaDropdown({
  displayName,
  activePersona,
  allPersonas,
  onPersonaChange,
}: {
  displayName: string;
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
          aria-label="Account menu"
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: activePersona.color }}
            aria-hidden="true"
          />
          <span className="text-foreground">{displayName}</span>
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
              <span className="flex-1">{p.label}</span>
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

type Props = {
  loggedInMetadata: Record<string, unknown> | null;
};

export function DashboardTopBar({ loggedInMetadata }: Props) {
  const [activePersona, setActivePersona] = useState<Persona | null>(null);

  const personas: Persona[] =
    Array.isArray(loggedInMetadata?.personas) && loggedInMetadata.personas.length > 0
      ? (loggedInMetadata.personas as Persona[])
      : FALLBACK_PERSONAS;

  useEffect(() => {
    setActivePersona(getPersona());
  }, []);

  const allPersonas = personas.length > 0 ? personas : FALLBACK_PERSONAS;

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

      {/* Right: persona dropdown + gear */}
      <div className="flex items-center gap-2 px-3 shrink-0 border-l border-border">
        {activePersona && (
          <PersonaDropdown
            displayName={activePersona.displayName || activePersona.label}
            activePersona={activePersona}
            allPersonas={allPersonas}
            onPersonaChange={(p) => setActivePersona(p)}
          />
        )}
        <Separator orientation="vertical" className="h-4" />
        <NtGearButton />
      </div>
    </header>
  );
}
