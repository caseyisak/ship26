'use client';

import {
  Box,
  Flex,
  Heading,
  Paragraph,
  Spinner,
  Stack,
  Tabs,
  Text,
} from '@contentful/f36-components';
import React, { useEffect, useState } from 'react';

import type {
  AppParams as ConnectorAppParams,
  ConnectorProfile,
  MappingRow,
} from './connector-types';
import { ConnectorsTab } from './connectors-tab';
import type { Activation } from './mappings-tab';
import { MappingsTab } from './mappings-tab';
import {
  CONNECTOR_ID_TO_SIMULATOR_TYPE,
  findConnector,
  SEED_CONNECTORS,
  SIMULATOR_TYPE_TO_CONNECTOR_ID,
} from './seed-connectors';

// ── Re-exports for back-compat (field-editor + dialog still import these) ────

export type { AppParams, MappingRow, SimulatorType } from './connector-types';
export { BRAND_CONFIG, isBookingType, isEcomType } from './connector-types';

// ── Internal types ───────────────────────────────────────────────────────────

type CTField = { id: string; name: string; type: string };
type ContentType = { sys: { id: string }; name: string; fields: CTField[] };

type ConfigSdk = {
  ids: { app: string };
  app: {
    getParameters: () => Promise<ConnectorAppParams | null>;
    onConfigure: (
      handler: () => {
        parameters: ConnectorAppParams;
        targetState?: {
          EditorInterface: Record<
            string,
            {
              controls: Array<{
                fieldId: string;
                widgetNamespace?: 'app';
                widgetId?: string;
              }>;
            }
          >;
        };
      },
    ) => () => void;
    setReady: () => void;
  };
  space: {
    getContentTypes: () => Promise<{ items: ContentType[] }>;
  };
};

// ── Migration helpers ────────────────────────────────────────────────────────

/**
 * Migrate a legacy mapping (carrying `simulatorType`) into the new shape with
 * `connectorId`. Existing entries in production already have simulatorType
 * set; this lets the app keep functioning while we transition.
 */
function migrateMappings(
  raw: ConnectorAppParams['mappings'],
): Array<{ contentTypeId: string; fieldId: string; connectorId: string; mode?: 'single' | 'multi' }> {
  return raw.map((m) => {
    const explicit = (m as Partial<MappingRow>).connectorId;
    const fromLegacy = SIMULATOR_TYPE_TO_CONNECTOR_ID[m.simulatorType];
    return {
      contentTypeId: m.contentTypeId,
      fieldId: m.fieldId,
      connectorId: explicit ?? fromLegacy ?? '',
      mode: (m as Partial<MappingRow>).mode,
    };
  });
}

// ── Main component ──────────────────────────────────────────────────────────

