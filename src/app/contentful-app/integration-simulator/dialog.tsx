'use client';

import React from 'react';

import type { AssetRecord, ProductRecord } from '@/lib/integration-adapters/types';
import { BookingWidget } from '@/components/demo/booking-widget/BookingWidget';

import { DamPickerContent } from './dam-picker-modal';
import { EcomPickerContent } from './ecom-picker-modal';
import { isEcomType, isBookingType } from './config-screen';
import type { SimulatorType } from './config-screen';
import type { AssetCollection, ProductCollection } from './connector-types';

// ── SDK type ──────────────────────────────────────────────────────────────────

type DialogSdk = {
  parameters: {
    invocation: { mode: SimulatorType; pickerMode?: 'single' | 'multi' };
  };
  close: (value: ProductRecord | AssetRecord | ProductRecord[] | AssetRecord[] | ProductCollection | AssetCollection | null) => void;
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
  const pickerMode = dialogSdk.parameters?.invocation?.pickerMode ?? 'single';

  const handleClose = () => dialogSdk.close(null);

  if (mode && isEcomType(mode)) {
    return (
      <EcomPickerContent
        simulatorType={mode}
        pickerMode={pickerMode}
        onSelect={(result) => dialogSdk.close(result)}
        onClose={handleClose}
      />
    );
  }

  if (mode && isBookingType(mode)) {
    const provider =
      mode === 'BOOKING_REVRAISE'
        ? 'revraise'
        : mode === 'BOOKING_OPENTABLE'
        ? 'opentable'
        : 'spaone';
    return (
      <div style={{ padding: 24, background: '#fff9ed', minHeight: '100%' }}>
        <BookingWidget provider={provider} />
      </div>
    );
  }

  return (
    <DamPickerContent
      simulatorType={mode}
      pickerMode={pickerMode}
      onSelect={(result) => dialogSdk.close(result)}
      onClose={handleClose}
    />
  );
}
