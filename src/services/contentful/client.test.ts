import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('fetchGraphQL', () => {
  const mockFetch = vi.fn();
  const origEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('fetch', mockFetch);
    process.env = {
      ...origEnv,
      CONTENTFUL_SPACE_ID: 'test-space',
      CONTENTFUL_ACCESS_TOKEN: 'test-delivery-token',
      CONTENTFUL_PREVIEW_ACCESS_TOKEN: 'test-preview-token',
      CONTENTFUL_ENVIRONMENT: 'master',
    };
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = origEnv;
  });

  it('minifies multi-line query whitespace before sending', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { result: true } }),
    });

    const { fetchGraphQL } = await import('./client');

    const multilineQuery = `
      query TestQuery {
        pageCollection {
          items {
            slug
          }
        }
      }
    `;

    await fetchGraphQL({ query: multilineQuery });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.query).toBe('query TestQuery { pageCollection { items { slug } } }');
    expect(body.query).not.toMatch(/\n/);
    expect(body.query).not.toMatch(/\s{2,}/);
  });

  it('trims leading and trailing whitespace from the query', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { ok: true } }),
    });

    const { fetchGraphQL } = await import('./client');

    await fetchGraphQL({ query: '  { field }  ' });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.query).toBe('{ field }');
  });
});
