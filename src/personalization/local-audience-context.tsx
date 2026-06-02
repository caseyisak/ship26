'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type LocalAudienceState = {
  matchedAudienceIds: string[];
  setMatchedAudienceIds: (ids: string[]) => void;
};

const LocalAudienceContext = createContext<LocalAudienceState>({
  matchedAudienceIds: [],
  setMatchedAudienceIds: () => {},
});

/**
 * Provides locally-evaluated audience match state.
 *
 * LocalAudienceEvaluator writes matched audience IDs here after evaluating
 * rules client-side. Panels (PersonalizationPanel, ProfilePreviewer) read
 * from this context to display correct audience state even when NT cloud
 * is disconnected and profile.audiences is empty.
 */
export function LocalAudienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [matchedAudienceIds, setMatchedAudienceIds] = useState<string[]>([]);
  const value = useMemo(
    () => ({ matchedAudienceIds, setMatchedAudienceIds }),
    [matchedAudienceIds],
  );
  return (
    <LocalAudienceContext.Provider value={value}>
      {children}
    </LocalAudienceContext.Provider>
  );
}

export const useLocalAudiences = () => useContext(LocalAudienceContext);
