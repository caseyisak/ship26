import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { LivePreviewProvider } from '@/lib/live-preview';

import { BlockRenderer } from './block-renderer';

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
});
