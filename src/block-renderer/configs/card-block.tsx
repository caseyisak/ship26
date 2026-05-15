'use client';

import type { BlockProps, CardFragment } from '@/block-renderer/types';
import { CardRenderer } from '@/cms-components/card-renderer/card-renderer';

export function CardBlock({ data, className }: BlockProps<CardFragment>) {
  return <CardRenderer card={data} className={className} />;
}
