'use client';

import { createContext, useContext } from 'react';

import type { NtMergeTagEntry } from '@/services/contentful/personalization';

/** Map from Contentful sys.id → merge tag entry. */
export type MergeTagMap = Map<string, NtMergeTagEntry>;

const MergeTagsContext = createContext<MergeTagMap>(new Map());

export function MergeTagsProvider({
  children,
  mergeTags,
}: {
  children: React.ReactNode;
  mergeTags: NtMergeTagEntry[];
}) {
  const map: MergeTagMap = new Map(mergeTags.map((t) => [t.sys.id, t]));
  return (
    <MergeTagsContext.Provider value={map}>
      {children}
    </MergeTagsContext.Provider>
  );
}

export function useMergeTags(): MergeTagMap {
  return useContext(MergeTagsContext);
}
