import { ExperienceMapper } from '@ninetailed/experience.js-utils';

import type {
  BlockData,
  NtAudienceFragment,
  NtExperienceFragment,
  PersonalizedBlockData,
} from '@/block-renderer/types';

export function isPersonalized(
  data: BlockData | PersonalizedBlockData | null,
): data is PersonalizedBlockData {
  return (
    !!data &&
    'ntExperiencesCollection' in data &&
    Boolean((data as PersonalizedBlockData).ntExperiencesCollection?.items?.length)
  );
}

export function mapExperiences(experiences?: Array<NtExperienceFragment | null>) {
  if (!experiences?.length) return [];
  return experiences
    .filter((exp): exp is NtExperienceFragment => Boolean(exp))
    .map((exp) => ({
      id: exp.ntExperienceId,
      name: exp.ntName,
      type: exp.ntType,
      config: exp.ntConfig as { distribution?: number[]; traffic?: number; components?: unknown[]; sticky?: boolean } | undefined,
      ...(exp.ntAudience?.ntAudienceId
        ? { audience: { id: exp.ntAudience.ntAudienceId, name: exp.ntAudience.ntName } }
        : {}),
      // Wrap variant content in `data` to match our BlockProps<T> = { data: T } component shape.
      // Ninetailed merges variant props over baseline props, so { data: variantEntry }
      // replaces { data: baselineEntry } and the component receives the correct data object.
      variants: (exp.ntVariantsCollection?.items ?? [])
        .filter(Boolean)
        .map((v) => ({ id: v.sys.id, data: v })),
    }))
    .filter(ExperienceMapper.isExperienceEntry)
    .map(ExperienceMapper.mapExperience);
}

export function mapAudiences(audiences?: Array<NtAudienceFragment | null>) {
  if (!audiences?.length) return [];
  return audiences
    .filter((a): a is NtAudienceFragment => Boolean(a))
    .map((a) => ({
      id: a.ntAudienceId,
      name: a.ntName,
      description: a.ntDescription ?? undefined,
      rules: a.ntRules,
    }));
}
