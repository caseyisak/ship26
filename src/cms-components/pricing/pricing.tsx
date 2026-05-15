'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { useNinetailed } from '@ninetailed/experience.js-react';
import { Check } from 'lucide-react';
import * as React from 'react';

import type { PricingFragment, PricingPlanFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import { Switch } from '@/components/ui/switch';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { NT_EVENTS } from '@/lib/nt-events';
import { getPersona } from '@/lib/persona-session';
import { planCardBgClass, planCardBtnClass, planCardCheckClass, planCardMutedClass, sectionClasses, sectionMutedTextClass } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';

const rtOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => <>{children}</>,
  },
};

function rt(json: Record<string, unknown> | undefined | null): React.ReactNode | null {
  if (!json) return null;
  return documentToReactComponents(
    json as unknown as Parameters<typeof documentToReactComponents>[0],
    rtOptions,
  );
}

function PlanCard({
  plan,
  yearly,
}: {
  plan: PricingPlanFragment;
  yearly: boolean;
}) {
  const variant = (plan.colorVariant ?? 'light') as string;
  const cardClass = planCardBgClass(variant);
  const mutedClass = planCardMutedClass(variant);
  const btnClass = planCardBtnClass(variant);
  const checkClass = planCardCheckClass(variant);

  const price = yearly ? plan.annualPrice : plan.monthlyPrice;
  const perUnit = yearly ? plan.perUnitAnnual : plan.perUnitMonthly;
  const features = plan.featuresCollection?.items ?? [];
  const showLetsTalk = !plan.monthlyPrice && !plan.annualPrice;

  return (
    <article
      className={cn(
        'flex flex-col rounded-[16px] border shadow-[var(--shadow-light)] overflow-hidden',
        cardClass,
      )}
    >
      {/* Header: name, badge, blurb, price */}
      <div className="flex flex-col gap-2 px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          {plan.badge && (
            <span className="rounded-md bg-current/10 px-2 py-0.5 text-xs font-medium opacity-80">
              {plan.badge}
            </span>
          )}
        </div>

        {plan.blurb?.json && (
          <p className={cn('text-sm leading-relaxed', mutedClass)}>
            {rt(plan.blurb.json)}
          </p>
        )}

        <div className="mt-4">
          {showLetsTalk ? (
            <>
              <div className="text-[40px] leading-none font-semibold">Let&apos;s Talk</div>
              <p className={cn('mt-1 text-sm', mutedClass)}>Contact us for details</p>
            </>
          ) : price ? (
            <>
              <div className="text-[44px] leading-none font-semibold tracking-tight">
                {price}
              </div>
              {perUnit && (
                <p className={cn('mt-1 text-sm', mutedClass)}>{perUnit}</p>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Feature list */}
      {features.length > 0 && (
        <ul className="flex-1 space-y-3 border-t border-current/10 px-6 py-5">
          {features.map((f) => (
            <li key={f.sys.id} className="flex items-start gap-3">
              <Check
                className={cn('mt-0.5 size-4 shrink-0', checkClass)}
                strokeWidth={2.5}
              />
              <span className={cn('text-sm', mutedClass)}>
                {rt(f.label?.json)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {(plan.ctaLabel?.json || plan.ctaUrl) && (
        <div className="px-6 pb-6 pt-2">
          {plan.ctaUrl ? (
            <a
              href={plan.ctaUrl}
              className={cn(
                'flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-medium transition-colors',
                btnClass,
              )}
            >
              {rt(plan.ctaLabel?.json) ?? 'Get Started'}
            </a>
          ) : (
            <button
              type="button"
              className={cn(
                'flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-medium transition-colors',
                btnClass,
              )}
            >
              {rt(plan.ctaLabel?.json) ?? 'Get Started'}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

const Pricing = ({ data, className, ...props }: BlockProps<PricingFragment>) => {
  const liveData = useLiveUpdates(data) as PricingFragment;
  const getProps = useContentfulInspectorModeProps(data.sys.id);
  const { track } = useNinetailed();

  const [yearly, setYearly] = React.useState(true);

  React.useEffect(() => {
    track(NT_EVENTS.PRICING_PAGE_VISITED, {
      segment: getPersona()?.customer_type ?? 'new-visitor',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = rt(liveData.label?.json);
  const title = rt(liveData.title?.json);
  const description = rt(liveData.description?.json);
  const plans = liveData.plansCollection?.items ?? [];
  const showToggle = liveData.showToggle !== false;

  // Resolve section colorVariant → data-variant for CSS contrast system
  const rawVariant = liveData.colorVariant ?? 'light';
  const dataVariant: 'light' | 'dark' | 'accent' =
    rawVariant === 'dark' ? 'dark' : rawVariant === 'accent' ? 'accent' : 'light';

  const mutedClass = sectionMutedTextClass(dataVariant);

  return (
    <section
      id="pricing"
      data-variant={dataVariant}
      className={cn('px-6 lg:px-0', sectionClasses(dataVariant), className ?? '')}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 md:py-24">
        {/* Section header */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          {label && (
            <p
              className="text-tagline mb-4 text-sm font-normal sm:text-base"
              {...getProps({ fieldId: 'label' })}
            >
              {label}
            </p>
          )}
          {title && (
            <h2
              className="text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl md:text-5xl"
              {...getProps({ fieldId: 'title' })}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className={cn('mx-auto mt-4 max-w-2xl text-base sm:text-lg', mutedClass)}
              {...getProps({ fieldId: 'description' })}
            >
              {description}
            </p>
          )}

          {showToggle && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className={cn('text-sm sm:text-base', mutedClass)}>Monthly</span>
              <Switch
                checked={yearly}
                onCheckedChange={setYearly}
                aria-label="Toggle yearly billing"
              />
              <span
                className={cn(
                  'text-sm sm:text-base',
                  yearly ? 'font-medium' : mutedClass,
                )}
              >
                Yearly
              </span>
            </div>
          )}
          {showToggle && yearly && (
            <p className="text-success mt-2 text-sm font-medium">Save up to 30%</p>
          )}
        </div>

        {/* Plan cards */}
        {plans.length > 0 && (
          <div
            className={cn(
              'mx-auto grid max-w-5xl gap-6',
              plans.length === 1 && 'max-w-md',
              plans.length === 2 && 'md:grid-cols-2',
              plans.length >= 3 && 'md:grid-cols-2 lg:grid-cols-3',
            )}
          >
            {plans.map((plan) => (
              <PlanCard key={plan.sys.id} plan={plan} yearly={yearly} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { Pricing };
