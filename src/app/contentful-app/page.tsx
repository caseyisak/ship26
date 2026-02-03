'use client';

import { locations } from '@contentful/app-sdk';
import { useAutoResizer, useSDK } from '@contentful/react-apps-toolkit';

import { SectionStyleEditor } from '@/contentful-app/section-style-editor';

function SectionStyleEditorWithResizer({
  sdk,
  isEntryField,
}: {
  sdk: ReturnType<typeof useSDK>;
  isEntryField: boolean;
}) {
  useAutoResizer({ absoluteElements: true });
  return (
    <div className="min-h-full min-w-full">
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
