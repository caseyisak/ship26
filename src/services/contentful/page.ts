import type { HeroFragment } from '@/block-renderer/types';

export type PageSection = HeroFragment;

export type PageData = {
  slug: string;
  internalName?: string | null;
  sectionsCollection?: {
    items: (PageSection | null)[];
  } | null;
};

/**
 * Mock getPageBySlug for M2. Returns a single page with one Hero.
 * Replace with real Contentful fetch in M3/M4.
 */
export async function getPageBySlug({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}): Promise<PageData | null> {
  void locale;
  const mockHero: HeroFragment = {
    __typename: 'Hero',
    sys: { id: 'mock-hero-1', spaceId: 'mock' },
    internalName: 'Home Hero',
    headline: 'Simplifying Payments for Growing Business',
    subheadline:
      'Streamlining transactions for expanding enterprises. Our solutions simplify payment processes.',
    ctaText: 'Get Started',
    ctaUrl: '/pricing',
    variant: 'default',
  };
  return {
    slug,
    internalName: `Page: ${slug}`,
    sectionsCollection: {
      items: [mockHero],
    },
  };
}

/**
 * Mock getPageSlugs for M2. Returns a single slug for static generation.
 */
export async function getPageSlugs({
  locale,
}: {
  locale: string;
}): Promise<string[]> {
  void locale;
  return ['home'];
}
