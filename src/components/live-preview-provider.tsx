'use client';

import React from 'react';

import { LivePreviewProvider } from '@/lib/live-preview';

type Props = {
  children: React.ReactNode;
  /** Pass from layout so live updates connect (space + environment required for Contentful live preview). */
  space?: string | null;
  environment?: string | null;
};

export function LivePreviewProviderWrapper({
  children,
  space,
  environment,
}: Props) {
  return (
    <LivePreviewProvider
      locale="en-US"
      space={space ?? undefined}
      environment={environment ?? undefined}
    >
      {children}
    </LivePreviewProvider>
  );
}
