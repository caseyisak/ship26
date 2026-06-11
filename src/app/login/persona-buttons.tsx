'use client';

import { useNinetailed } from '@ninetailed/experience.js-react';
import { useRouter } from 'next/navigation';

import { NT_EVENTS } from '@/lib/nt-events';
import type { Persona } from '@/lib/persona-session';
import { setPersona } from '@/lib/persona-session';

type Props = {
  personas: Array<Persona & { key: string }>;
  /** Called after sign-in completes — use to close a parent modal. */
  onSuccess?: () => void;
};

export function PersonaButtons({ personas, onSuccess }: Props) {
  const router = useRouter();
  const { track } = useNinetailed();

  const handleSignIn = (persona: Persona) => {
    setPersona(persona);
    track(NT_EVENTS.AUTH_COMPLETED, {
      authType: 'signup',
      segment: persona.customer_type ?? (persona as Record<string, unknown>).customerType ?? '',
    } as Record<string, string>);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {personas.map((persona) => (
        <button
          key={persona.key}
          onClick={() => handleSignIn(persona)}
          className="flex items-center gap-3 w-full px-5 py-4 rounded-none border border-border bg-card hover:bg-accent transition-colors text-left group"
        >
          <span
            className="shrink-0 h-3 w-3 rounded-full"
            style={{ background: persona.color }}
            aria-hidden="true"
          />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-foreground group-hover:text-foreground">
              Sign in as {persona.name}
            </span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              {persona.label}
            </span>
          </span>
          <span
            className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-sm text-white"
            style={{ background: persona.color }}
          >
            {persona.customer_type}
          </span>
        </button>
      ))}
    </div>
  );
}
