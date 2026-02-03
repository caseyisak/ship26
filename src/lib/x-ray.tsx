'use client';

import React from 'react';

export default function XRay({
  children,
}: {
  data?: unknown;
  layoutType?: string;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
