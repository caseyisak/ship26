'use client';

import { useNinetailed } from '@ninetailed/experience.js-react';
import { useEffect } from 'react';

export function PageTracker({ traits }: { traits: Record<string, string | number | boolean | null> }) {
  const { identify } = useNinetailed();
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    identify('visitor', traits as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
