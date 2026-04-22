import { draftMode } from 'next/headers';

import type {
  BannerFragment,
  BlogPostsSectionFragment,
  CardsWrapperFragment,
  CtaSectionFragment,
  DataVizFragment,
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
import { PAGE_BY_SLUG, PAGE_SLUGS } from './queries';

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
  | ProductDetailPageFragment;

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
