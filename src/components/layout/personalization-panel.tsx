'use client';

import { useNinetailed, useProfile } from '@ninetailed/experience.js-react';
import { RotateCcw, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useLocalAudiences } from '@/personalization/local-audience-context';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AudienceDefinition = {
  id: string;
  name: string;
};

type Props = {
  audienceDefinitions: AudienceDefinition[];
};

/**
 * PersonalizationPanelHost
 *
 * Mounts inside the NinetailedProvider context. Exposes toggle via
 * window.__ntPanel.toggle() so the navbar gear button can open/close it
 * without prop drilling through the layout tree.
 *
 * Fixes:
 * - Reset button: calls ninetailed.reset() then window.location.reload()
 *   so the demo audience state is fully cleared and the page re-evaluates.
 * - Audience indicator: reads profile.audiences reactively via useProfile()
 *   and maps IDs to names from the audience definitions fetched from Contentful.
 */
export function PersonalizationPanelHost({ audienceDefinitions }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    (window as { __ntPanel?: { toggle: () => void } }).__ntPanel = {
      toggle: () => setIsOpen((v) => !v),
    };
    return () => {
      delete (window as { __ntPanel?: unknown }).__ntPanel;
    };
  }, []);

  return (
    <PersonalizationPanel
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      audienceDefinitions={audienceDefinitions}
    />
  );
}

function PersonalizationPanel({
  isOpen,
  onClose,
  audienceDefinitions,
}: {
  isOpen: boolean;
  onClose: () => void;
  audienceDefinitions: AudienceDefinition[];
}) {
  const ninetailed = useNinetailed();
  const profileState = useProfile();

  const [resetting, setResetting] = useState(false);

  // profile.audiences contains IDs from NT cloud evaluation (empty when disconnected).
  // Merge with locally-evaluated audiences from LocalAudienceEvaluator so the panel
  // shows correct state even when NT cloud is not connected to this environment.
  const { matchedAudienceIds: localAudienceIds } = useLocalAudiences();
  const sdkAudienceIds: string[] = profileState.profile?.audiences ?? [];
  const activeAudienceIds = [
    ...new Set([...sdkAudienceIds, ...localAudienceIds]),
  ];
  const activeAudiences = audienceDefinitions.filter((a) =>
    activeAudienceIds.includes(a.id),
  );

  const handleReset = async () => {
    setResetting(true);
    try {
      await ninetailed.reset();
      // Clear search panel chat state so lamp conversation doesn't persist
      sessionStorage.removeItem('search-panel-state');
    } finally {
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-[9999] h-full w-72 shadow-xl',
          'bg-background border-border flex flex-col border-l',
        )}
        role="dialog"
        aria-label="Personalization panel"
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Personalization</span>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Audience section */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Active Audiences
            </span>
          </div>

          {activeAudiences.length > 0 ? (
            <ul className="space-y-2">
              {activeAudiences.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                  <span>{a.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">
              No active audiences — profile is anonymous.
            </p>
          )}

          {profileState.loading && (
            <p className="text-muted-foreground mt-2 text-xs">Loading…</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-border border-t px-4 py-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleReset}
            disabled={resetting}
          >
            <RotateCcw className={cn('h-4 w-4', resetting && 'animate-spin')} />
            {resetting ? 'Resetting…' : 'Reset Profile'}
          </Button>
          <p className="text-muted-foreground mt-2 text-center text-[10px]">
            Clears NT profile and reloads the page
          </p>
        </div>
      </div>
    </>
  );
}
