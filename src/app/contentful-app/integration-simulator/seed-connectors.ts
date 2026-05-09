import { BRAND_CONFIG } from './connector-types';
import type { ConnectorProfile, SimulatorType } from './connector-types';

/** Derive ConnectorProfile.brand from the canonical BRAND_CONFIG entry. */
function brandFrom(st: SimulatorType): ConnectorProfile['brand'] {
  const { color, textColor } = BRAND_CONFIG[st];
  return { color, textColor };
}

/**
 * 1:1 map between the legacy SimulatorType union and the new
 * ConnectorProfile.id. Used to migrate existing mappings on read and to
 * derive `simulatorType` from `connectorId` on save (back-compat).
 */
export const SIMULATOR_TYPE_TO_CONNECTOR_ID: Record<SimulatorType, string> = {
  SHOPIFY: 'shopify',
  COMMERCETOOLS: 'commercetools',
  BIGCOMMERCE: 'bigcommerce',
  BYNDER: 'bynder',
  ADOBE: 'adobe',
  BRANDFOLDER: 'brandfolder',
  BOOKING_REVRAISE: 'revraise',
  BOOKING_SPAONE: 'spaone',
  BOOKING_OPENTABLE: 'opentable',
};

export const CONNECTOR_ID_TO_SIMULATOR_TYPE: Record<string, SimulatorType> =
  Object.fromEntries(
    Object.entries(SIMULATOR_TYPE_TO_CONNECTOR_ID).map(([k, v]) => [
      v,
      k as SimulatorType,
    ]),
  );

/**
 * Seed list of 9 default connector profiles. Used the first time the app is
 * configured (when params has no `connectors` array yet) and as the catalog
 * shown in the Connectors tab UI.
 */
export const SEED_CONNECTORS: ConnectorProfile[] = [
  {
    id: 'shopify',
    label: BRAND_CONFIG.SHOPIFY.label,
    category: 'E-Commerce',
    brand: brandFrom('SHOPIFY'),
    pickerMode: 'gallery',
    seedData: { source: 'products' },
  },
  {
    id: 'commercetools',
    label: BRAND_CONFIG.COMMERCETOOLS.label,
    category: 'E-Commerce',
    brand: brandFrom('COMMERCETOOLS'),
    pickerMode: 'gallery',
    seedData: { source: 'products' },
  },
  {
    id: 'bigcommerce',
    label: BRAND_CONFIG.BIGCOMMERCE.label,
    category: 'E-Commerce',
    brand: brandFrom('BIGCOMMERCE'),
    pickerMode: 'gallery',
    seedData: { source: 'products' },
  },
  {
    id: 'bynder',
    label: BRAND_CONFIG.BYNDER.label,
    category: 'DAM',
    brand: brandFrom('BYNDER'),
    pickerMode: 'gallery',
    seedData: { source: 'assets' },
  },
  {
    id: 'adobe',
    label: BRAND_CONFIG.ADOBE.label,
    category: 'DAM',
    brand: brandFrom('ADOBE'),
    pickerMode: 'gallery',
    seedData: { source: 'assets' },
  },
  {
    id: 'brandfolder',
    label: BRAND_CONFIG.BRANDFOLDER.label,
    category: 'DAM',
    brand: brandFrom('BRANDFOLDER'),
    pickerMode: 'gallery',
    seedData: { source: 'assets' },
  },
  {
    id: 'revraise',
    label: BRAND_CONFIG.BOOKING_REVRAISE.label,
    category: 'Booking',
    brand: brandFrom('BOOKING_REVRAISE'),
    pickerMode: 'embed',
    seedData: {
      componentRef: 'BookingWidget',
      props: { provider: 'revraise' },
    },
  },
  {
    id: 'spaone',
    label: BRAND_CONFIG.BOOKING_SPAONE.label,
    category: 'Booking',
    brand: brandFrom('BOOKING_SPAONE'),
    pickerMode: 'embed',
    seedData: {
      componentRef: 'BookingWidget',
      props: { provider: 'spaone' },
    },
  },
  {
    id: 'opentable',
    label: BRAND_CONFIG.BOOKING_OPENTABLE.label,
    category: 'Booking',
    brand: brandFrom('BOOKING_OPENTABLE'),
    pickerMode: 'embed',
    seedData: {
      componentRef: 'BookingWidget',
      props: { provider: 'opentable' },
    },
  },
];

/** Look up a connector by id in a list. */
export function findConnector(
  connectors: ConnectorProfile[],
  id: string,
): ConnectorProfile | undefined {
  return connectors.find((c) => c.id === id);
}

/** Component refs available to embed-mode connectors. Add new entries here when registering new embed components. */
export const EMBED_COMPONENT_REFS = ['BookingWidget'] as const;

/** Human-readable summary used in collapsed cards + mapping subtext. */
export function pickerModeLabel(mode: ConnectorProfile['pickerMode']): string {
  switch (mode) {
    case 'gallery':
      return 'Gallery picker';
    case 'table':
      return 'Table picker';
    case 'embed':
      return 'Embed component';
  }
}

/**
 * Default seedData when switching a connector's pickerMode in the editor.
 * Provides a sensible starting JSON shape so users can edit instead of typing
 * from scratch.
 */
export function defaultSeedDataForMode(
  mode: ConnectorProfile['pickerMode'],
): Record<string, unknown> {
  switch (mode) {
    case 'gallery':
      return { source: 'products' };
    case 'table':
      return {
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
        ],
        rows: [],
      };
    case 'embed':
      return { componentRef: 'BookingWidget', props: {} };
  }
}

/** Helper text shown below the Seed data textarea, depends on pickerMode. */
export function seedDataHelperText(
  mode: ConnectorProfile['pickerMode'],
): string {
  switch (mode) {
    case 'gallery':
      return "For gallery mode, provide { source: 'products' | 'assets' } to use seeded catalogs, or { items: [...] } for custom records.";
    case 'table':
      return 'For table mode, provide { columns: [{ key, label }], rows: [{ ... }] }.';
    case 'embed':
      return `For embed mode, provide { componentRef, props }. Available components: ${EMBED_COMPONENT_REFS.join(', ')}.`;
  }
}
