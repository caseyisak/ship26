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
import { useEffect, useRef } from 'react';

import { PersonalizationPanelHost } from '@/components/layout/personalization-panel';
import type {
  NtAudienceFragment,
  NtExperienceFragment,
} from '@/block-renderer/types';

import { mapAudiences, mapExperiences } from './utils';

const SPACE_ID = 'uumzxfocy3ef';

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
  const mappedAudiences = mapAudiences(audiences) ?? [];

  return (
    <ReactNinetailedProvider
      clientId={clientId}
      environment={environment}
      plugins={[
        new NinetailedPreviewPlugin({
          experiences: (mapExperiences(experiences) ??
            []) as ExperienceConfiguration[],
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
          ui: { opener: { hide: true } },
        }),
      ]}
    >
      <Tracker />
      <PersonalizationPanelHost audienceDefinitions={mappedAudiences} />
      {children}
    </ReactNinetailedProvider>
  );
}
