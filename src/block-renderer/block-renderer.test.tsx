import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LivePreviewProvider } from '@/lib/live-preview';

import { BlockRenderer } from './block-renderer';

vi.mock('@/lib/feature-visual-registry', () => ({
  getFeatureVisualComponent: () => null,
}));

describe('BlockRenderer', () => {
  it('can be imported and rendered', () => {
    expect(BlockRenderer).toBeDefined();
  });

  it('renders InvalidDataError when data is null', () => {
    render(<BlockRenderer data={null} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/data for the entry/i)).toBeTruthy();
  });

  it('renders MissingConfigError when data has unknown __typename', () => {
    render(
      <BlockRenderer
        data={{
          __typename: 'UnknownBlock',
          sys: { id: 'test-id' },
          headline: 'ignored',
        }}
      />,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(
      screen.getByText(/Could not find a block renderer config/i),
    ).toBeTruthy();
    expect(screen.getByText('UnknownBlock')).toBeTruthy();
  });

  it('renders Hero with mock Hero data', () => {
    const mockHero = {
      __typename: 'Hero' as const,
      sys: { id: 'hero-1', spaceId: 'test' },
      headline: 'Test Headline',
      subheadline: 'Test subheadline',
      ctaText: 'Click me',
      ctaUrl: '/test',
    };
    render(
      <LivePreviewProvider locale="en-US">
        <BlockRenderer data={mockHero} />
      </LivePreviewProvider>,
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).to.equal('Test Headline');
    expect(screen.getByText('Test subheadline')).toBeTruthy();
    const link = screen.getByRole('link', { name: 'Click me' });
    expect(link.getAttribute('href')).to.equal('/test');
  });

  it('renders Faq with mock Faq data', () => {
    const mockFaq = {
      __typename: 'Faq' as const,
      sys: { id: 'faq-1', spaceId: 'test' },
      internalName: 'Test FAQ',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      itemsCollection: {
        items: [
          {
            __typename: 'FaqItem' as const,
            sys: { id: 'faq-item-1' },
            question: 'What is this?',
            answer: 'This is a test answer.',
          },
        ],
      },
    };
    render(
      <LivePreviewProvider locale="en-US">
        <BlockRenderer data={mockFaq} />
      </LivePreviewProvider>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).to.equal('Frequently Asked Questions');
    expect(screen.getByText('Find answers to common questions')).toBeTruthy();
    expect(screen.getByText('What is this?')).toBeTruthy();
  });

  it('renders DataViz with mock DataViz data', () => {
    const mockDataViz = {
      __typename: 'DataViz' as const,
      sys: { id: 'dataviz-1', spaceId: 'test' },
      internalName: 'Test Data Viz',
      title: 'Sales Data',
      description: 'Quarterly sales by department',
      chartType: 'groupedBar',
      csvData: { url: '//example.com/test.csv' },
      colorScheme: 'default',
      showLegend: true,
    };
    render(
      <LivePreviewProvider locale="en-US">
        <BlockRenderer data={mockDataViz} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Sales Data')).toBeTruthy();
    expect(screen.getByText('Quarterly sales by department')).toBeTruthy();
  });

  it('renders Features with mock Features data', () => {
    const mockFeatures = {
      __typename: 'Features' as const,
      sys: { id: 'features-1', spaceId: 'test' },
      internalName: 'Homepage Features',
      label: 'Features',
      title: 'Everything You Need to Run & Grow Your Business',
      description:
        'All the tools and resources necessary for managing and expanding your business.',
      itemsCollection: {
        items: [
          {
            __typename: 'FeatureItem' as const,
            sys: { id: 'fi-1' },
            title: 'Checkout',
            description: 'Embed checkout into your website.',
            image: null,
            animationKey: 'checkout',
          },
          {
            __typename: 'FeatureItem' as const,
            sys: { id: 'fi-2' },
            title: 'Recurring Billing',
            description: 'Collect and retain more revenue.',
            image: null,
            animationKey: 'recurring-billing',
          },
        ],
      },
      ntExperiencesCollection: { items: [] },
    };
    render(
      <LivePreviewProvider locale="en-US">
        <BlockRenderer data={mockFeatures} />
      </LivePreviewProvider>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).to.equal(
      'Everything You Need to Run & Grow Your Business',
    );
    expect(screen.getByText('Features')).toBeTruthy();
    expect(screen.getByText('Embed checkout into your website.')).toBeTruthy();
    expect(screen.getByText('Checkout')).toBeTruthy();
    expect(screen.getByText('Recurring Billing')).toBeTruthy();
  });
});
