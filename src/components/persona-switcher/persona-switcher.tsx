'use client';

import { useNinetailed } from '@ninetailed/experience.js-react';

/**
 * PersonaSwitcher — demo-mode only component.
 *
 * Renders 3 persona buttons. Each button:
 *   1. Calls ninetailed.identify() to set the customerType trait (for analytics + cloud eval)
 *   2. Calls window.ninetailed.plugins.preview.activateAudience() to force local variant swap
 *      (per LL-024 — this is the only API that reliably triggers variant evaluation client-side)
 *
 * Only visible when NEXT_PUBLIC_DEMO_MODE=true OR running in dev/preview environments
 * (detected by the absence of a production host check). Gate is enforced by the parent
 * component that conditionally renders this — not inline here.
 *
 * Persona map (must match NT audiences created in Contentful NT app):
 *   Persona A — customerType: new-visitor  → "Customer Type — New Visitor"
 *   Persona B — customerType: returning    → "Customer Type — Returning"
 *   Persona C — customerType: premium      → "Customer Type — Premium"
 */

type Persona = {
  label: string;
  customerType: string;
  audienceId: string;
  color: string;
};

// Audience IDs must be set after creating audiences in the NT app.
// Replace these placeholder IDs once audiences are created in Contentful.
export const PERSONAS: Persona[] = [
  {
    label: 'Persona A',
    customerType: 'new-visitor',
    audienceId: process.env.NEXT_PUBLIC_NT_AUDIENCE_NEW_VISITOR ?? '',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    label: 'Persona B',
    customerType: 'returning',
    audienceId: process.env.NEXT_PUBLIC_NT_AUDIENCE_RETURNING ?? '',
    color: 'bg-emerald-500 hover:bg-emerald-600',
  },
  {
    label: 'Persona C',
    customerType: 'premium',
    audienceId: process.env.NEXT_PUBLIC_NT_AUDIENCE_PREMIUM ?? '',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
];

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

function activatePersonaAudience(audienceId: string, allAudienceIds: string[]) {
  const win = window as unknown as WindowNT;
  const preview = win.ninetailed?.plugins?.preview;
  if (!preview) return;
  // Reset all persona audiences, then activate the selected one
  allAudienceIds.forEach((id) => {
    if (id) preview.resetAudience(id);
  });
  if (audienceId) {
    preview.activateAudience(audienceId);
  }
}

export function PersonaSwitcher() {
  const ninetailed = useNinetailed();
  const allAudienceIds = PERSONAS.map((p) => p.audienceId);

  const handlePersona = async (persona: Persona) => {
    // Step 1: Identify with customerType trait (for NT cloud + analytics)
    await ninetailed.identify('visitor', { customerType: persona.customerType });
    // Step 2: Force local audience activation via preview plugin (LL-024)
    activatePersonaAudience(persona.audienceId, allAudienceIds);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-1">
        Simulate:
      </span>
      {PERSONAS.map((persona) => (
        <button
          key={persona.customerType}
          onClick={() => handlePersona(persona)}
          className={[
            'text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors',
            persona.color,
          ].join(' ')}
        >
          {persona.label}
        </button>
      ))}
    </div>
  );
}
