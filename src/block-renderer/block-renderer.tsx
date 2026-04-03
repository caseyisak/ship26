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

    const mappedExperiences = isPersonalized(data)
      ? mapExperiences(data.ntExperiencesCollection?.items)
      : [];

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
