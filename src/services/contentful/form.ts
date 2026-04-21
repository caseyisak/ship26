import type { FormFragment, NtExperienceFragment } from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import { FORM_BY_ID } from './queries';

type RawForm = {
  __typename: string;
  sys: { id: string };
  internalName?: string | null;
  formId?: string | null;
  formType?: string | null;
  labelRt?: { json: Record<string, unknown> } | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  submitLabel?: string | null;
  successMessageRt?: { json: Record<string, unknown> } | null;
  redirectUrl?: string | null;
  colorVariant?: string | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

type FormByIdResponse = {
  formCollection: {
    items: Array<RawForm | null>;
  };
};

function mapForm(item: RawForm | null): FormFragment | null {
  if (!item || item.__typename !== 'Form') return null;
  return {
    __typename: 'Form',
    sys: { id: item.sys.id },
    internalName: item.internalName ?? null,
    formId: item.formId ?? null,
    formType: (item.formType as FormFragment['formType']) ?? null,
    labelRt: item.labelRt ?? null,
    titleRt: item.titleRt ?? null,
    descriptionRt: item.descriptionRt ?? null,
    submitLabel: item.submitLabel ?? null,
    successMessageRt: item.successMessageRt ?? null,
    redirectUrl: item.redirectUrl ?? null,
    colorVariant: (item.colorVariant as FormFragment['colorVariant']) ?? null,
    ntExperiencesCollection: item.ntExperiencesCollection ?? undefined,
  };
}

/** Fetch a single Form entry by ID for ID-based live preview. */
export async function getFormByEntryId({
  entryId,
  locale = 'en-US',
}: {
  entryId: string;
  locale?: string;
}): Promise<FormFragment | null> {
  try {
    const data = await fetchGraphQL<FormByIdResponse>({
      query: FORM_BY_ID,
      variables: { id: entryId, locale, preview: true },
      preview: true,
    });
    const item = data.formCollection?.items?.[0] ?? null;
    return mapForm(item);
  } catch {
    return null;
  }
}
