/**
 * Shared types for the Integration Simulator app.
 *
 * Extracted from config-screen.tsx so connectors-tab and mappings-tab can
 * import them without circular deps. config-screen.tsx re-exports the legacy
 * symbols (SimulatorType, BRAND_CONFIG, isEcomType, isBookingType) so that
 * field-editor.tsx and dialog.tsx imports continue to work unchanged.
 */

// ── Legacy SimulatorType (kept for field-editor + dialog back-compat) ────────

export type SimulatorType =
  | 'SHOPIFY'
  | 'COMMERCETOOLS'
  | 'BIGCOMMERCE'
  | 'BYNDER'
  | 'ADOBE'
  | 'BRANDFOLDER'
  | 'BOOKING_REVRAISE'
  | 'BOOKING_SPAONE'
  | 'BOOKING_OPENTABLE';

export const BRAND_CONFIG: Record<
  SimulatorType,
  { label: string; color: string; textColor: string }
> = {
  SHOPIFY: { label: 'Shopify', color: '#96BF48', textColor: '#fff' },
  COMMERCETOOLS: {
    label: 'commercetools',
    color: '#FF7C00',
    textColor: '#fff',
  },
  BIGCOMMERCE: { label: 'BigCommerce', color: '#2776C6', textColor: '#fff' },
  BYNDER: { label: 'Bynder', color: '#00A1E4', textColor: '#fff' },
  ADOBE: { label: 'Adobe AEM Assets', color: '#FA0F00', textColor: '#fff' },
  BRANDFOLDER: { label: 'Brandfolder', color: '#0033CC', textColor: '#fff' },
  BOOKING_REVRAISE: { label: 'RevRaise', color: '#5f0002', textColor: '#fff' },
  BOOKING_SPAONE: { label: 'SpaOne', color: '#2d5a4e', textColor: '#fff' },
  BOOKING_OPENTABLE: {
    label: 'OpenTable',
    color: '#da3743',
    textColor: '#fff',
  },
};

const ECOM_TYPES: SimulatorType[] = ['SHOPIFY', 'COMMERCETOOLS', 'BIGCOMMERCE'];
const BOOKING_TYPES: SimulatorType[] = [
  'BOOKING_REVRAISE',
  'BOOKING_SPAONE',
  'BOOKING_OPENTABLE',
];
export function isEcomType(t: SimulatorType): boolean {
  return ECOM_TYPES.includes(t);
}
export function isBookingType(t: SimulatorType): boolean {
  return BOOKING_TYPES.includes(t);
}

// ── New connector profile model ──────────────────────────────────────────────

export type PickerMode = 'gallery' | 'table' | 'embed';

export interface ConnectorProfile {
  id: string;
  label: string;
  category: string;
  brand: { color: string; textColor: string };
  pickerMode: PickerMode;
  /** Picker-mode-specific config. Free-form JSON edited in the Connectors tab. */
  seedData: Record<string, unknown>;
}

// ── Persisted shapes ─────────────────────────────────────────────────────────

export interface MappingRow {
  /** React key — stripped before saving to Contentful params. */
  _id: string;
  contentTypeId: string;
  fieldId: string;
  /** New canonical reference. */
  connectorId: string;
  /**
   * Legacy field — derived from connectorId on save. Kept on the persisted
   * mapping so the existing field-editor + dialog (which still route by
   * SimulatorType) keep working until they're refactored to read connectorId.
   */
  simulatorType: SimulatorType;
}

export interface AppParams {
  mappings: Omit<MappingRow, '_id'>[];
  /** Connector profiles authored in the Connectors tab. Optional for back-compat. */
  connectors?: ConnectorProfile[];
}
