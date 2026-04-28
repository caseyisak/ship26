'use client';

import { Experience, useNinetailed } from '@ninetailed/experience.js-react';
import React, { useEffect } from 'react';

import {
  getComponent,
  getComponentConfig,
  isMissingData,
} from '@/block-renderer/utils';
import { logger } from '@/lib/logger';
import { NT_EVENTS } from '@/lib/nt-events';
import XRay from '@/lib/x-ray';
import { useNtExperiences } from '@/personalization/ninetailed-nextjs';
import { isPersonalized, mapExperiences } from '@/personalization/utils';

import {
  ErrorComponent,
  InvalidDataError,
  RenderingError,
  UnsupportedLayoutError,
} from './error';
import { MissingConfigError } from './error/missing-config';
import type { BlockRendererDefaultProps } from './types';

export const BlockRenderer = <Props extends BlockRendererDefaultProps>({
  layoutType = 'default',
  data,
  ...props
}: Props) => {
  // All NT experiences from the provider — avoids requiring ntExperiencesCollection
  // in PAGE_BY_SLUG query (LL-011 byte limit). Experience component finds the
  // matching experience via nt_config.components[].baseline.id === data.sys.id.
  const allNtExperiences = useNtExperiences();
  const { track } = useNinetailed();

  // Compute blockExperiences at top level so the useEffect below is not inside try/catch
  // (hooks must be called unconditionally — Rules of Hooks).
  // Safe before null-check: filter on missing sys.id just returns [].
  const entryId = data?.sys?.id ?? '';
  const blockExperiences =
    allNtExperiences.length > 0
      ? allNtExperiences.filter((exp) =>
          (exp.components ?? []).some(
            (comp) =>
              (comp as { type?: string; baseline?: { id?: string } }).type ===
                'EntryReplacement' &&
              (comp as { type?: string; baseline?: { id?: string } }).baseline?.id ===
                entryId,
          ),
        )
      : data && isPersonalized(data)
        ? mapExperiences(data.ntExperiencesCollection?.items)
        : [];

  // Personalized Experience Viewed — fires once when this block has matched experiences
  useEffect(() => {
    if (blockExperiences.length === 0 || !entryId) return;
    track(NT_EVENTS.PERSONALIZED_EXPERIENCE_VIEWED, {
      entryId,
      experienceCount: blockExperiences.length,
      experienceIds: blockExperiences.map((e) => e.id).join(','),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockExperiences.length, entryId]);

  try {
    if (!data || isMissingData(data)) {
      return <InvalidDataError data={data} />;
    }

    if (data._serverError) {
      return <ErrorComponent data={data}>{data._serverError}</ErrorComponent>;
    }

    const componentConfig = getComponentConfig(data);

    if (!componentConfig) {
      return <MissingConfigError data={data} />;
    }

    const Component = getComponent({ componentConfig, layoutType });

    if (!Component) {
      return <UnsupportedLayoutError data={data} layoutType={layoutType} />;
    }

    return (
      <XRay data={data} layoutType={layoutType}>
        <Experience
          {...props}
          data={data}
          id={data.sys.id}
          component={Component}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          experiences={blockExperiences as any}
        />
      </XRay>
    );
  } catch (error) {
    logger.error('Error in BlockRenderer', error);
    return <RenderingError data={data} error={error} />;
  }
};
