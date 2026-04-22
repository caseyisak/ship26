'use client';

import React from 'react';

import type { AssetRecord, ProductRecord } from '@/lib/integration-adapters/types';

import { DamPickerContent } from './dam-picker-modal';
import { EcomPickerContent } from './ecom-picker-modal';
import { isEcomType } from './config-screen';
import type { SimulatorType } from './config-screen';

// ── SDK type ──────────────────────────────────────────────────────────────────

type DialogSdk = {
  parameters: {
    invocation: { mode: SimulatorType };
  };
  close: (value: ProductRecord | AssetRecord | null) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Renders the picker UI inside a Contentful dialog (LOCATION_DIALOG).
 * Opens full-screen in the parent window — not constrained to the field iframe.
 *
 * Triggered by sdk.dialogs.openCurrentApp({ parameters: { mode: SimulatorType } })
 * in field-editor.tsx. Returns the selected product/asset via sdk.close().
 */
export function IntegrationSimulatorDialog({ sdk }: { sdk: unknown }) {
  const dialogSdk = sdk as DialogSdk;
  const mode = dialogSdk.parameters?.invocation?.mode;

  const handleClose = () => dialogSdk.close(null);

  if (mode && isEcomType(mode)) {
    return (
      <EcomPickerContent
        onSelect={(product) => dialogSdk.close(product)}
        onClose={handleClose}
      />
    );
  }

  return (
    <DamPickerContent
      onSelect={(asset) => dialogSdk.close(asset)}
      onClose={handleClose}
    />
  );
}
