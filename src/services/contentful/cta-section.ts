import type { CtaSectionFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { CTA_SECTION_BY_ID } from './queries';

type CtaSectionByIdResponse = {
  ctaSectionCollection: {
    items: Array<{
      __typename: string;
      sys: { id: string };
      internalName?: string | null;
      headlineRt?: { json: Record<string, unknown> } | null;
      subheadlineRt?: { json: Record<string, unknown> } | null;
      ctaPrimaryLabelRt?: { json: Record<string, unknown> } | null;
      ctaPrimaryUrl?: string | null;
      ctaSecondaryLabelRt?: { json: Record<string, unknown> } | null;
      ctaSecondaryUrl?: string | null;
      colorVariant?: string | null;
      backgroundImage?: {
        url?: string;
        width?: number;
        height?: number;
        description?: string;
      } | null;
      sectionStyle?: unknown;
    }>;
  };
};

export async function getCtaSectionByEntryId({
  entryId,
  locale,
}: {
  entryId: string;
  locale: string;
}): Promise<CtaSectionFragment | null> {
  try {
    const data = await fetchGraphQL<CtaSectionByIdResponse>({
      query: CTA_SECTION_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const raw = data.ctaSectionCollection?.items?.[0];
    if (!raw) return null;

    return {
      __typename: 'CtaSection',
      sys: raw.sys,
      internalName: raw.internalName,
      headlineRt: raw.headlineRt ?? null,
      subheadlineRt: raw.subheadlineRt ?? null,
      ctaPrimaryLabelRt: raw.ctaPrimaryLabelRt ?? null,
      ctaPrimaryUrl: raw.ctaPrimaryUrl ?? null,
      ctaSecondaryLabelRt: raw.ctaSecondaryLabelRt ?? null,
      ctaSecondaryUrl: raw.ctaSecondaryUrl ?? null,
      colorVariant: raw.colorVariant as CtaSectionFragment['colorVariant'],
      backgroundImage: raw.backgroundImage ?? null,
      sectionStyle: raw.sectionStyle as string | null | undefined,
    };
  } catch {
    return null;
  }
}
