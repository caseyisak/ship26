import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

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
    render(<BlockRenderer data={mockHero} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).to.equal('Test Headline');
    expect(screen.getByText('Test subheadline')).toBeTruthy();
    const link = screen.getByRole('link', { name: 'Click me' });
    expect(link.getAttribute('href')).to.equal('/test');
  });
});
