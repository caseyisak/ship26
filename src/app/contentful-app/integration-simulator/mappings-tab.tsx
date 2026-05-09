'use client';

import {
  Box,
  Flex,
  Note,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@contentful/f36-components';
import React, { useState } from 'react';

import type { ConnectorProfile } from './connector-types';
import { findConnector, pickerModeLabel } from './seed-connectors';

// ── Types ────────────────────────────────────────────────────────────────────

type CTField = { id: string; name: string; type: string };
type ContentType = { sys: { id: string }; name: string; fields: CTField[] };

export interface Activation {
  fieldId: string;
  /** Connector id (new canonical reference). */
  connectorId: string;
}

interface MappingsTabProps {
  contentTypes: ContentType[];
  connectors: ConnectorProfile[];
  activations: Record<string, Activation | null>;
  onToggle: (ct: ContentType) => void;
  onUpdate: (ctId: string, patch: Partial<Activation>) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function MappingsTab({
  contentTypes,
  connectors,
  activations,
  onToggle,
  onUpdate,
}: MappingsTabProps) {
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const visible = q
    ? contentTypes.filter(
        (ct) =>
          ct.name.toLowerCase().includes(q) ||
          ct.sys.id.toLowerCase().includes(q),
      )
    : contentTypes;

  const activeCts = visible.filter((ct) => activations[ct.sys.id]);
  const inactiveCts = visible.filter((ct) => !activations[ct.sys.id]);

  return (
    <Stack flexDirection="column" spacing="spacingM" alignItems="stretch">
      <Note variant="primary" style={{ width: '100%' }}>
        Each mapping links a content-type field to a connector. Editors will see
        that connector&apos;s picker on the field instead of the raw JSON
        editor. Need to add a new connector? Open the{' '}
        <strong>Connectors</strong> tab.
      </Note>

      <TextInput
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        placeholder="Search content types…"
        size="small"
      />

      {/* Active mappings */}
      {activeCts.length > 0 && (
        <Box>
          <Text fontWeight="fontWeightDemiBold" style={{ fontSize: 13 }}>
            Active mappings{' '}
            <Text fontColor="gray500" style={{ fontSize: 12 }}>
              ({activeCts.length} active currently)
            </Text>
          </Text>
        </Box>
      )}
      {activeCts.map((ct) => (
        <CtRow
          key={ct.sys.id}
          ct={ct}
          activation={activations[ct.sys.id]!}
          connectors={connectors}
          onToggle={() => onToggle(ct)}
          onUpdate={(patch) => onUpdate(ct.sys.id, patch)}
        />
      ))}

      {/* Available CTs */}
      {inactiveCts.length > 0 && (
        <Box style={{ marginTop: activeCts.length > 0 ? 8 : 0 }}>
          <Text fontColor="gray500" style={{ fontSize: 12 }}>
            Available content types
          </Text>
        </Box>
      )}
      {inactiveCts.map((ct) => (
        <CtRow
          key={ct.sys.id}
          ct={ct}
          activation={null}
          connectors={connectors}
          onToggle={() => onToggle(ct)}
          onUpdate={() => {}}
        />
      ))}

      {activeCts.some((ct) => !activations[ct.sys.id]?.fieldId) && (
        <Note variant="warning">
          All active content types must have a field selected before saving.
        </Note>
      )}

      <Text
        fontColor="gray500"
        style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4 }}
      >
        Tip: Saving here automatically updates the field appearance for each
        active mapping.
      </Text>
    </Stack>
  );
}

// ── CT row ───────────────────────────────────────────────────────────────────

function CtRow({
  ct,
  activation,
  connectors,
  onToggle,
  onUpdate,
}: {
  ct: ContentType;
  activation: Activation | null;
  connectors: ConnectorProfile[];
  onToggle: () => void;
  onUpdate: (patch: Partial<Activation>) => void;
}) {
  const isActive = activation !== null;
  const connector = isActive
    ? findConnector(connectors, activation.connectorId)
    : undefined;

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
      {/* Header row: name + (badge if active) + toggle */}
      <Flex alignItems="center" justifyContent="space-between">
        <Box style={{ minWidth: 0 }}>
          <Text fontWeight="fontWeightDemiBold">{ct.name}</Text>
          <Text
            fontColor="gray500"
            style={{ display: 'block', fontSize: 11, marginTop: 2 }}
          >
            {ct.sys.id}
          </Text>
        </Box>
        <Flex alignItems="center" gap="spacingS">
          {isActive && (
            <Box
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#E6F4EC',
                border: '1px solid #0E8A4E',
              }}
            >
              <Text
                aria-hidden
                style={{ color: '#0E8A4E', fontSize: 11, lineHeight: 1 }}
              >
                ✓
              </Text>
              <Text style={{ color: '#0E8A4E', fontSize: 11, fontWeight: 600 }}>
                Appearance set
              </Text>
            </Box>
          )}
          <Switch
            id={`ct-toggle-${ct.sys.id}`}
            isChecked={isActive}
            onChange={onToggle}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Switch>
        </Flex>
      </Flex>

      {/* Field + connector selectors (only when active) */}
      {isActive && activation && (
        <>
          <Flex gap="spacingS" style={{ marginTop: 12 }}>
            <Box style={{ flex: 1 }}>
              <Text
                fontColor="gray700"
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
            <Box style={{ flex: 1 }}>
              <Text
                fontColor="gray700"
                style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
              >
                Connector
              </Text>
              <Select
                value={activation.connectorId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onUpdate({ connectorId: e.target.value })
                }
                size="small"
              >
                {connectors.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.label}
                  </Select.Option>
                ))}
              </Select>
            </Box>
          </Flex>

          {/* Connector type subtext */}
          {connector && (
            <Flex justifyContent="flex-end" style={{ marginTop: 6 }}>
              <Text fontColor="gray500" style={{ fontSize: 11 }}>
                Connector type: {connector.category} ·{' '}
                {pickerModeLabel(connector.pickerMode)}
              </Text>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
}
