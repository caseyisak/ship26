'use client';

import { createContext, useContext } from 'react';

import type { SiteSettings } from '@/services/contentful/settings';

const SettingsContext = createContext<SiteSettings | null>(null);

export function SettingsProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: SiteSettings | null;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
