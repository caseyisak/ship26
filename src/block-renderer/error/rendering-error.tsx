import React from 'react';

import type { BlockData, PersonalizedBlockData } from '../types';
import { renderEntryId, renderTypeName } from '../utils';
import { ErrorComponent } from './error';

export function RenderingError({
  data,
  error,
}: {
  data?: BlockData | PersonalizedBlockData | null;
  error: unknown;
}) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <ErrorComponent data={data}>
      Something went wrong rendering the entry{' '}
      <code>{renderEntryId(data)}</code> of type{' '}
      <code>{renderTypeName(data)}</code>
      {message && <div>{message}</div>}
    </ErrorComponent>
  );
}
