'use client';

import { BlockRenderer } from '@/block-renderer';
import type { LayoutType } from '@/block-renderer/layouts';
import type { PersonalizedBlockData } from '@/block-renderer/types';

/** Stub: no Ninetailed yet; pass through to BlockRenderer. */
export function PersonalizedComponent({
  data,
  layoutType = 'default',
  ...props
}: {
  data: PersonalizedBlockData;
  layoutType?: LayoutType;
}) {
  return <BlockRenderer data={data} layoutType={layoutType} {...props} />;
}
