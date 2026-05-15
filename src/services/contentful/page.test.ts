import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────────

// next/headers must be mocked before importing page.ts (server-only module)
vi.mock('next/headers', () => ({
  draftMode: vi.fn().mockResolvedValue({ isEnabled: false }),
}));

// Mock fetchGraphQL so no real network calls are made
vi.mock('./client', () => ({
  fetchGraphQL: vi.fn(),
}));

// Stub all query strings — their content doesn't matter for dispatch tests
vi.mock('./queries', () => ({
  PAGE_SECTIONS_SHELL: 'PAGE_SECTIONS_SHELL_STUB',
  PAGE_BY_SLUG: 'PAGE_BY_SLUG_STUB',
  PAGE_SLUGS: 'PAGE_SLUGS_STUB',
  HERO_BY_ID: 'HERO_BY_ID_STUB',
  FAQ_BY_ID: 'FAQ_BY_ID_STUB',
  TABBED_CONTENT_BY_ID: 'TABBED_CONTENT_BY_ID_STUB',
  CARDS_WRAPPER_BY_ID: 'CARDS_WRAPPER_BY_ID_STUB',
  DATA_VIZ_BY_ID: 'DATA_VIZ_BY_ID_STUB',
  BANNER_BY_ID: 'BANNER_BY_ID_STUB',
  TWO_ACROSS_BY_ID: 'TWO_ACROSS_BY_ID_STUB',
  BLOG_POSTS_SECTION_BY_ID: 'BLOG_POSTS_SECTION_BY_ID_STUB',
  CTA_SECTION_BY_ID: 'CTA_SECTION_BY_ID_STUB',
  PRICING_BY_ID: 'PRICING_BY_ID_STUB',
  ICON_GRID_BY_ID: 'ICON_GRID_BY_ID_STUB',
  FEATURE_SHOWCASE_BY_ID: 'FEATURE_SHOWCASE_BY_ID_STUB',
  MEDIA_CARD_GRID_BY_ID: 'MEDIA_CARD_GRID_BY_ID_STUB',
  ICON_FEATURE_GRID_BY_ID: 'ICON_FEATURE_GRID_BY_ID_STUB',
  FEATURE_SECTION_BY_ID: 'FEATURE_SECTION_BY_ID_STUB',
  FORM_BY_ID: 'FORM_BY_ID_STUB',
  PDP_BY_ID: 'PDP_BY_ID_STUB',
  DYNAMIC_LISTING_BY_ID: 'DYNAMIC_LISTING_BY_ID_STUB',
  PRODUCT_LISTING_BY_ID: 'PRODUCT_LISTING_BY_ID_STUB',
  NEWS_WRAPPER_BY_ID: 'NEWS_WRAPPER_BY_ID_STUB',
}));

// Import after mocks are registered
import { fetchGraphQL } from './client';
import { getPageBySlugTwoPass } from './page';

const mockFetch = fetchGraphQL as ReturnType<typeof vi.fn>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeShellItem(typename: string, id: string) {
  return { __typename: typename, sys: { id } };
}

function makeShellResponse(shellItems: Array<{ __typename: string; sys: { id: string } }>) {
  return {
    pageCollection: {
      items: [
        {
          __typename: 'Page',
          sys: { id: 'page-1' },
          slug: 'home',
          internalName: 'Home',
          sectionsCollection: { items: shellItems },
          ntExperiencesCollection: { items: [] },
        },
      ],
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getPageBySlugTwoPass', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches one BY_ID fetch per section in the shell', async () => {
    const shell = [
      makeShellItem('Hero', 'hero-1'),
      makeShellItem('Faq', 'faq-1'),
    ];

    // Call 1: shell fetch
    mockFetch.mockResolvedValueOnce(makeShellResponse(shell));
    // Call 2: Hero BY_ID
    mockFetch.mockResolvedValueOnce({
      heroCollection: { items: [{ __typename: 'Hero', sys: { id: 'hero-1' }, internalName: 'H1' }] },
    });
    // Call 3: Faq BY_ID
    mockFetch.mockResolvedValueOnce({
      faqCollection: { items: [{ __typename: 'Faq', sys: { id: 'faq-1' }, internalName: 'F1' }] },
    });

    const result = await getPageBySlugTwoPass({ slug: 'home', locale: 'en-US' });

    // Shell fetch + 2 section fetches = 3 total
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result?.sectionsCollection?.items).toHaveLength(2);
  });

  it('preserves section order from the shell response', async () => {
    const shell = [
      makeShellItem('Hero', 'hero-1'),
      makeShellItem('Banner', 'banner-1'),
      makeShellItem('Faq', 'faq-1'),
    ];

    mockFetch.mockResolvedValueOnce(makeShellResponse(shell));
    mockFetch.mockResolvedValueOnce({
      heroCollection: { items: [{ __typename: 'Hero', sys: { id: 'hero-1' } }] },
    });
    mockFetch.mockResolvedValueOnce({
      bannerCollection: { items: [{ __typename: 'Banner', sys: { id: 'banner-1' } }] },
    });
    mockFetch.mockResolvedValueOnce({
      faqCollection: { items: [{ __typename: 'Faq', sys: { id: 'faq-1' } }] },
    });

    const result = await getPageBySlugTwoPass({ slug: 'home', locale: 'en-US' });

    const items = result?.sectionsCollection?.items ?? [];
    expect(items).toHaveLength(3);
    expect(items[0].__typename).toBe('Hero');
    expect(items[1].__typename).toBe('Banner');
    expect(items[2].__typename).toBe('Faq');
  });

  it('filters out null results from failed BY_ID fetches', async () => {
    const shell = [
      makeShellItem('Hero', 'hero-1'),
      makeShellItem('Faq', 'faq-1'),
    ];

    mockFetch.mockResolvedValueOnce(makeShellResponse(shell));
    // Hero fetch returns empty items — entry not found → null
    mockFetch.mockResolvedValueOnce({ heroCollection: { items: [] } });
    // Faq fetch succeeds
    mockFetch.mockResolvedValueOnce({
      faqCollection: { items: [{ __typename: 'Faq', sys: { id: 'faq-1' } }] },
    });

    const result = await getPageBySlugTwoPass({ slug: 'home', locale: 'en-US' });

    // Hero null is filtered; only Faq remains
    expect(result?.sectionsCollection?.items).toHaveLength(1);
    expect(result?.sectionsCollection?.items[0].__typename).toBe('Faq');
  });

  it('skips sections with unknown typename (no fetcher registered)', async () => {
    const shell = [
      makeShellItem('UnknownWidget', 'unknown-1'),
      makeShellItem('Hero', 'hero-1'),
    ];

    mockFetch.mockResolvedValueOnce(makeShellResponse(shell));
    // Only Hero BY_ID is issued — UnknownWidget has no fetcher
    mockFetch.mockResolvedValueOnce({
      heroCollection: { items: [{ __typename: 'Hero', sys: { id: 'hero-1' } }] },
    });

    const result = await getPageBySlugTwoPass({ slug: 'home', locale: 'en-US' });

    // Shell + 1 BY_ID (Hero only — UnknownWidget skipped)
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // UnknownWidget filtered out; Hero survives
    expect(result?.sectionsCollection?.items).toHaveLength(1);
    expect(result?.sectionsCollection?.items[0].__typename).toBe('Hero');
  });

  it('returns null when the slug does not match any page', async () => {
    mockFetch.mockResolvedValueOnce({ pageCollection: { items: [] } });

    const result = await getPageBySlugTwoPass({ slug: 'nonexistent', locale: 'en-US' });

    expect(result).toBeNull();
    // No section fetches after empty shell
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
