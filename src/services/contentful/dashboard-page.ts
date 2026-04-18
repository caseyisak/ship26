import type { BannerFragment, CtaSectionFragment, FaqFragment, FeatureItemFragment, HeroFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { DASHBOARD_PAGE_BY_ID, DASHBOARD_PAGE_BY_SLUG } from './queries';

export type DashboardSlot =
  | BannerFragment
  | FeatureItemFragment
  | FaqFragment
  | HeroFragment
  | CtaSectionFragment
  | null;

export type DashboardPageData = {
  sys: { id: string };
  internalName?: string | null;
  slug?: string | null;
  headerBlock?: DashboardSlot;
  primaryBlock?: DashboardSlot;
  secondaryBlock?: DashboardSlot;
  tertiaryBlock?: DashboardSlot;
  quaternaryBlock?: DashboardSlot;
};

/** Raw (untransformed) dashboard page — passed to useLiveUpdates so the SDK
 * can update reference fields when linked entries are added/changed in the editor. */
export type DashboardPageRaw = {
  sys: { id: string };
  __typename?: string;
  internalName?: string | null;
  slug?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headerBlock?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  primaryBlock?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  secondaryBlock?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tertiaryBlock?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quaternaryBlock?: any;
};

// ── Raw response types ────────────────────────────────────────────────────────

type RawSlot = {
  __typename: string;
  sys: { id: string };
  // Banner fields
  internalName?: string | null;
  headlineRt?: { json: Record<string, unknown> } | null;
  subheadlineRt?: { json: Record<string, unknown> } | null;
  copy?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  variant?: string | null;
  colorVariant?: string | null;
  sectionStyle?: unknown;
  // FeatureItem fields
  titleRt?: {
    json: Record<string, unknown>;
    links?: {
      entries?: {
        inline?: Array<{
          sys: { id: string };
          __typename?: string;
          ntMergetagId?: string | null;
          ntFallback?: string | null;
        } | null>;
      };
    };
  } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  media?: { url?: string } | null;
  animationKey?: string | null;
  mediaPlacement?: string | null;
  // Faq fields
  itemsCollection?: {
    items: Array<{
      __typename: string;
      sys: { id: string };
      internalName?: string | null;
      questionRt?: { json: Record<string, unknown> } | null;
      answerRt?: { json: Record<string, unknown> } | null;
    } | null>;
  } | null;
  // Hero fields
  background?: { url?: string } | null;
  // CtaSection fields
  ctaPrimaryLabelRt?: { json: Record<string, unknown> } | null;
  ctaPrimaryUrl?: string | null;
  ctaSecondaryLabelRt?: { json: Record<string, unknown> } | null;
  ctaSecondaryUrl?: string | null;
  backgroundImage?: { url?: string; width?: number; height?: number; description?: string } | null;
} | null;

type DashboardPageByIdResponse = {
  dashboardPageCollection: {
    items: Array<{
      __typename: string;
      sys: { id: string };
      internalName?: string | null;
      slug?: string | null;
      headerBlock?: RawSlot;
      primaryBlock?: RawSlot;
      secondaryBlock?: RawSlot;
      tertiaryBlock?: RawSlot;
      quaternaryBlock?: RawSlot;
    }>;
  };
};

// ── Mappers ───────────────────────────────────────────────────────────────────

export function mapSlot(raw: RawSlot): DashboardSlot {
  if (!raw) return null;

  if (raw.__typename === 'Banner') {
    return {
      __typename: 'Banner',
      sys: raw.sys,
      internalName: raw.internalName,
      headlineRt: raw.headlineRt ?? null,
      subheadlineRt: raw.subheadlineRt ?? null,
      copy: raw.copy,
      ctaText: raw.ctaText,
      ctaUrl: raw.ctaUrl,
      variant: raw.variant as BannerFragment['variant'],
      colorVariant: raw.colorVariant as BannerFragment['colorVariant'],
      sectionStyle: raw.sectionStyle as string | null | undefined,
      game: null,
      media: null,
    } satisfies BannerFragment;
  }

  if (raw.__typename === 'FeatureItem') {
    return {
      __typename: 'FeatureItem',
      sys: raw.sys,
      titleRt: raw.titleRt ?? null,
      descriptionRt: raw.descriptionRt ?? null,
      media: raw.media ?? null,
      animationKey: raw.animationKey,
      mediaPlacement: raw.mediaPlacement as FeatureItemFragment['mediaPlacement'],
      sectionStyle: raw.sectionStyle as Record<string, string> | null | undefined,
    } satisfies FeatureItemFragment;
  }

  if (raw.__typename === 'Faq') {
    return {
      __typename: 'Faq',
      sys: raw.sys,
      internalName: raw.internalName,
      titleRt: raw.titleRt ?? null,
      descriptionRt: raw.descriptionRt ?? null,
      itemsCollection: raw.itemsCollection
        ? {
            items: raw.itemsCollection.items
              .filter((item): item is NonNullable<typeof item> => item !== null)
              .map((item) => ({
                __typename: 'FaqItem' as const,
                sys: item.sys,
                internalName: item.internalName,
                questionRt: item.questionRt ?? null,
                answerRt: item.answerRt ?? null,
              })),
          }
        : null,
    } satisfies FaqFragment;
  }

  if (raw.__typename === 'Hero') {
    return {
      __typename: 'Hero',
      sys: raw.sys,
      internalName: raw.internalName,
      headlineRt: raw.headlineRt ?? null,
      subheadlineRt: raw.subheadlineRt ?? null,
      ctaText: raw.ctaText,
      ctaUrl: raw.ctaUrl,
      variant: raw.variant,
      sectionStyle: raw.sectionStyle as string | null | undefined,
      background: raw.background ?? null,
      image: null,
    } satisfies HeroFragment;
  }

  if (raw.__typename === 'CtaSection') {
    return {
      __typename: 'CtaSection',
      sys: raw.sys,
      internalName: raw.internalName,
      headlineRt: raw.headlineRt ?? null,
      subheadlineRt: raw.subheadlineRt ?? null,
      ctaPrimaryLabelRt: raw.ctaPrimaryLabelRt ?? null,
      ctaPrimaryUrl: raw.ctaPrimaryUrl,
      ctaSecondaryLabelRt: raw.ctaSecondaryLabelRt ?? null,
      ctaSecondaryUrl: raw.ctaSecondaryUrl,
      colorVariant: raw.colorVariant as CtaSectionFragment['colorVariant'],
      backgroundImage: raw.backgroundImage ?? null,
      sectionStyle: raw.sectionStyle as string | null | undefined,
    } satisfies CtaSectionFragment;
  }

  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getDashboardPageByEntryId({
  entryId,
  locale,
}: {
  entryId: string;
  locale: string;
}): Promise<DashboardPageData | null> {
  try {
    const data = await fetchGraphQL<DashboardPageByIdResponse>({
      query: DASHBOARD_PAGE_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const raw = data.dashboardPageCollection?.items?.[0];
    if (!raw) return null;

    return {
      sys: raw.sys,
      internalName: raw.internalName,
      slug: raw.slug,
      headerBlock: mapSlot(raw.headerBlock ?? null),
      primaryBlock: mapSlot(raw.primaryBlock ?? null),
      secondaryBlock: mapSlot(raw.secondaryBlock ?? null),
      tertiaryBlock: mapSlot(raw.tertiaryBlock ?? null),
      quaternaryBlock: mapSlot(raw.quaternaryBlock ?? null),
    };
  } catch {
    return null;
  }
}

export async function getDashboardPageBySlug({
  slug,
  locale = 'en-US',
  preview = false,
}: {
  slug: string;
  locale?: string;
  preview?: boolean;
}): Promise<DashboardPageData | null> {
  try {
    const data = await fetchGraphQL<DashboardPageByIdResponse>({
      query: DASHBOARD_PAGE_BY_SLUG,
      variables: { slug, locale, preview },
      preview,
    });
    const raw = data.dashboardPageCollection?.items?.[0];
    if (!raw) return null;

    return {
      sys: raw.sys,
      internalName: raw.internalName,
      slug: raw.slug,
      headerBlock: mapSlot(raw.headerBlock ?? null),
      primaryBlock: mapSlot(raw.primaryBlock ?? null),
      secondaryBlock: mapSlot(raw.secondaryBlock ?? null),
      tertiaryBlock: mapSlot(raw.tertiaryBlock ?? null),
      quaternaryBlock: mapSlot(raw.quaternaryBlock ?? null),
    };
  } catch {
    return null;
  }
}

/** Returns raw (untransformed) entry data for use with useLiveUpdates in the preview client.
 * Slots are NOT mapped — the preview client transforms them after live updates so the SDK
 * can properly update reference fields when linked entries are added/changed in the editor. */
export async function getDashboardPageRawByEntryId({
  entryId,
  locale,
}: {
  entryId: string;
  locale: string;
}): Promise<DashboardPageRaw | null> {
  try {
    const data = await fetchGraphQL<DashboardPageByIdResponse>({
      query: DASHBOARD_PAGE_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const raw = data.dashboardPageCollection?.items?.[0];
    if (!raw) return null;
    return raw as DashboardPageRaw;
  } catch {
    return null;
  }
}