export function IntegrationSimulatorConfig({ sdk }: { sdk: unknown }) {
  const appSdk = sdk as ConfigSdk;

  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [connectors, setConnectors] =
    useState<ConnectorProfile[]>(SEED_CONNECTORS);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [activations, setActivations] = useState<
    Record<string, Activation | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const sdkReadyCalled = React.useRef(false);

  // Load saved params + all content types in parallel
  useEffect(() => {
    async function init() {
      const [params, ctsResult] = await Promise.all([
        appSdk.app?.getParameters?.() ?? null,
        appSdk.space.getContentTypes(),
      ]);

      const cts = (ctsResult?.items ?? []).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setContentTypes(cts);

      // Load connectors — fall back to seed if none persisted
      if (params?.connectors && params.connectors.length > 0) {
        setConnectors(params.connectors);
      }

      // Load custom categories
      if (params?.customCategories) {
        setCustomCategories(params.customCategories);
      }

      // Load + migrate mappings
      if (params?.mappings?.length) {
        const migrated = migrateMappings(params.mappings);
        const map: Record<string, Activation> = {};
        for (const m of migrated) {
          map[m.contentTypeId] = {
            fieldId: m.fieldId,
            connectorId: m.connectorId,
            mode: m.mode,
          };
        }
        setActivations(map);
      }

      setLoading(false);
      setReady(true);
      // Note: appSdk.app.setReady() is called in the onConfigure effect below,
      // after the handler is registered — avoids race where Save appears before
      // onConfigure is wired up.
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-register onConfigure whenever activations OR connectors change so the
  // handler closes over latest state. targetState auto-attaches the 3P App
  // widget to each mapped field on save.
  // Skip in PAGE context — sdk.app is undefined there (read-only mode).
  // setReady() is called here (not in init) so Contentful shows the Save button
  // only after the handler is registered — eliminates the race condition.
  useEffect(() => {
    if (!ready || !appSdk.app) return;
    const cleanup = appSdk.app.onConfigure(() => {
      const mappings = Object.entries(activations)
        .filter((entry): entry is [string, Activation] => entry[1] !== null)
        .map(([ctId, v]) => {
          const legacySimulator =
            CONNECTOR_ID_TO_SIMULATOR_TYPE[v.connectorId] ?? 'SHOPIFY';
          return {
            contentTypeId: ctId,
            fieldId: v.fieldId,
            connectorId: v.connectorId,
            simulatorType: legacySimulator,
            mode: v.mode,
          };
        });
      // Build targetState so Contentful re-applies the "3P App Integration"
      // field appearance on every save. Only include content types that have
      // an active mapping — touching unrelated CTs causes EditorInterface
      // conflicts and "Failed to update app configuration".
      // Note: only { fieldId } is needed per control; the SDK binds the
      // current app automatically. The old code included widgetNamespace +
      // widgetId which conflicted with existing EditorInterface entries.
      const EditorInterface: Record<
        string,
        { controls: Array<{ fieldId: string }> }
      > = {};
      for (const m of mappings) {
        if (!EditorInterface[m.contentTypeId]) {
          EditorInterface[m.contentTypeId] = { controls: [] };
        }
        EditorInterface[m.contentTypeId].controls.push({
          fieldId: m.fieldId,
        });
      }

      return {
        parameters: { mappings, connectors, customCategories },
        ...(Object.keys(EditorInterface).length > 0
          ? { targetState: { EditorInterface } }
          : {}),
      };
    });
    // Signal ready once, after first onConfigure registration.
    if (!sdkReadyCalled.current) {
      sdkReadyCalled.current = true;
      appSdk.app.setReady();
    }
    return cleanup;
  }, [activations, connectors, customCategories, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCt = (ct: ContentType) => {
    setActivations((prev) => {
      if (prev[ct.sys.id]) {
        const next = { ...prev };
        delete next[ct.sys.id];
        return next;
      }
      // Default: first field, first connector in list
      const defaultConnectorId =
        connectors[0]?.id ?? findConnector(connectors, 'shopify')?.id ?? '';
      return {
        ...prev,
        [ct.sys.id]: {
          fieldId: ct.fields[0]?.id ?? '',
          connectorId: defaultConnectorId,
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

  return (
    <Box padding="spacingL">
      <Box style={{ width: '60%', margin: '0 auto' }}>
        <Stack flexDirection="column" spacing="spacingL" alignItems="stretch">
          <Box style={{ width: '100%', textAlign: 'center' }}>
            <Heading>3P App Integration</Heading>
            <Paragraph>
              Simulate any third-party integration with rich pickers — without
              writing custom apps for every vendor.
            </Paragraph>
          </Box>

          {loading ? (
            <Flex alignItems="center" gap="spacingS" justifyContent="center">
              <Spinner />
              <Text fontColor="gray600">Loading content types…</Text>
            </Flex>
          ) : (
            <Tabs defaultTab="mappings">
              <Tabs.List>
                <Tabs.Tab panelId="mappings">Mappings</Tabs.Tab>
                <Tabs.Tab panelId="connectors">Connectors</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel id="mappings">
                <Box style={{ paddingTop: 16 }}>
                  <MappingsTab
                    contentTypes={contentTypes}
                    connectors={connectors}
                    activations={activations}
                    onToggle={toggleCt}
                    onUpdate={updateActivation}
                  />
                </Box>
              </Tabs.Panel>

              <Tabs.Panel id="connectors">
                <Box style={{ paddingTop: 16 }}>
                  <ConnectorsTab
                    connectors={connectors}
                    onChange={setConnectors}
                    customCategories={customCategories}
                    onCustomCategoriesChange={setCustomCategories}
                  />
                </Box>
              </Tabs.Panel>
            </Tabs>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
