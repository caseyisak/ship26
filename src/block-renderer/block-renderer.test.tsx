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
});
