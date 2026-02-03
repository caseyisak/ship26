'use client';

import './contentful-app.css';

import { SDKProvider } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from 'react';

/**
 * Wraps the Section style editor app with Contentful SDK so location and field API work in iframe.
 * SDKProvider runs only on the client to avoid SSR 500 ("missing required error components").
 */
export default function ContentfulAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-[200px] items-center justify-center bg-[var(--gray-100)] text-[var(--gray-700)]">
        Loading…
      </div>
    );
  }
  return <SDKProvider>{children}</SDKProvider>;
}
