import { draftMode } from 'next/headers';

import type {
  BannerFragment,
  BlogPostsSectionFragment,
  CardsWrapperFragment,
  CtaSectionFragment,
  DataVizFragment,
  DynamicListingFragment,
  FaqFragment,
  FeatureSectionFragment,
  FeatureShowcaseFragment,
  FormFragment,
  HeroFragment,
  IconFeatureGridFragment,
  IconGridFragment,
  MediaCardGridFragment,
  NewsWrapperFragment,
  PricingFragment,
  ProductDetailPageFragment,
  TabbedContentFragment,
  TwoAcrossFragment,
} from '@/block-renderer/types';
import { logger } from '@/lib/logger';

import { fetchGraphQL } from './client';
import {
  BANNER_BY_ID,
  BLOG_POSTS_SECTION_BY_ID,
  CARDS_WRAPPER_BY_ID,
  CTA_SECTION_BY_ID,
  DATA_VIZ_BY_ID,
  DYNAMIC_LISTING_BY_ID,
  FAQ_BY_ID,
  FEATURE_SECTION_BY_ID,
  FEATURE_SHOWCASE_BY_ID,
  FORM_BY_ID,
  HERO_BY_ID,
  ICON_FEATURE_GRID_BY_ID,
  ICON_GRID_BY_ID,
  MEDIA_CARD_GRID_BY_ID,
  NEWS_WRAPPER_BY_ID,
  PAGE_BY_SLUG,
  PAGE_SECTIONS_SHELL,
  PAGE_SLUGS,
  PDP_BY_ID,
  PRICING_BY_ID,
  TABBED_CONTENT_BY_ID,
  TWO_ACROSS_BY_ID,
} from './queries';

export type PageSection =
  | HeroFragment
  | BannerFragment
  | FaqFragment
  | TabbedContentFragment
  | CardsWrapperFragment
  | DataVizFragment
  | TwoAcrossFragment
  | BlogPostsSectionFragment
  | CtaSectionFragment
  | PricingFragment
  | IconGridFragment
  | FeatureShowcaseFragment
  | MediaCardGridFragment
  | FeatureSectionFragment
  | NewsWrapperFragment
  | IconFeatureGridFragment
  | FormFragment
  | ProductDetailPageFragment
  | DynamicListingFragment;

export type PageData = {
  __typename?: string;
  sys?: { id: string };
  slug: string;
  internalName?: string | null;
  sectionsCollection?: {
    // Raw GraphQL data - will be transformed client-side
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: Array<any>;
  } | null;
  nt_experiencesCollection?: {
    items: Array<{ __typename?: string; sys?: { id: string } }>;
  } | null;
};

type NtExperiencesCollection = {
  items: Array<{ __typename?: string; sys?: { id: string } }>;
};

type RawHero = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  variant?: string | null;
  sectionStyle?: string | null;
  background?: { url?: string } | null;
  media?: { url?: string } | null;
  ntExperiencesCollection?: NtExperiencesCollection | null;
};

type RawFaqItem = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  question?: string | null;
  answer?: string | null;
};

type RawFaq = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  title?: string | null;
  description?: string | null;
  itemsCollection?: { items: RawFaqItem[] } | null;
};

type RawTabbedContentItem = {
  __typename: string;
  sys: { id: string };
  label?: string | null;
  body?: string | null;
  image?: { url?: string; width?: number; height?: number } | null;
  imageAlt?: string | null;
  href?: string | null;
  buttonLabel?: string | null;
};

type RawTabbedContent = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  tagline?: string | null;
  title?: string | null;
  description?: string | null;
  itemsCollectionCollection?: { items: RawTabbedContentItem[] } | null;
  ntExperiencesCollectionCollection?: NtExperiencesCollection | null;
};

type RawDataViz = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  title?: string | null;
  description?: string | null;
  chartType?: string | null;
  csvData?: { url?: string } | null;
  colorScheme?: string | null;
  showLegend?: boolean | null;
};

type PageBySlugResponse = {
  pageCollection: {
    items: Array<{
      __typename?: string;
      sys?: { id: string };
      slug: string;
      internalName?: string | null;
      sectionsCollection?: {
        items: Array<
          RawHero | RawFaq | RawTabbedContent | RawDataViz | null
        >;
      } | null;
      ntExperiencesCollection?: NtExperiencesCollection | null;
    }>;
  };
};

type PageSlugsResponse = {
  pageCollection: { items: Array<{ slug: string }> };
};

