import type {
  NtAudienceFragment,
  NtExperienceFragment,
} from '@/block-renderer/types';

import { fetchGraphQL } from './client';
import {
  GET_MERGE_TAGS,
  GET_PERSONALIZATION_AUDIENCES,
  GET_PERSONALIZATION_EXPERIENCES,
} from './queries';

export type NtMergeTagEntry = {
  sys: { id: string };
  ntMergetagId: string;
  ntFallback: string | null;
  ntName: string | null;
};

export async function getPersonalizationExperiences({
  preview = false,
}: { preview?: boolean } = {}): Promise<NtExperienceFragment[]> {
  try {
    const data = await fetchGraphQL<{
      ntExperienceCollection?: { items: NtExperienceFragment[] };
    }>({
      query: GET_PERSONALIZATION_EXPERIENCES,
      variables: { preview },
      preview,
    });
    return data?.ntExperienceCollection?.items ?? [];
  } catch {
    return [];
  }
}

export async function getPersonalizationAudiences({
  preview = false,
}: { preview?: boolean } = {}): Promise<NtAudienceFragment[]> {
  try {
    const data = await fetchGraphQL<{
      ntAudienceCollection?: { items: NtAudienceFragment[] };
    }>({
      query: GET_PERSONALIZATION_AUDIENCES,
      variables: { preview },
      preview,
    });
    return data?.ntAudienceCollection?.items ?? [];
  } catch {
    return [];
  }
}

export async function getMergeTags({
  preview = false,
}: { preview?: boolean } = {}): Promise<NtMergeTagEntry[]> {
  try {
    const data = await fetchGraphQL<{
      ntMergetagCollection?: { items: NtMergeTagEntry[] };
    }>({
      query: GET_MERGE_TAGS,
      variables: { preview },
      preview,
    });
    return data?.ntMergetagCollection?.items ?? [];
  } catch {
    return [];
  }
}
