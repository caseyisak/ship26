'use client';

/**
 * Visual test harness — renders IntegrationSimulatorField with a mock SDK.
 * Outside the contentful-app layout to avoid SDKProvider crashing without iframe context.
 *
 * Route: http://localhost:3002/field-preview
 */

import dynamic from 'next/dynamic';

const IntegrationSimulatorField = dynamic(
  () =>
    import('@/app/contentful-app/integration-simulator/field-editor').then(
      (m) => m.IntegrationSimulatorField,
    ),
  { ssr: false },
);

const MOCK_PRODUCT = {
  sku: 'MF-MON-002',
  name: 'UltraWide 34" Monitor',
  description: 'A stunning ultrawide monitor.',
  price: 899.0,
  currency: 'USD',
  inStock: true,
  inventory: 24,
  category: 'Monitors',
  tags: ['Ultrawide', '144hz', 'Usb-c', 'Qhd'],
  images: ['https://images.ctfassets.net/uumzxfocy3ef/3rLMSZfpFaIhiPZAbdOdLc/b2d0f9c0f6c0e3c0e3c0e3c0e3c0e3c0/product.jpg'],
};

const mockSdkFilled = {
  field: {
    id: 'sku',
    getValue: () => MOCK_PRODUCT,
    setValue: async (v: unknown) => v,
    removeValue: async () => undefined,
  },
  contentType: { sys: { id: 'productDetailPage' } },
  parameters: {
    installation: {
      mappings: [
        { contentTypeId: 'productDetailPage', fieldId: 'sku', simulatorType: 'SHOPIFY' },
      ],
    },
  },
  dialogs: { openCurrentApp: async () => null },
};

const mockSdkEmpty = {
  ...mockSdkFilled,
  field: { ...mockSdkFilled.field, getValue: () => null },
};

export default function FieldPreview() {
  return (
    <div style={{ padding: 32, maxWidth: 900, background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <p style={{ fontSize: 11, color: '#67728a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Filled state — ECOM (Shopify)
      </p>
      <IntegrationSimulatorField sdk={mockSdkFilled} />

      <p style={{ fontSize: 11, color: '#67728a', marginTop: 32, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Empty state
      </p>
      <IntegrationSimulatorField sdk={mockSdkEmpty} />
    </div>
  );
}
