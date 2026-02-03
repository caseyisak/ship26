import React from 'react';

import type { LayoutType } from '../layouts';
import type { BlockData } from '../types';
import { renderTypeName } from '../utils';
import { ErrorComponent } from './error';

export function UnsupportedLayoutError({
  data,
  layoutType,
}: {
  data: BlockData;
  layoutType: LayoutType;
}) {
  return (
    <ErrorComponent data={data}>
      Unsupported block type for layout type <code>{layoutType}</code>. Check
      the block renderer config for <code>{renderTypeName(data)}</code>.
    </ErrorComponent>
  );
}
