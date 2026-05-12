import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { IntegrationSimulatorDialog } from './dialog';

vi.mock('@/components/demo/booking-widget/BookingWidget', () => ({
  BookingWidget: ({ provider }: { provider: string }) => (
    <div data-testid="booking-widget" data-provider={provider}>
      BookingWidget
    </div>
  ),
}));

vi.mock('./ecom-picker-modal', () => ({
  EcomPickerContent: ({
    simulatorType,
    pickerMode,
  }: {
    simulatorType: string;
    pickerMode: string;
  }) => (
    <div
      data-testid="ecom-picker"
      data-simulator-type={simulatorType}
      data-picker-mode={pickerMode}
    >
      EcomPicker
    </div>
  ),
}));

vi.mock('./dam-picker-modal', () => ({
  DamPickerContent: ({
    simulatorType,
    pickerMode,
  }: {
    simulatorType: string;
    pickerMode: string;
  }) => (
    <div
      data-testid="dam-picker"
      data-simulator-type={simulatorType}
      data-picker-mode={pickerMode}
    >
      DamPicker
    </div>
  ),
}));

function makeDialogSdk(invocation: Record<string, unknown> = {}) {
  return {
    parameters: { invocation },
    close: vi.fn(),
  };
}

describe('IntegrationSimulatorDialog — pickerMode threading', () => {
  it('ecom + pickerMode "multi" → EcomPickerContent receives multi', () => {
    const sdk = makeDialogSdk({ mode: 'SHOPIFY', pickerMode: 'multi' });
    render(<IntegrationSimulatorDialog sdk={sdk} />);

    const picker = screen.getByTestId('ecom-picker');
    expect(picker.dataset.pickerMode).toBe('multi');
    expect(picker.dataset.simulatorType).toBe('SHOPIFY');
  });

  it('ecom + pickerMode "single" → EcomPickerContent receives single', () => {
    const sdk = makeDialogSdk({ mode: 'BIGCOMMERCE', pickerMode: 'single' });
    render(<IntegrationSimulatorDialog sdk={sdk} />);

    const picker = screen.getByTestId('ecom-picker');
    expect(picker.dataset.pickerMode).toBe('single');
    expect(picker.dataset.simulatorType).toBe('BIGCOMMERCE');
  });

  it('missing pickerMode → defaults to "single"', () => {
    const sdk = makeDialogSdk({ mode: 'COMMERCETOOLS' });
    render(<IntegrationSimulatorDialog sdk={sdk} />);

    const picker = screen.getByTestId('ecom-picker');
    expect(picker.dataset.pickerMode).toBe('single');
  });

  it('DAM + pickerMode "multi" → DamPickerContent receives multi', () => {
    const sdk = makeDialogSdk({ mode: 'BYNDER', pickerMode: 'multi' });
    render(<IntegrationSimulatorDialog sdk={sdk} />);

    const picker = screen.getByTestId('dam-picker');
    expect(picker.dataset.pickerMode).toBe('multi');
    expect(picker.dataset.simulatorType).toBe('BYNDER');
  });

  it('DAM + pickerMode "single" → DamPickerContent receives single', () => {
    const sdk = makeDialogSdk({ mode: 'ADOBE', pickerMode: 'single' });
    render(<IntegrationSimulatorDialog sdk={sdk} />);

    const picker = screen.getByTestId('dam-picker');
    expect(picker.dataset.pickerMode).toBe('single');
    expect(picker.dataset.simulatorType).toBe('ADOBE');
  });

  it('booking type → renders BookingWidget, not a picker', () => {
    const sdk = makeDialogSdk({
      mode: 'BOOKING_REVRAISE',
      pickerMode: 'single',
    });
    render(<IntegrationSimulatorDialog sdk={sdk} />);

    expect(screen.getByTestId('booking-widget')).toBeTruthy();
    expect(screen.queryByTestId('ecom-picker')).toBeNull();
    expect(screen.queryByTestId('dam-picker')).toBeNull();
  });
});
