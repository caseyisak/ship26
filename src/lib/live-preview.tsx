'use client';

import {
  ContentfulLivePreviewProvider,
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from '@contentful/live-preview/react';
import React from 'react';

type LivePreviewProviderProps = {
  children: React.ReactNode;
  locale?: string;
  space?: string;
  environment?: string;
};

export function LivePreviewProvider({
  children,
  locale = 'en-US',
  space,
  environment,
}: LivePreviewProviderProps) {
  return (
    <ContentfulLivePreviewProvider
      locale={locale}
      space={space}
      environment={environment}
      enableInspectorMode
      enableLiveUpdates
    >
      {children}
    </ContentfulLivePreviewProvider>
  );
}

export function useLiveUpdates<T>(data: T): T {
  return useContentfulLiveUpdates(
    data as Parameters<typeof useContentfulLiveUpdates>[0],
  ) as T;
}

export function useContentfulInspectorModeProps(entryId: string) {
  return useContentfulInspectorMode({ entryId });
}
