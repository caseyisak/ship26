'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import type { BannerFragment, BlockProps } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';

export function Banner({ data: rawData }: BlockProps<BannerFragment>) {
  const data = useLiveUpdates(rawData);
  const getProps = useContentfulInspectorModeProps(rawData.sys.id);
  const [isVisible, setIsVisible] = useState(true);

  const { headline, subheadline, ctaText, ctaUrl } = data;

  const title = headline ?? '';
  const description = subheadline ?? '';

  if (!isVisible) return null;

  return (
    <section className="w-full bg-primary p-4">
      <div className="container">
        <div className="relative flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-8 w-8 md:hidden"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center gap-3 pt-2 text-primary-foreground md:flex-row md:items-center md:pt-0">
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <p
                className="text-sm font-medium text-primary-foreground"
                {...getProps({ fieldId: 'headline' })}
              >
                {title}
              </p>
              <p
                className="text-sm text-primary-foreground/80"
                {...getProps({ fieldId: 'subheadline' })}
              >
                {description}
              </p>
            </div>
          </div>

          {(ctaText ?? 'Learn More') && (
            <div className="flex items-center gap-2">
              <a
                href={ctaUrl ?? '#'}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90"
                {...getProps({ fieldId: 'ctaText' })}
              >
                {ctaText ?? 'Learn More'}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-8 w-8 text-primary-foreground md:inline-flex"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
