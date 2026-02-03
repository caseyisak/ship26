import { draftMode } from 'next/headers';

import type {
  FaqFragment,
  FaqItemFragment,
  HeroFragment,
} from '@/block-renderer/types';
import { logger } from '@/lib/logger';

import { fetchGraphQL } from './client';
import { PAGE_BY_SLUG, PAGE_SLUGS } from './queries';

export type PageSection = HeroFragment | FaqFragment;

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

type PageBySlugResponse = {
  pageCollection: {
    items: Array<{
      slug: string;
      internalName?: string | null;
      sectionsCollection?: { items: Array<RawHero | RawFaq | null> } | null;
      ntExperiencesCollection?: NtExperiencesCollection | null;
    }>;
  };
};

type PageSlugsResponse = {
  pageCollection: { items: Array<{ slug: string }> };
};

function mapFaqItem(item: RawFaqItem): FaqItemFragment | null {
  if (!item || item.__typename !== 'faqitem') return null;
  return {
    __typename: 'FaqItem',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    question: item.question ?? null,
    answer: item.answer ?? null,
  };
}

function mapFaq(item: RawFaq): FaqFragment | null {
  if (!item || item.__typename !== 'faq') return null;
  return {
    __typename: 'Faq',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    title: item.title ?? null,
    description: item.description ?? null,
    itemsCollection: item.itemsCollection
      ? {
          items: item.itemsCollection.items
            .map(mapFaqItem)
            .filter(Boolean) as FaqItemFragment[],
        }
      : null,
  };
}

function mapSection(item: RawHero | RawFaq | null): PageSection | null {
  if (!item) return null;
  if (item.__typename === 'Hero') {
    const hero = item as RawHero;
    return {
      __typename: 'Hero',
      sys: { id: hero.sys.id },
      internalName: hero.internalName ?? null,
      headline: hero.headline ?? null,
      subheadline: hero.subheadline ?? null,
      ctaText: hero.ctaText ?? null,
      ctaUrl: hero.ctaUrl ?? null,
      variant: hero.variant ?? null,
      sectionStyle: hero.sectionStyle ?? null,
      image: hero.media ?? null,
      ntExperiencesCollection: hero.ntExperiencesCollection ?? undefined,
    };
  }
  if (item.__typename === 'faq') {
    return mapFaq(item as RawFaq);
  }
  return null;
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
