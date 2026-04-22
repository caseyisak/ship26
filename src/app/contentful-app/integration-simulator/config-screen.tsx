'use client';

import {
  Box,
  Flex,
  Heading,
  Note,
  Paragraph,
  Select,
  Spinner,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@contentful/f36-components';
import React, { useEffect, useState } from 'react';

// ── Public types (re-used by field-editor) ────────────────────────────────────

export type SimulatorType =
  | 'SHOPIFY'
  | 'COMMERCETOOLS'
  | 'BIGCOMMERCE'
  | 'BYNDER'
  | 'ADOBE'
  | 'BRANDFOLDER';

/** Brand metadata for each simulator vendor. */
export const BRAND_CONFIG: Record<
  SimulatorType,
  { label: string; color: string; textColor: string }
> = {
  SHOPIFY:       { label: 'Shopify',             color: '#96BF48', textColor: '#fff' },
  COMMERCETOOLS: { label: 'commercetools',        color: '#FF7C00', textColor: '#fff' },
  BIGCOMMERCE:   { label: 'BigCommerce',          color: '#2776C6', textColor: '#fff' },
  BYNDER:        { label: 'Bynder',               color: '#00A1E4', textColor: '#fff' },
  ADOBE:         { label: 'Adobe AEM Assets',     color: '#FA0F00', textColor: '#fff' },
  BRANDFOLDER:   { label: 'Brandfolder',          color: '#0033CC', textColor: '#fff' },
};

export const ECOM_TYPES: SimulatorType[] = ['SHOPIFY', 'COMMERCETOOLS', 'BIGCOMMERCE'];
export function isEcomType(t: SimulatorType): boolean { return ECOM_TYPES.includes(t); }

export interface MappingRow {
  /** Local React key — stripped before saving to Contentful params */
  _id: string;
  contentTypeId: string;
  fieldId: string;
  simulatorType: SimulatorType;
}

export interface AppParams {
  mappings: Omit<MappingRow, '_id'>[];
}

// ── Internal types ────────────────────────────────────────────────────────────

type CTField = { id: string; name: string; type: string };
type ContentType = { sys: { id: string }; name: string; fields: CTField[] };
type Activation = { fieldId: string; simulatorType: SimulatorType };

type ConfigSdk = {
  app: {
    getParameters: () => Promise<AppParams | null>;
    onConfigure: (handler: () => { parameters: AppParams }) => () => void;
    setReady: () => void;
  };
  space: {
    getContentTypes: () => Promise<{ items: ContentType[] }>;
  };
};

// ── Main component ────────────────────────────────────────────────────────────

export function IntegrationSimulatorConfig({ sdk }: { sdk: unknown }) {
  const appSdk = sdk as ConfigSdk;

  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [activations, setActivations] = useState<Record<string, Activation | null>>({});
  const [loadingCts, setLoadingCts] = useState(true);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState('');

  // Load saved params + all content types in parallel, then mark ready
  useEffect(() => {
    async function init() {
      const [params, ctsResult] = await Promise.all([
        appSdk.app.getParameters(),
        appSdk.space.getContentTypes(),
      ]);

      const cts = (ctsResult?.items ?? []).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setContentTypes(cts);

      if (params?.mappings?.length) {
        const map: Record<string, Activation> = {};
        for (const m of params.mappings) {
          map[m.contentTypeId] = { fieldId: m.fieldId, simulatorType: m.simulatorType };
        }
        setActivations(map);
      }

      setLoadingCts(false);
      setReady(true);
      appSdk.app.setReady();
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-register onConfigure whenever activations change so the handler closes
  // over the latest state. Field appearance (widgetId/widgetNamespace) must be
  // set manually in Content Model → field appearance — targetState is not used
  // because the Contentful parent frame rejects it consistently.
  useEffect(() => {
    if (!ready) return;
    const cleanup = appSdk.app.onConfigure(() => ({
      parameters: {
        mappings: Object.entries(activations)
          .filter((entry): entry is [string, Activation] => entry[1] !== null)
          .map(([ctId, v]) => ({
            contentTypeId: ctId,
            fieldId: v.fieldId,
            simulatorType: v.simulatorType,
          })),
      },
    }));
    return cleanup;
  }, [activations, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCt = (ct: ContentType) => {
    setActivations((prev) => {
      if (prev[ct.sys.id]) {
        const next = { ...prev };
        delete next[ct.sys.id];
        return next;
      }
      // Default: first field, Shopify
      return {
        ...prev,
        [ct.sys.id]: {
          fieldId: ct.fields[0]?.id ?? '',
          simulatorType: 'SHOPIFY' as SimulatorType,
        },
      };
    });
  };

  const updateActivation = (ctId: string, patch: Partial<Activation>) => {
    setActivations((prev) => ({
      ...prev,
      [ctId]: { ...prev[ctId]!, ...patch },
    }));
  };

  const q = search.toLowerCase();
  const visible = q
    ? contentTypes.filter(
        (ct) =>
          ct.name.toLowerCase().includes(q) || ct.sys.id.toLowerCase().includes(q),
      )
    : contentTypes;

  const activatedCts = visible.filter((ct) => activations[ct.sys.id]);
  const inactiveCts = visible.filter((ct) => !activations[ct.sys.id]);

  return (
    <Box padding="spacingL">
      <Box style={{ width: '60%', margin: '0 auto' }}>
      <Stack flexDirection="column" spacing="spacingL" alignItems="flex-start">
        <Box style={{ width: '100%' }}>
          <Heading>Integration Simulator</Heading>
          <Paragraph>
            Toggle a content type to activate the integration picker on one of its
            fields. Editors will see an &ldquo;Add Product&rdquo; or &ldquo;Add
            Asset&rdquo; button in place of the normal field input.
          </Paragraph>
        </Box>

        {loadingCts ? (
          <Flex alignItems="center" gap="spacingS">
            <Spinner />
            <Text fontColor="gray600">Loading content types…</Text>
          </Flex>
        ) : (
          <Stack
            flexDirection="column"
            spacing="spacingXs"
            style={{ width: '100%' }}
          >
            <TextInput
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search content types…"
              size="small"
            />
            {/* ── Activated content types (top) ── */}
            {activatedCts.length > 0 && (
              <Text
                fontWeight="fontWeightDemiBold"
                style={{ marginBottom: 4 }}
              >
                Active
              </Text>
            )}
            {activatedCts.map((ct) => (
              <CtRow
                key={ct.sys.id}
                ct={ct}
                activation={activations[ct.sys.id]!}
                onToggle={() => toggleCt(ct)}
                onUpdate={(patch) => updateActivation(ct.sys.id, patch)}
              />
            ))}

            {/* ── Inactive content types (below) ── */}
            {inactiveCts.length > 0 && (
              <Text
                fontColor="gray500"
                style={{
                  marginTop: activatedCts.length > 0 ? 12 : 0,
                  marginBottom: 4,
                }}
              >
                Available content types
              </Text>
            )}
            {inactiveCts.map((ct) => (
              <CtRow
                key={ct.sys.id}
                ct={ct}
                activation={null}
                onToggle={() => toggleCt(ct)}
                onUpdate={() => {}}
              />
            ))}
          </Stack>
        )}

        {activatedCts.some((ct) => !activations[ct.sys.id]?.fieldId) && (
          <Note variant="warning">
            All active content types must have a field selected before saving.
          </Note>
        )}
      </Stack>
      </Box>
    </Box>
  );
}

// ── CT row ────────────────────────────────────────────────────────────────────

function CtRow({
  ct,
  activation,
  onToggle,
  onUpdate,
}: {
  ct: ContentType;
  activation: Activation | null;
  onToggle: () => void;
  onUpdate: (patch: Partial<Activation>) => void;
}) {
  const isActive = activation !== null;

  return (
    <Box
      style={{
        border: `1px solid ${isActive ? '#0059C8' : '#CFD9E0'}`,
        borderRadius: 8,
        padding: '12px 16px',
        background: isActive ? '#F0F5FF' : '#FAFBFC',
        transition: 'border-color 0.15s, background 0.15s',
        width: '100%',
      }}
    >
      {/* Header row: name + toggle */}
      <Flex alignItems="center" justifyContent="space-between">
        <Box>
          <Text fontWeight="fontWeightDemiBold">{ct.name}</Text>
          <Text
            fontColor="gray500"
            style={{ display: 'block', fontSize: 11, marginTop: 2 }}
          >
            {ct.sys.id}
          </Text>
        </Box>
        <Switch
          id={`ct-toggle-${ct.sys.id}`}
          isChecked={isActive}
          onChange={onToggle}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Switch>
      </Flex>

      {/* Field + simulator selectors (only when active) */}
      {isActive && (
        <Flex gap="spacingS" style={{ marginTop: 12 }}>
          <Box style={{ flex: 1 }}>
            <Text
              fontColor="gray600"
              style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
            >
              Field
            </Text>
            <Select
              value={activation.fieldId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onUpdate({ fieldId: e.target.value })
              }
              size="small"
            >
              {ct.fields.map((f) => (
                <Select.Option key={f.id} value={f.id}>
                  {f.name} ({f.id})
                </Select.Option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text
              fontColor="gray600"
              style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
            >
              Simulator
            </Text>
            <Select
              value={activation.simulatorType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onUpdate({ simulatorType: e.target.value as SimulatorType })
              }
              size="small"
            >
              <optgroup label="E-Commerce">
                <Select.Option value="SHOPIFY">Shopify</Select.Option>
                <Select.Option value="COMMERCETOOLS">commercetools</Select.Option>
                <Select.Option value="BIGCOMMERCE">BigCommerce</Select.Option>
              </optgroup>
              <optgroup label="DAM">
                <Select.Option value="BYNDER">Bynder</Select.Option>
                <Select.Option value="ADOBE">Adobe AEM Assets</Select.Option>
                <Select.Option value="BRANDFOLDER">Brandfolder</Select.Option>
              </optgroup>
            </Select>
          </Box>
        </Flex>
      )}
    </Box>
  );
}
