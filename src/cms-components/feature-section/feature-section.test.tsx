import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LivePreviewProvider } from '@/lib/live-preview';

import { FeatureSection } from './feature-section';

vi.mock('@ninetailed/experience.js-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Experience: ({ component: Comp, ...props }: any) =>
    Comp ? React.createElement(Comp, props) : null,
  useNinetailed: () => ({ track: vi.fn(), identify: vi.fn() }),
}));

const makeRtJson = (text: string) => ({
  json: {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
      },
    ],
  },
});

const makeItem = (
  id: string,
  title: string,
  description: string,
  colorVariant?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray',
  href?: string,
) => ({
  __typename: 'FeatureSectionItem' as const,
  sys: { id },
  internalName: `Item ${id}`,
  icon: null,
  animationKey: null,
  title: makeRtJson(title),
  description: makeRtJson(description),
  colorVariant: colorVariant ?? null,
  href: href ?? null,
});

const baseEntry = {
  __typename: 'FeatureSection' as const,
  sys: { id: 'fs-1', spaceId: 'test' },
  internalName: 'Test Feature Section',
  label: makeRtJson('Platform'),
  title: makeRtJson('Everything you need'),
  description: makeRtJson('Built for modern teams'),
  displayVariant: 'icon-text' as const,
  columns: 3,
  itemsCollection: {
    items: [
      makeItem('item-1', 'Fast Delivery', 'Ship features in hours'),
      makeItem('item-2', 'Secure by Default', 'Enterprise-grade security'),
      makeItem('item-3', 'Built to Scale', 'Handles any load'),
    ],
  },
  sectionStyle: null,
  ntExperiencesCollection: null,
};

describe('FeatureSection', () => {
  it('renders label richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Platform')).toBeTruthy();
  });

  it('renders title richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Everything you need')).toBeTruthy();
  });

  it('renders description richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Built for modern teams')).toBeTruthy();
  });

  it('renders all item titles (icon-text variant)', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Fast Delivery')).toBeTruthy();
    expect(screen.getByText('Secure by Default')).toBeTruthy();
    expect(screen.getByText('Built to Scale')).toBeTruthy();
  });

  it('renders item descriptions', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Ship features in hours')).toBeTruthy();
  });

  it('renders cards variant without error', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection
          data={{
            ...baseEntry,
            displayVariant: 'cards',
            itemsCollection: {
              items: [
                makeItem('c-1', 'Card One', 'Card desc one', 'blue'),
                makeItem('c-2', 'Card Two', 'Card desc two', 'green'),
              ],
            },
          }}
        />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Card One')).toBeTruthy();
    expect(screen.getByText('Card Two')).toBeTruthy();
  });

  it('renders integrations variant with link when href is set', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection
          data={{
            ...baseEntry,
            displayVariant: 'integrations',
            itemsCollection: {
              items: [
                makeItem('i-1', 'Stripe', 'Payment processing', 'blue', '/integrations/stripe'),
              ],
            },
          }}
        />
      </LivePreviewProvider>,
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toContain('/integrations/stripe');
  });

  it('renders integrations variant without link when href is null', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection
          data={{
            ...baseEntry,
            displayVariant: 'integrations',
            itemsCollection: {
              items: [makeItem('i-2', 'Twilio', 'SMS notifications')],
            },
          }}
        />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Twilio')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders nothing when itemsCollection is empty', () => {
    const { container } = render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection
          data={{ ...baseEntry, itemsCollection: { items: [] } }}
        />
      </LivePreviewProvider>,
    );
    // Grid div should not exist
    const grids = container.querySelectorAll('.grid');
    expect(grids.length).toBe(0);
  });

  it('does not render label when label is null', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <FeatureSection data={{ ...baseEntry, label: null }} />
      </LivePreviewProvider>,
    );
    expect(screen.queryByText('Platform')).toBeNull();
  });
});
