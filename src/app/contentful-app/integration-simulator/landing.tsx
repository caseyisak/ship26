'use client';

import {
  Box,
  Button,
  Heading,
  Note,
  Paragraph,
  Stack,
  Text,
} from '@contentful/f36-components';
import { useEffect, useMemo } from 'react';

import { SEED_CONNECTORS } from './seed-connectors';

export function IntegrationSimulatorLanding({ sdk }: { sdk: unknown }) {
  const byCategory = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const c of SEED_CONNECTORS) {
      (map[c.category] ??= []).push(c.label);
    }
    return map;
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sdkAny = sdk as any;

  useEffect(() => {
    // Set initial height then start auto-resizer
    sdkAny?.window?.updateHeight?.(480);
    sdkAny?.window?.startAutoResizer?.();
    return () => sdkAny?.window?.stopAutoResizer?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box padding="spacingL">
      <Box style={{ width: '60%', margin: '0 auto' }}>
        <Stack
          flexDirection="column"
          spacing="spacingL"
          alignItems="flex-start"
        >
          <Box style={{ width: '100%' }}>
            <Heading>3P App Integration</Heading>
            <Paragraph>
              Simulate connections to e-commerce platforms, DAMs, booking
              systems, and custom data sources. Editors get rich pickers and
              previews instead of raw JSON.
            </Paragraph>
          </Box>

          <Note variant="primary" style={{ width: '100%' }}>
            <Text>
              To configure mappings or connectors, open this app&apos;s
              settings:{' '}
              <strong>
                Apps → Manage apps → 3P App Integration → Configure
              </strong>
            </Text>
          </Note>

          <Box style={{ width: '100%' }}>
            <Heading as="h2" marginBottom="spacingS">
              Supported integrations
            </Heading>
            <Stack flexDirection="column" spacing="spacingXs">
              {Object.entries(byCategory).map(([cat, labels]) => (
                <Text key={cat}>
                  <strong>{cat}:</strong> {labels.join(', ')}
                </Text>
              ))}
            </Stack>
          </Box>

          <Button
            variant="primary"
            onClick={() => {
              // Open config screen in parent Contentful app
              if (sdkAny?.navigator?.openAppConfig) {
                sdkAny.navigator.openAppConfig();
              }
            }}
          >
            Configure integrations
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
