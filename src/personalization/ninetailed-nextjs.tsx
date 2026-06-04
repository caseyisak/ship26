'use client';

// crypto.randomUUID is only available in secure contexts (HTTPS).
// In HTTP dev environments, polyfill it so the Ninetailed SDK doesn't crash.
if (
  typeof globalThis.crypto !== 'undefined' &&
  typeof globalThis.crypto.randomUUID !== 'function'
) {
  (
    globalThis.crypto as typeof globalThis.crypto & {
      randomUUID: () => `${string}-${string}-${string}-${string}-${string}`;
    }
  ).randomUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  };
}

import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-plugin-preview';
import {
  type ExperienceConfiguration,
  NinetailedProvider as ReactNinetailedProvider,
  useNinetailed,
} from '@ninetailed/experience.js-react';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';

import type {
  NtAudienceFragment,
  NtExperienceFragment,
} from '@/block-renderer/types';

import { PageTracker } from '@/components/personalization/page-tracker';
import { LocalAudienceProvider } from './local-audience-context';
import { LocalAudienceEvaluator } from './local-audience-evaluator';
import { mapAudiences, mapExperiences } from './utils';

const SPACE_ID = 'uumzxfocy3ef';

// Global context so block-renderer can use all NT experiences without
// requiring ntExperiencesCollection in every page query (LL-011 byte limit).
export const NtExperiencesContext = createContext<ExperienceConfiguration[]>(
  [],
);
export const useNtExperiences = () => useContext(NtExperiencesContext);

function Tracker() {
  const pathname = usePathname();
  const ninetailed = useNinetailed();
  const lastFired = useRef('none');
  useEffect(() => {
    if (lastFired.current !== pathname) {
      ninetailed.page();
      lastFired.current = pathname;
    }
  }, [pathname, ninetailed]);
  return null;
}

export function NinetailedProvider({
  children,
  experiences,
  audiences,
  clientId,
  environment,
}: {
  children: React.ReactNode;
  experiences: NtExperienceFragment[];
  audiences: NtAudienceFragment[];
  clientId: string;
  environment: string;
}) {
  // useMemo prevents new array references on every render, which would
  // cause LocalAudienceEvaluator's useEffect to re-subscribe on every cycle.
  const mappedExperiences = useMemo(
    () => (mapExperiences(experiences) ?? []) as ExperienceConfiguration[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [experiences.map((e) => e.sys.id).join(',')],
  );
  const mappedAudiences = useMemo(
    () => mapAudiences(audiences) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audiences.map((a) => a.sys.id).join(',')],
  );

  // Stable plugin instance — must NOT be recreated on every render.
  // v7.9+ enforces singleton; a new instance per render resets variant state
  // and breaks preview panel click → variant swap.
  const previewPlugin = useMemo(
    () =>
      new NinetailedPreviewPlugin({
        experiences: mappedExperiences,
        audiences: mappedAudiences,
        onOpenExperienceEditor: (exp) =>
          window.open(
            `https://app.contentful.com/spaces/${SPACE_ID}/entries/${exp.id}`,
            '_blank',
          ),
        onOpenAudienceEditor: (aud) =>
          window.open(
            `https://app.contentful.com/spaces/${SPACE_ID}/entries/${aud.id}`,
            '_blank',
          ),
        // Hide the native purple floating button — gear icon in nav triggers
        // toggle() directly via window.ninetailed.plugins.preview.toggle()
        ui: { opener: { hide: true } },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mappedExperiences, mappedAudiences],
  );

  return (
    <NtExperiencesContext.Provider value={mappedExperiences}>
      <ReactNinetailedProvider
        clientId={clientId}
        environment={environment}
        useSDKEvaluation={true}
        plugins={[previewPlugin]}
      >
        <LocalAudienceProvider>
          <Tracker />
          <PageTracker traits={{}} />
          <LocalAudienceEvaluator audiences={mappedAudiences} />
          {children}
        </LocalAudienceProvider>
      </ReactNinetailedProvider>
    </NtExperiencesContext.Provider>
  );
}
