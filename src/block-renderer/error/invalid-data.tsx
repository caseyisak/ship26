import React from 'react';

import type { BlockData, PersonalizedBlockData } from '../types';
import { renderEntryId, renderTypeName } from '../utils';
import { ErrorComponent } from './error';

export function InvalidDataError({
  data,
}: {
  data?: BlockData | PersonalizedBlockData | null;
}) {
  return (
    <ErrorComponent data={data}>
      The data for the entry <code>{renderEntryId(data)}</code> of type{' '}
      <code>{renderTypeName(data)}</code> is empty.
    </ErrorComponent>
  );
}
