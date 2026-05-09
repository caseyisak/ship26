'use client';

import {
  Box,
  Button,
  Flex,
  Note,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@contentful/f36-components';
import React, { useMemo, useState } from 'react';

import type { ConnectorProfile, PickerMode } from './connector-types';
import {
  defaultSeedDataForMode,
  pickerModeLabel,
  seedDataHelperText,
} from './seed-connectors';

interface ConnectorsTabProps {
  connectors: ConnectorProfile[];
  onChange: (next: ConnectorProfile[]) => void;
}

const PICKER_MODE_OPTIONS: Array<{
  value: PickerMode;
  label: string;
  subtitle: string;
}> = [
  {
    value: 'gallery',
    label: 'Gallery',
    subtitle: 'Image cards · DAM, Ecom',
  },
  {
    value: 'table',
    label: 'Table',
    subtitle: 'Sortable rows · custom DBs',
  },
  {
    value: 'embed',
    label: 'Embed',
    subtitle: 'Hardcoded React component',
  },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ConnectorsTab({ connectors, onChange }: ConnectorsTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    const baseId = `connector-${connectors.length + 1}`;
    let newId = baseId;
    let n = 1;
    while (connectors.some((c) => c.id === newId)) {
      n += 1;
      newId = `${baseId}-${n}`;
    }
    const newConnector: ConnectorProfile = {
      id: newId,
      label: 'New connector',
      category: 'Custom',
      brand: { color: '#0059C8', textColor: '#FFFFFF' },
      pickerMode: 'gallery',
      seedData: defaultSeedDataForMode('gallery'),
    };
    onChange([...connectors, newConnector]);
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, patch: Partial<ConnectorProfile>) => {
    onChange(connectors.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleDelete = (id: string) => {
    onChange(connectors.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <Stack flexDirection="column" spacing="spacingM" alignItems="stretch">
      <Note variant="primary" style={{ width: '100%' }}>
        First time? Define your connectors here, then go to{' '}
        <strong>Mappings</strong> to attach them to content type fields. Each
        connector represents a third-party data source (e-commerce, DAM,
        booking, custom DB).
      </Note>

      <Flex justifyContent="space-between" alignItems="center">
        <Text fontColor="gray500" style={{ fontSize: 12 }}>
          {connectors.length} connector{connectors.length !== 1 ? 's' : ''}{' '}
          configured
        </Text>
        <Button variant="primary" size="small" onClick={handleAdd}>
          + Add connector
        </Button>
      </Flex>

      <Stack flexDirection="column" spacing="spacingXs" alignItems="stretch">
        {connectors.map((c) => (
          <ConnectorCard
            key={c.id}
            connector={c}
            allConnectorIds={connectors.map((x) => x.id)}
            isExpanded={expandedId === c.id}
            onToggleExpand={() =>
              setExpandedId(expandedId === c.id ? null : c.id)
            }
            onUpdate={(patch) => handleUpdate(c.id, patch)}
            onDelete={() => handleDelete(c.id)}
          />
        ))}
        {connectors.length === 0 && (
          <Box
            style={{
              padding: '24px 16px',
              border: '1px dashed #CFD9E0',
              borderRadius: 8,
              textAlign: 'center',
            }}
          >
            <Text fontColor="gray500">
              No connectors yet. Click &ldquo;+ Add connector&rdquo; to create
              one.
            </Text>
          </Box>
        )}
      </Stack>

      <Text
        fontColor="gray500"
        style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4 }}
      >
        Tip: Connectors are saved when you click the Contentful Save button at
        the top of this screen.
      </Text>
    </Stack>
  );
}

// ── Single connector card ────────────────────────────────────────────────────

interface ConnectorCardProps {
  connector: ConnectorProfile;
  allConnectorIds: string[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<ConnectorProfile>) => void;
  onDelete: () => void;
}

function ConnectorCard({
  connector,
  allConnectorIds,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
}: ConnectorCardProps) {
  return (
    <Box
      style={{
        border: `1px solid ${isExpanded ? '#0059C8' : '#CFD9E0'}`,
        borderRadius: 8,
        background: isExpanded ? '#F0F5FF' : '#FAFBFC',
        transition: 'border-color 0.15s, background 0.15s',
        overflow: 'hidden',
      }}
    >
      {/* Header — always visible, click anywhere to toggle */}
      <Box
        as="button"
        type="button"
        onClick={onToggleExpand}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <Box
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: connector.brand.color,
            flexShrink: 0,
          }}
        />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex alignItems="baseline" gap="spacingXs">
            <Text fontWeight="fontWeightDemiBold">{connector.label}</Text>
            <Text
              fontColor="gray500"
              style={{ fontSize: 11, fontFamily: 'monospace' }}
            >
              {connector.id}
            </Text>
          </Flex>
        </Box>
        <Text fontColor="gray500" style={{ fontSize: 12 }}>
          {connector.category} · {pickerModeLabel(connector.pickerMode)}
        </Text>
        <Text
          fontColor="gray500"
          aria-hidden
          style={{ fontSize: 14, marginLeft: 8 }}
        >
          {isExpanded ? '▴' : '▾'}
        </Text>
      </Box>

      {/* Form — only when expanded */}
      {isExpanded && (
        <Box
          style={{
            padding: '0 16px 16px 16px',
            borderTop: '1px solid #DCE3EA',
          }}
        >
          <ConnectorForm
            connector={connector}
            allConnectorIds={allConnectorIds}
            onUpdate={onUpdate}
          />

          <Flex
            justifyContent="space-between"
            alignItems="center"
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid #DCE3EA',
            }}
          >
            <Text fontColor="gray500" style={{ fontSize: 11 }}>
              Edits live-update — save with the Contentful Save button at top.
            </Text>
            <Button
              variant="negative"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete connector
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
}

// ── Form ─────────────────────────────────────────────────────────────────────

interface ConnectorFormProps {
  connector: ConnectorProfile;
  allConnectorIds: string[];
  onUpdate: (patch: Partial<ConnectorProfile>) => void;
}

function ConnectorForm({
  connector,
  allConnectorIds,
  onUpdate,
}: ConnectorFormProps) {
  const [seedDraft, setSeedDraft] = useState<string>(() =>
    JSON.stringify(connector.seedData, null, 2),
  );
  const [seedError, setSeedError] = useState<string | null>(null);

  // Keep textarea synced when picker mode changes externally (mode switch
  // re-seeds default JSON)
  const seedJsonForCurrentMode = useMemo(
    () => JSON.stringify(connector.seedData, null, 2),
    [connector.seedData],
  );
  React.useEffect(() => {
    setSeedDraft(seedJsonForCurrentMode);
    setSeedError(null);
  }, [seedJsonForCurrentMode]);

  const handleLabelChange = (label: string) => {
    // Auto-update id from label IF id is the auto-generated default
    // ("connector-N" / "connector-N-M") and not yet referenced anywhere
    // else. Prevents accidental orphaning of mappings.
    const isAutoId = /^connector-\d+(-\d+)?$/.test(connector.id);
    if (isAutoId) {
      const candidate = slugify(label);
      if (candidate && !allConnectorIds.some((x) => x === candidate)) {
        onUpdate({ label, id: candidate });
        return;
      }
    }
    onUpdate({ label });
  };

  const handleModeChange = (mode: PickerMode) => {
    if (mode === connector.pickerMode) return;
    onUpdate({ pickerMode: mode, seedData: defaultSeedDataForMode(mode) });
  };

  const handleSeedBlur = () => {
    try {
      const parsed = JSON.parse(seedDraft) as Record<string, unknown>;
      setSeedError(null);
      onUpdate({ seedData: parsed });
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  return (
    <Stack flexDirection="column" spacing="spacingM" alignItems="stretch">
      {/* Row 1: Label + Category */}
      <Flex gap="spacingS">
        <Box style={{ flex: 1 }}>
          <Text
            fontColor="gray700"
            style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
          >
            Label
          </Text>
          <TextInput
            value={connector.label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleLabelChange(e.target.value)
            }
            size="small"
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <Text
            fontColor="gray700"
            style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
          >
            Category
          </Text>
          <TextInput
            value={connector.category}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate({ category: e.target.value })
            }
            size="small"
          />
        </Box>
      </Flex>

      {/* Row 2: Brand color + Text color */}
      <Flex gap="spacingS">
        <Box style={{ flex: 1 }}>
          <Text
            fontColor="gray700"
            style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
          >
            Brand color
          </Text>
          <Flex alignItems="center" gap="spacingXs">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                border: '1px solid #CFD9E0',
                background: connector.brand.color,
                flexShrink: 0,
              }}
            />
            <TextInput
              value={connector.brand.color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate({
                  brand: { ...connector.brand, color: e.target.value },
                })
              }
              size="small"
            />
          </Flex>
        </Box>
        <Box style={{ flex: 1 }}>
          <Text
            fontColor="gray700"
            style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
          >
            Text color
          </Text>
          <Flex alignItems="center" gap="spacingXs">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                border: '1px solid #CFD9E0',
                background: connector.brand.textColor,
                flexShrink: 0,
              }}
            />
            <TextInput
              value={connector.brand.textColor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate({
                  brand: { ...connector.brand, textColor: e.target.value },
                })
              }
              size="small"
            />
          </Flex>
        </Box>
      </Flex>

      {/* Row 3: Picker mode (Variant A — radio cards) */}
      <Box>
        <Text
          fontColor="gray700"
          style={{ display: 'block', fontSize: 12, marginBottom: 6 }}
        >
          Picker mode
        </Text>
        <Flex gap="spacingS">
          {PICKER_MODE_OPTIONS.map((opt) => {
            const selected = connector.pickerMode === opt.value;
            return (
              <Box
                key={opt.value}
                as="button"
                type="button"
                onClick={() => handleModeChange(opt.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: `${selected ? 2 : 1}px solid ${
                    selected ? '#0059C8' : '#CFD9E0'
                  }`,
                  borderRadius: 6,
                  background: selected ? '#E6F0FA' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <Flex alignItems="center" gap="spacingXs">
                  <Box
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: `2px solid ${selected ? '#0059C8' : '#CFD9E0'}`,
                      background: '#FFFFFF',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {selected && (
                      <Box
                        style={{
                          position: 'absolute',
                          inset: 2,
                          borderRadius: '50%',
                          background: '#0059C8',
                        }}
                      />
                    )}
                  </Box>
                  <Text fontWeight="fontWeightDemiBold">{opt.label}</Text>
                </Flex>
                <Text
                  fontColor="gray500"
                  style={{
                    fontSize: 11,
                    display: 'block',
                    marginTop: 4,
                    marginLeft: 22,
                  }}
                >
                  {opt.subtitle}
                </Text>
              </Box>
            );
          })}
        </Flex>
      </Box>

      {/* Row 4: Seed data JSON */}
      <Box>
        <Text
          fontColor="gray700"
          style={{ display: 'block', fontSize: 12, marginBottom: 4 }}
        >
          Seed data (JSON)
        </Text>
        <Text
          fontColor="gray500"
          style={{
            display: 'block',
            fontSize: 11,
            fontStyle: 'italic',
            marginBottom: 6,
          }}
        >
          {seedDataHelperText(connector.pickerMode)}
        </Text>
        <Textarea
          value={seedDraft}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setSeedDraft(e.target.value)
          }
          onBlur={handleSeedBlur}
          rows={6}
          style={{
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 12,
          }}
        />
        {seedError && (
          <Text
            fontColor="red500"
            style={{ display: 'block', fontSize: 11, marginTop: 4 }}
          >
            Invalid JSON: {seedError}
          </Text>
        )}
      </Box>
    </Stack>
  );
}