// Note: Data transformation moved to client-side (page-content-live.tsx)
// to maintain raw GraphQL structure required by useLiveUpdates SDK

export async function getPageBySlug({
  slug,
  locale,
  preview: previewOverride,
}: {
  slug: string;
  locale: string;
  /** Override for preview mode (useful when cookie-based draft mode fails in cross-site iframes) */
  preview?: boolean;
}): Promise<PageData | null> {
  try {
    const { isEnabled: draftModeEnabled } = await draftMode();
    // Use override if provided, otherwise fall back to draft mode cookie
    const isEnabled = previewOverride ?? draftModeEnabled;
    const data = await fetchGraphQL<PageBySlugResponse>({
      query: PAGE_BY_SLUG,
      variables: { slug, locale, preview: isEnabled },
      preview: isEnabled,
    });
    const page = data.pageCollection?.items?.[0];
    if (!page) {
      return null;
    }
    // IMPORTANT: Return RAW GraphQL data without any transformation
    // The SDK's useLiveUpdates requires the exact GraphQL structure with __typename
    return page;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('[getPageBySlug]', slug, locale, err);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Two-pass page fetch — shell + parallel BY_ID fetches per section
// ---------------------------------------------------------------------------

/**
 * Lookup table: Contentful __typename → fetcher that returns the full section entry.
 * Each fetcher issues a *_BY_ID query and unwraps the first item.
 * Using named-param fetchGraphQL signature: { query, variables, preview }.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_FETCHERS: Record<string, (id: string, locale: string, preview: boolean) => Promise<any>> = {
  Hero: (id, l, p) =>
    fetchGraphQL<{ heroCollection: { items: unknown[] } }>({ query: HERO_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.heroCollection?.items?.[0] ?? null),
  Faq: (id, l, p) =>
    fetchGraphQL<{ faqCollection: { items: unknown[] } }>({ query: FAQ_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.faqCollection?.items?.[0] ?? null),
  Tabbedcontent: (id, l, p) =>
    fetchGraphQL<{ tabbedcontentCollection: { items: unknown[] } }>({ query: TABBED_CONTENT_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.tabbedcontentCollection?.items?.[0] ?? null),
  CardsWrapper: (id, l, p) =>
    fetchGraphQL<{ cardsWrapperCollection: { items: unknown[] } }>({ query: CARDS_WRAPPER_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.cardsWrapperCollection?.items?.[0] ?? null),
  DataViz: (id, l, p) =>
    fetchGraphQL<{ dataVizCollection: { items: unknown[] } }>({ query: DATA_VIZ_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.dataVizCollection?.items?.[0] ?? null),
  Banner: (id, l, p) =>
    fetchGraphQL<{ bannerCollection: { items: unknown[] } }>({ query: BANNER_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.bannerCollection?.items?.[0] ?? null),
  TwoAcross: (id, l, p) =>
    fetchGraphQL<{ twoAcrossCollection: { items: unknown[] } }>({ query: TWO_ACROSS_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.twoAcrossCollection?.items?.[0] ?? null),
  BlogPostsSection: (id, l, p) =>
    fetchGraphQL<{ blogPostsSectionCollection: { items: unknown[] } }>({ query: BLOG_POSTS_SECTION_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.blogPostsSectionCollection?.items?.[0] ?? null),
  CtaSection: (id, l, p) =>
    fetchGraphQL<{ ctaSectionCollection: { items: unknown[] } }>({ query: CTA_SECTION_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.ctaSectionCollection?.items?.[0] ?? null),
  Pricing: (id, l, p) =>
    fetchGraphQL<{ pricingCollection: { items: unknown[] } }>({ query: PRICING_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.pricingCollection?.items?.[0] ?? null),
  IconGrid: (id, l, p) =>
    fetchGraphQL<{ iconGridCollection: { items: unknown[] } }>({ query: ICON_GRID_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.iconGridCollection?.items?.[0] ?? null),
  FeatureShowcase: (id, l, p) =>
    fetchGraphQL<{ featureShowcaseCollection: { items: unknown[] } }>({ query: FEATURE_SHOWCASE_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.featureShowcaseCollection?.items?.[0] ?? null),
  MediaCardGrid: (id, l, p) =>
    fetchGraphQL<{ mediaCardGridCollection: { items: unknown[] } }>({ query: MEDIA_CARD_GRID_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.mediaCardGridCollection?.items?.[0] ?? null),
  IconFeatureGrid: (id, l, p) =>
    fetchGraphQL<{ iconFeatureGridCollection: { items: unknown[] } }>({ query: ICON_FEATURE_GRID_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.iconFeatureGridCollection?.items?.[0] ?? null),
  FeatureSection: (id, l, p) =>
    fetchGraphQL<{ featureSectionCollection: { items: unknown[] } }>({ query: FEATURE_SECTION_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.featureSectionCollection?.items?.[0] ?? null),
  Form: (id, l, p) =>
    fetchGraphQL<{ formCollection: { items: unknown[] } }>({ query: FORM_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.formCollection?.items?.[0] ?? null),
  ProductDetailPage: (id, l, p) =>
    fetchGraphQL<{ productDetailPageCollection: { items: unknown[] } }>({ query: PDP_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.productDetailPageCollection?.items?.[0] ?? null),
  DynamicListing: (id, l, p) =>
    fetchGraphQL<{ dynamicListingCollection: { items: unknown[] } }>({ query: DYNAMIC_LISTING_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.dynamicListingCollection?.items?.[0] ?? null),
  NewsWrapper: (id, l, p) =>
    fetchGraphQL<{ newsWrapperCollection: { items: unknown[] } }>({ query: NEWS_WRAPPER_BY_ID, variables: { id, locale: l, preview: p }, preview: p })
      .then((d) => d?.newsWrapperCollection?.items?.[0] ?? null),
};

type PageShellResponse = {
  pageCollection: {
    items: Array<{
      __typename?: string;
      sys?: { id: string };
      slug: string;
      internalName?: string | null;
      sectionsCollection?: {
        items: Array<{ __typename: string; sys: { id: string } } | null>;
      } | null;
      ntExperiencesCollection?: {
        items: Array<{ __typename?: string; sys?: { id: string } }>;
      } | null;
    }>;
  };
};

/**
 * Two-pass page fetch:
 *   Pass 1: PAGE_SECTIONS_SHELL — fetches page structure (section __typename + sys.id) only.
 *   Pass 2: Promise.all() — parallel *_BY_ID fetches for each section.
 *
 * Replaces the PAGE_BY_SLUG monolith (7,134 bytes) to stay permanently under
 * Contentful's 8,192-byte query size limit. Each new block type costs 0 bytes
 * on the page route. Full NT experience data is now available everywhere.
 */
export async function getPageBySlugTwoPass({
  slug,
  locale,
  preview: previewOverride,
}: {
  slug: string;
  locale: string;
  preview?: boolean;
}): Promise<PageData | null> {
  try {
    const { isEnabled: draftModeEnabled } = await draftMode();
    const isEnabled = previewOverride ?? draftModeEnabled;

    // Pass 1: fetch page shell — section IDs and typenames only
    const shellData = await fetchGraphQL<PageShellResponse>({
      query: PAGE_SECTIONS_SHELL,
      variables: { slug, locale, preview: isEnabled },
      preview: isEnabled,
    });
    const page = shellData?.pageCollection?.items?.[0] ?? null;
    if (!page) return null;

    const shellSections = (page.sectionsCollection?.items ?? []).filter(
      (s): s is { __typename: string; sys: { id: string } } =>
        s !== null && s !== undefined,
    );

    // Pass 2: parallel BY_ID fetches for each section (order preserved by Promise.all)
    const sectionResults = await Promise.all(
      shellSections.map(async (shell) => {
        const fetcher = SECTION_FETCHERS[shell.__typename];
        if (!fetcher) {
          // eslint-disable-next-line no-console
          console.warn(`[getPageBySlugTwoPass] No fetcher for typename: ${shell.__typename}`);
          return null;
        }
        try {
          return await fetcher(shell.sys.id, locale, isEnabled);
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            logger.error(
              `[getPageBySlugTwoPass] Failed to fetch ${shell.__typename} ${shell.sys.id}:`,
              err,
            );
          }
          return null;
        }
      }),
    );

    // Reassemble: page shell with fully-fetched sections (nulls dropped)
    return {
      ...page,
      sectionsCollection: {
        items: sectionResults.filter(Boolean),
      },
    };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('[getPageBySlugTwoPass]', slug, locale, err);
    }
    return null;
  }
}

export async function getPageSlugs({
  locale,
}: {
  locale: string;
}): Promise<string[]> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<PageSlugsResponse>({
      query: PAGE_SLUGS,
      variables: { locale, preview: isEnabled },
      preview: isEnabled,
    });
    const items = data.pageCollection?.items ?? [];
    return items.map((p) => p.slug).filter(Boolean);
  } catch {
    return ['home'];
  }
}
