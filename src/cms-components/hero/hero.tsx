'use client';

import React from 'react';

import type { HeroFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { Button } from '@/components/ui/button';

const Hero = ({ data, className, ...props }: BlockProps<HeroFragment>) => {
  const headline = data.headline ?? 'Simplifying Payments for Growing Business';
  const subheadline =
    data.subheadline ??
    'Streamlining transactions for expanding enterprises. Our solutions simplify payment processes, empowering businesses to focus on growth and innovation.';
  const ctaText = data.ctaText ?? 'Get Started';
  const ctaUrl = data.ctaUrl ?? '/pricing';

  return (
    <section
      id="hero"
      className={`border-b-border bg-background relative overflow-hidden border-b px-6 lg:px-0 ${className ?? ''}`}
      {...props}
    >
      <div className="relative container px-0 md:px-6">
        <div className="mx-auto grid max-w-4xl gap-6 py-14 text-center sm:py-16 md:gap-8 md:pt-24 md:pb-20">
          <h1 className="text-foreground text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl md:text-[68px]">
            {headline}
          </h1>
          <p className="text-muted-foreground md:text-md mx-auto max-w-2xl text-base sm:text-lg">
            {subheadline}
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <Button asChild className="w-full sm:w-auto" aria-label={ctaText}>
              <a href={ctaUrl}>{ctaText}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
