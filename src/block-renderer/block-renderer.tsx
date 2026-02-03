'use client';

import React from 'react';

import {
  getComponent,
  getComponentConfig,
  isMissingData,
} from '@/block-renderer/utils';
import { logger } from '@/lib/logger';
import XRay from '@/lib/x-ray';
import { PersonalizedComponent } from '@/personalization/personalized-component';
import { isPersonalized } from '@/personalization/utils';

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

    if (isPersonalized(data)) {
      return (
        <PersonalizedComponent {...props} data={data} layoutType={layoutType} />
      );
    }

    return (
      <XRay data={data} layoutType={layoutType}>
        <Component data={data} {...props} />
      </XRay>
    );
  } catch (error) {
    logger.error('Error in BlockRenderer', error);
    return <RenderingError data={data} error={error} />;
  }
};
