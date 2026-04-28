'use client';

import React from 'react';

import type { FaqFragment } from '@/block-renderer/types';
import { useLiveUpdates } from '@/lib/live-preview';

import { AioAeoPreviewPanel } from './AioAeoPreviewPanel';

type Props = {
  data: FaqFragment;
};

/**
 * Client component that wires live preview updates to the After panel.
 * Keeps server/client boundary clean — the page.tsx server component fetches data,
 * this component subscribes to Contentful live updates and re-renders on change.
 */
export function FaqAeoAfterPanel({ data }: Props) {
  const liveData = useLiveUpdates(data);

  return (
    <div className="p-6">
      <AioAeoPreviewPanel data={liveData} />
    </div>
  );
}
