'use client';

import { locations } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

/**
 * Integration Simulator app — entry point.
 * Components are loaded client-only (ssr: false) because
 * @contentful/f36-components accesses browser APIs at module evaluation time.
 *
 * Local URL: http://localhost:3000/contentful-app/integration-simulator
 * Locations: app-config, entry-field, dialog
 */

const IntegrationSimulatorConfig = dynamic(
  () =>
    import('@/contentful-app/integration-simulator/config-screen').then(
      (m) => m.IntegrationSimulatorConfig,
    ),
  { ssr: false },
);

const IntegrationSimulatorField = dynamic(
  () =>
    import('@/contentful-app/integration-simulator/field-editor').then(
      (m) => m.IntegrationSimulatorField,
    ),
  { ssr: false },
);

const IntegrationSimulatorDialog = dynamic(
  () =>
    import('@/contentful-app/integration-simulator/dialog').then(
      (m) => m.IntegrationSimulatorDialog,
    ),
  { ssr: false },
);

/**
 * useAutoResizer is only valid in field/sidebar/dialog locations.
 * Keeping it in a child component so it never throws when viewed
 * directly in the browser outside Contentful.
 */
function FieldWithResizer({ sdk }: { sdk: unknown }) {
  const sdkAny = sdk as any;

  useEffect(() => {
    // Explicitly set height then start auto-resizer for subsequent changes
    sdkAny?.window?.updateHeight?.(380);
    sdkAny?.window?.startAutoResizer?.();
    return () => sdkAny?.window?.stopAutoResizer?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <IntegrationSimulatorField sdk={sdk} />;
}

export default function IntegrationSimulatorPage() {
  const sdk = useSDK();

  const isConfig = sdk?.location?.is(locations.LOCATION_APP_CONFIG);
  const isEntryField = sdk?.location?.is(locations.LOCATION_ENTRY_FIELD);
  const isDialog = sdk?.location?.is(locations.LOCATION_DIALOG);

  if (sdk && isConfig) return <IntegrationSimulatorConfig sdk={sdk} />;
  if (sdk && isEntryField) return <FieldWithResizer sdk={sdk} />;
  if (sdk && isDialog) return <IntegrationSimulatorDialog sdk={sdk} />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] p-8 text-[var(--foreground)]">
      <h1 className="text-xl font-semibold">Integration Simulator</h1>
      <p className="max-w-md text-center text-sm text-[var(--muted-foreground)]">
        Load this URL in Contentful as the Integration Simulator app
        (locations: <code>app-config</code>, <code>entry-field</code>,{' '}
        <code>dialog</code>).
      </p>
      <code className="rounded bg-muted px-3 py-1.5 text-sm">
        http://localhost:3000/contentful-app/integration-simulator
      </code>
    </div>
  );
}
