import { draftMode } from 'next/headers';

import type { HeroFragment } from '@/block-renderer/types';
import { logger } from '@/lib/logger';

import { fetchGraphQL } from './client';
import { PAGE_BY_SLUG, PAGE_SLUGS } from './queries';

export type PageSection = HeroFragment;

export type PageData = {
  slug: string;
  internalName?: string | null;
  sectionsCollection?: {
    items: (PageSection | null)[];
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
  media?: { url?: string } | null;
  ntExperiencesCollection?: NtExperiencesCollection | null;
};

type PageBySlugResponse = {
  pageCollection: {
    items: Array<{
      slug: string;
      internalName?: string | null;
      sectionsCollection?: { items: Array<RawHero | null> } | null;
      ntExperiencesCollection?: NtExperiencesCollection | null;
    }>;
  };
};

type PageSlugsResponse = {
  pageCollection: { items: Array<{ slug: string }> };
};

function mapSection(item: RawHero | null): HeroFragment | null {
  if (!item || item.__typename !== 'Hero') return null;
  return {
    __typename: 'Hero',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    headline: item.headline ?? null,
    subheadline: item.subheadline ?? null,
    ctaText: item.ctaText ?? null,
    ctaUrl: item.ctaUrl ?? null,
    variant: item.variant ?? null,
    sectionStyle: item.sectionStyle ?? null,
    image: item.media ?? null,
    ntExperiencesCollection: item.ntExperiencesCollection ?? undefined,
  };
}

export async function getPageBySlug({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}): Promise<PageData | null> {
  try {
    const { isEnabled } = await draftMode();
    const data = await fetchGraphQL<PageBySlugResponse>({
      query: PAGE_BY_SLUG,
      variables: { slug, locale, preview: isEnabled },
      preview: isEnabled,
    });
    const page = data.pageCollection?.items?.[0];
    if (!page) {
      if (process.env.NODE_ENV === 'development') {
        const count = data.pageCollection?.items?.length ?? 0;
        logger.warn(
          `[getPageBySlug] No page for slug="${slug}" locale="${locale}" preview=${isEnabled}; items.length=${count}`,
        );
      }
      return null;
    }
    const sections = (page.sectionsCollection?.items ?? [])
      .map(mapSection)
      .filter(Boolean);
    return {
      slug: page.slug,
      internalName: page.internalName ?? null,
      sectionsCollection: { items: sections },
      nt_experiencesCollection: page.ntExperiencesCollection ?? null,
    };
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
