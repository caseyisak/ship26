'use client';

import React from 'react';

import { LivePreviewProvider } from '@/lib/live-preview';

export function LivePreviewProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LivePreviewProvider locale="en-US">{children}</LivePreviewProvider>;
}
