'use client';

import React from 'react';

import type { ErrorProps } from './types';

export function ErrorComponent({ children }: ErrorProps) {
  return (
    <div
      role="alert"
      className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      {children}
    </div>
  );
}
