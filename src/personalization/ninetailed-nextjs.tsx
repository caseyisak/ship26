'use client';

import {
  NinetailedProvider as ReactNinetailedProvider,
  useNinetailed,
} from '@ninetailed/experience.js-react';
import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-plugin-preview';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import type { NtAudienceFragment, NtExperienceFragment } from '@/block-renderer/types';

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
  return (
    <ReactNinetailedProvider
      clientId={clientId}
      environment={environment}
      plugins={[
        new NinetailedPreviewPlugin({
          experiences: mapExperiences(experiences) ?? [],
          audiences: mapAudiences(audiences) ?? [],
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
      {children}
    </ReactNinetailedProvider>
  );
}
