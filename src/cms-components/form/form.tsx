'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import type { FormFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { sectionClasses, sectionMutedTextClass } from '@/lib/theme-colors';
import { cn } from '@/lib/utils';

import { ContactForm } from './contact-form';
import { MessageForm } from './message-form';
import { NewsletterForm } from './newsletter-form';

const rtOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
  },
};

function renderRt(
  field: { json: Record<string, unknown> } | null | undefined,
): React.ReactNode | null {
  if (!field?.json) return null;
  return documentToReactComponents(
    field.json as unknown as Parameters<typeof documentToReactComponents>[0],
    rtOptions,
  );
}

const Form = ({ data, className, ...props }: BlockProps<FormFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);
  const router = useRouter();

  const [submitted, setSubmitted] = React.useState(false);

  const fd = liveData as FormFragment;

  const label = renderRt(fd.labelRt);
  const title = renderRt(fd.titleRt);
  const description = renderRt(fd.descriptionRt);
  const successMessage = renderRt(fd.successMessageRt);
  const colorVariant = fd.colorVariant ?? null;
  const formType = fd.formType ?? 'newsletter';
  const submitLabel = fd.submitLabel ?? null;
  const redirectUrl = fd.redirectUrl ?? null;

  const bgClass = sectionClasses(colorVariant);
  const mutedTextClass = sectionMutedTextClass(colorVariant);
  // On colored backgrounds (primary, dark, accent), force contrasting text on
  // form inputs and override shadcn defaults that assume a light surface.
  const isColoredBg = colorVariant === 'primary' || colorVariant === 'dark' || colorVariant === 'accent';

  const handleSuccess = () => {
    setSubmitted(true);
    if (redirectUrl) {
      setTimeout(() => router.push(redirectUrl), 1500);
    }
  };

  const compact = Boolean(className);

  return (
    <section
      className={cn(!compact && 'px-6 py-16 lg:px-0', bgClass, className ?? '')}
      {...props}
    >
      <div className={cn(!compact && 'container px-0 py-0 md:px-6')}>
        <div className={cn(!compact && 'mx-auto max-w-xl')}>
          {label && (
            <p
              className={cn('mb-3 text-sm font-semibold uppercase tracking-widest', isColoredBg ? 'opacity-80' : 'text-tagline')}
              {...getProps({ fieldId: 'labelRt' })}
            >
              {label}
            </p>
          )}

          {title && (
            <h2
              className="mb-3 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl"
              {...getProps({ fieldId: 'titleRt' })}
            >
              {title}
            </h2>
          )}

          {description && (
            <p
              className={cn('mb-6 text-base', mutedTextClass)}
              {...getProps({ fieldId: 'descriptionRt' })}
            >
              {description}
            </p>
          )}

          {submitted ? (
            <div
              className={cn(
                'rounded-lg border p-4',
                isColoredBg
                  ? 'border-white/30 bg-white/10 text-inherit'
                  : 'border-green-300 bg-green-50 text-green-800',
              )}
              role="alert"
            >
              {successMessage ?? <p>Thank you! Your submission was received.</p>}
            </div>
          ) : (
            <div className={cn(isColoredBg && '[&_input]:border-white/30 [&_input]:bg-white/10 [&_input]:text-inherit [&_input]:placeholder:text-inherit/60 [&_button]:bg-white/20 [&_button]:text-inherit [&_button]:hover:bg-white/30 [&_label]:text-inherit')}>
              {formType === 'newsletter' && (
                <NewsletterForm submitLabel={submitLabel} onSuccess={handleSuccess} />
              )}
              {formType === 'contact' && (
                <ContactForm submitLabel={submitLabel} onSuccess={handleSuccess} />
              )}
              {formType === 'message' && (
                <MessageForm submitLabel={submitLabel} onSuccess={handleSuccess} />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { Form };
