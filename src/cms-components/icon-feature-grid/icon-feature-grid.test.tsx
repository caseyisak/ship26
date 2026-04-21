import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LivePreviewProvider } from '@/lib/live-preview';

import { IconFeatureGrid } from './icon-feature-grid';

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

const makeItem = (id: string, title: string, description: string) => ({
  __typename: 'IconFeatureItem' as const,
  sys: { id },
  internalName: `Item ${id}`,
  icon: null,
  title: makeRtJson(title),
  description: makeRtJson(description),
});

const baseEntry = {
  __typename: 'IconFeatureGrid' as const,
  sys: { id: 'ifg-1', spaceId: 'test' },
  internalName: 'Test Icon Feature Grid',
  label: makeRtJson('Features'),
  title: makeRtJson("What's Included"),
  description: makeRtJson('Unlock the power of our robust features'),
  columns: 3,
  itemsCollection: {
    items: [
      makeItem('item-1', 'Payments', 'Facilitate secure transactions'),
      makeItem('item-2', 'Checkout', 'Simplify the purchasing process'),
      makeItem('item-3', 'Billing', 'Manage and track transactions'),
    ],
  },
};

describe('IconFeatureGrid', () => {
  it('renders label richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <IconFeatureGrid data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Features')).toBeTruthy();
  });

  it('renders title richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <IconFeatureGrid data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText("What's Included")).toBeTruthy();
  });

  it('renders description richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <IconFeatureGrid data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Unlock the power of our robust features')).toBeTruthy();
  });

  it('renders all item titles', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <IconFeatureGrid data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Payments')).toBeTruthy();
    expect(screen.getByText('Checkout')).toBeTruthy();
    expect(screen.getByText('Billing')).toBeTruthy();
  });

  it('renders item descriptions', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <IconFeatureGrid data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Facilitate secure transactions')).toBeTruthy();
  });

  it('renders nothing when itemsCollection is empty', () => {
    const { container } = render(
      <LivePreviewProvider locale="en-US">
        <IconFeatureGrid
          data={{ ...baseEntry, itemsCollection: { items: [] } }}
        />
      </LivePreviewProvider>,
    );
    const lists = container.querySelectorAll('ul');
    expect(lists.length).toBe(0);
  });

  it('does not render label when label is null', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <IconFeatureGrid data={{ ...baseEntry, label: null }} />
      </LivePreviewProvider>,
    );
    expect(screen.queryByText('Features')).toBeNull();
  });

  it('renders icon when icon url is provided', () => {
    const entryWithIcon = {
      ...baseEntry,
      itemsCollection: {
        items: [
          {
            ...makeItem('item-icon', 'Payments', 'Facilitate secure transactions'),
            icon: { url: '//images.ctfassets.net/icon.svg' },
          },
        ],
      },
    };
    const { container } = render(
      <LivePreviewProvider locale="en-US">
        <IconFeatureGrid data={entryWithIcon} />
      </LivePreviewProvider>,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    // protocol-relative URL should be prefixed with https:
    expect(img?.getAttribute('src')).toBe('https://images.ctfassets.net/icon.svg');
  });
});
