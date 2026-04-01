import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  fetchGraphQL: vi.fn(),
}));

describe('getSocialPostByEntryId', () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('always calls fetchGraphQL with preview: true regardless of draftMode', async () => {
    const { fetchGraphQL } = await import('./client');
    const mockFetch = vi.mocked(fetchGraphQL);
    mockFetch.mockResolvedValueOnce({
      socialPostCollection: {
        items: [
          {
            __typename: 'SocialPost',
            sys: { id: 'sp-123' },
            internalName: 'Test Post',
            channel: 'Twitter',
            postType: 'gameday',
            copy: 'Go Bears!',
            hashtags: ['#Bears'],
            status: null,
            game: null,
            media: null,
          },
        ],
      },
    });

    const { getSocialPostByEntryId } = await import('./social-post');
    const result = await getSocialPostByEntryId({ entryId: 'sp-123', locale: 'en-US' });

    expect(result).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledOnce();

    const callArgs = mockFetch.mock.calls[0][0];
    expect(callArgs.preview).toBe(true);
    expect((callArgs.variables as Record<string, unknown>)['preview']).toBe(true);
  });

  it('returns null when entry is not found', async () => {
    const { fetchGraphQL } = await import('./client');
    const mockFetch = vi.mocked(fetchGraphQL);
    mockFetch.mockResolvedValueOnce({
      socialPostCollection: { items: [] },
    });

    const { getSocialPostByEntryId } = await import('./social-post');
    const result = await getSocialPostByEntryId({ entryId: 'missing', locale: 'en-US' });

    expect(result).toBeNull();
  });
});
