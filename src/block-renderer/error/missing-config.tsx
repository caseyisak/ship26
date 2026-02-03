import React from 'react';

import type { BlockData } from '../types';
import { renderTypeName } from '../utils';
import { ErrorComponent } from './error';

export function MissingConfigError({ data }: { data: BlockData }) {
  return (
    <ErrorComponent data={data}>
      Could not find a block renderer config for{' '}
      <code>{renderTypeName(data)}</code>.
    </ErrorComponent>
  );
}
