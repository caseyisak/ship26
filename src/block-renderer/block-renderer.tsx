'use client';

import { Experience } from '@ninetailed/experience.js-react';
import React from 'react';

import {
  getComponent,
  getComponentConfig,
  isMissingData,
} from '@/block-renderer/utils';
import { logger } from '@/lib/logger';
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

    // Filter global experiences to only those that target this block's baseline entry.
    // The NT preview plugin's getExperienceSelectionMiddleware does experiences.find()
    // and stops at the first match — if we pass ALL experiences, it picks whichever
    // comes first in the array regardless of whether it targets this block's baseline.
    // Filtering ensures the middleware always finds the correct experience. (LL-028)
    // Falls back to per-block ntExperiencesCollection for preview routes.
    const blockExperiences =
      allNtExperiences.length > 0
        ? allNtExperiences.filter((exp) =>
            (exp.components ?? []).some(
              (comp) =>
                (comp as { type?: string; baseline?: { id?: string } }).type ===
                  'EntryReplacement' &&
                (comp as { type?: string; baseline?: { id?: string } }).baseline?.id ===
                  data.sys.id,
            ),
          )
        : isPersonalized(data)
          ? mapExperiences(data.ntExperiencesCollection?.items)
          : [];
    const mappedExperiences = blockExperiences;

    return (
      <XRay data={data} layoutType={layoutType}>
        <Experience
          {...props}
          data={data}
          id={data.sys.id}
          component={Component}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          experiences={mappedExperiences as any}
        />
      </XRay>
    );
  } catch (error) {
    logger.error('Error in BlockRenderer', error);
    return <RenderingError data={data} error={error} />;
  }
};
