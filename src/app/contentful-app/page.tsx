'use client';

import { locations } from '@contentful/app-sdk';
import { useAutoResizer, useSDK } from '@contentful/react-apps-toolkit';
import React, { useEffect, useRef } from 'react';

import { SectionStyleEditor } from '@/contentful-app/section-style-editor';

const IFRAME_HEIGHT_PADDING = 32;

function SectionStyleEditorWithResizer({
  sdk,
  isEntryField,
}: {
  sdk: ReturnType<typeof useSDK>;
  isEntryField: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useAutoResizer();

  useEffect(() => {
    const el = contentRef.current;
    const windowApi = (
      sdk as { window?: { updateHeight: (h?: number) => void } }
    )?.window;
    if (!el || typeof windowApi?.updateHeight !== 'function') return;

    const updateHeight = () => {
      const height =
        Math.ceil(el.getBoundingClientRect().height) + IFRAME_HEIGHT_PADDING;
      windowApi.updateHeight(height);
    };

    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(el);
    updateHeight();
    return () => observer.disconnect();
  }, [sdk]);

  return (
    <div ref={contentRef} className="min-w-full">
      <SectionStyleEditor sdk={sdk} isEntryField={isEntryField} />
    </div>
  );
}

/**
 * Section style editor app: entry-field (JSON field) and entry-editor (full editor).
 * Local URL: http://localhost:3000/contentful-app
 */
export default function ContentfulAppPage() {
  const sdk = useSDK();
  const isEntryField = Boolean(
    sdk?.location?.is(locations.LOCATION_ENTRY_FIELD),
  );
  const isEntryEditor = Boolean(
    sdk?.location?.is(locations.LOCATION_ENTRY_EDITOR),
  );

  if (sdk && (isEntryField || isEntryEditor)) {
    return (
      <SectionStyleEditorWithResizer sdk={sdk} isEntryField={isEntryField} />
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] p-8 text-[var(--foreground)]">
      <h1 className="text-xl font-semibold">Section style editor</h1>
      <p className="max-w-md text-center text-sm text-[var(--muted-foreground)]">
        Load this URL in Contentful as the custom editor for the sectionStyle
        field (entry-field) or as the entry editor (entry-editor). Local URL:{' '}
        <strong>http://localhost:3000/contentful-app</strong>
      </p>
    </div>
  );
}
