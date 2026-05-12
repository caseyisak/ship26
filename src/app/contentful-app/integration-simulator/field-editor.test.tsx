import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { IntegrationSimulatorField } from './field-editor';

vi.mock('@/components/demo/booking-widget/BookingWidget', () => ({
  BookingWidget: ({ provider }: { provider: string }) => (
    <div data-testid="booking-widget">{provider}</div>
  ),
}));

function makeFieldSdk(installationOverrides: Record<string, unknown> = {}) {
  return {
    parameters: {
      installation: { mappings: [], connectors: [], ...installationOverrides },
    },
    field: {
      id: 'skus',
      getValue: vi.fn().mockReturnValue(null),
      setValue: vi.fn().mockResolvedValue(undefined),
      removeValue: vi.fn().mockResolvedValue(undefined),
    },
    contentType: { sys: { id: 'page' } },
    dialogs: { openCurrentApp: vi.fn().mockResolvedValue(null) },
  };
}

describe('IntegrationSimulatorField — pickerMode threading', () => {
  it('ecom multi → openCurrentApp with pickerMode "multi" and title "Select Products"', () => {
    const sdk = makeFieldSdk({
      mappings: [
        {
          contentTypeId: 'page',
          fieldId: 'skus',
          simulatorType: 'SHOPIFY',
          connectorId: 'shopify',
          mode: 'multi',
        },
      ],
    });

    render(<IntegrationSimulatorField sdk={sdk} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Products' }));

    expect(sdk.dialogs.openCurrentApp).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Select Products',
        parameters: expect.objectContaining({ pickerMode: 'multi' }),
      }),
    );
  });

  it('ecom single → openCurrentApp with pickerMode "single" and title "Select Product"', () => {
    const sdk = makeFieldSdk({
      mappings: [
        {
          contentTypeId: 'page',
          fieldId: 'skus',
          simulatorType: 'BIGCOMMERCE',
          connectorId: 'bigcommerce',
          mode: 'single',
        },
      ],
    });

    render(<IntegrationSimulatorField sdk={sdk} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

    expect(sdk.dialogs.openCurrentApp).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Select Product',
        parameters: expect.objectContaining({ pickerMode: 'single' }),
      }),
    );
  });

  it('DAM multi → openCurrentApp with pickerMode "multi" and title "Select Assets"', () => {
    const sdk = makeFieldSdk({
      mappings: [
        {
          contentTypeId: 'page',
          fieldId: 'skus',
          simulatorType: 'BYNDER',
          connectorId: 'bynder',
          mode: 'multi',
        },
      ],
    });

    render(<IntegrationSimulatorField sdk={sdk} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Assets' }));

    expect(sdk.dialogs.openCurrentApp).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Select Assets',
        parameters: expect.objectContaining({ pickerMode: 'multi' }),
      }),
    );
  });

  it('DAM single → openCurrentApp with pickerMode "single" and title "Select Asset"', () => {
    const sdk = makeFieldSdk({
      mappings: [
        {
          contentTypeId: 'page',
          fieldId: 'skus',
          simulatorType: 'ADOBE',
          connectorId: 'adobe',
          mode: 'single',
        },
      ],
    });

    render(<IntegrationSimulatorField sdk={sdk} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Asset' }));

    expect(sdk.dialogs.openCurrentApp).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Select Asset',
        parameters: expect.objectContaining({ pickerMode: 'single' }),
      }),
    );
  });

  it('no mapping → shows "No mapping configured" and no picker button', () => {
    const sdk = makeFieldSdk({ mappings: [] });

    render(<IntegrationSimulatorField sdk={sdk} />);

    expect(screen.getByText(/No mapping configured/)).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('defaults to single when mapping has no mode property', () => {
    const sdk = makeFieldSdk({
      mappings: [
        {
          contentTypeId: 'page',
          fieldId: 'skus',
          simulatorType: 'SHOPIFY',
          connectorId: 'shopify',
          // mode omitted — should default to 'single'
        },
      ],
    });

    render(<IntegrationSimulatorField sdk={sdk} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));

    expect(sdk.dialogs.openCurrentApp).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Select Product',
        parameters: expect.objectContaining({ pickerMode: 'single' }),
      }),
    );
  });
});
