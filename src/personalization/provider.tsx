import { draftMode } from 'next/headers';

import {
  getPersonalizationAudiences,
  getPersonalizationExperiences,
} from '@/services/contentful/personalization';

import { NinetailedProvider } from './ninetailed-nextjs';

export async function PersonalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const [experiences, audiences] = await Promise.all([
    getPersonalizationExperiences({ preview: isEnabled }),
    getPersonalizationAudiences({ preview: isEnabled }),
  ]);

  return (
    <NinetailedProvider
      clientId={process.env.NEXT_PUBLIC_NINETAILED_API_KEY!}
      environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT ?? 'main'}
      experiences={experiences}
      audiences={audiences}
    >
      {children}
    </NinetailedProvider>
  );
}
