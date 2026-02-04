'use client';

import { Minus, Plus } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { FaqFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

type FaqItemProps = {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: (id: string) => void;
};

function FaqItem({ id, question, answer, open, onToggle }: FaqItemProps) {
  const regionId = `${id}-region`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>(open ? 'auto' : 0);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      const h = contentRef.current.scrollHeight;
      setHeight(h);
    } else {
      const current = wrapperRef.current?.offsetHeight ?? 0;
      setHeight(current);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open, answer]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onEnd = () => {
      if (open) setHeight('auto');
    };
    el.addEventListener('transitionend', onEnd);
    return () => el.removeEventListener('transitionend', onEnd);
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (!contentRef.current) return;
      if (open) {
        const h = contentRef.current.scrollHeight;
        if (height !== 'auto') setHeight(h);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, height]);

  return (
    <div
      className={[
        'bg-card rounded-[16px] border px-4 py-2 sm:px-6 sm:py-4',
        'border-border shadow-[0_2px_8px_-1px_rgba(13,13,18,0.04)]',
      ].join(' ')}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => onToggle(id)}
        className={[
          'group flex w-full items-center justify-between gap-4 text-left',
          'text-foreground text-xl leading-tight font-medium sm:text-2xl',
          'hover:no-underline',
          'py-1 sm:py-2',
        ].join(' ')}
      >
        <span className="pr-2">{question}</span>
        <span
          className={[
            'flex size-6 items-center justify-center rounded-[6px] border',
            open
              ? 'border-tagline bg-tagline/10 text-tagline'
              : 'border-border text-muted-foreground',
          ].join(' ')}
          aria-hidden
        >
          {open ? (
            <Minus className="size-3" strokeWidth={2} />
          ) : (
            <Plus className="size-3" strokeWidth={2} />
          )}
        </span>
      </button>

      <div
        id={regionId}
        role="region"
        aria-hidden={!open}
        ref={wrapperRef}
        style={{ height, transition: 'height 200ms ease' }}
        className="overflow-hidden"
      >
        <div
          ref={contentRef}
          className="text-muted-foreground mt-2 text-sm font-normal whitespace-pre-wrap sm:text-base"
        >
          {answer}
        </div>
      </div>
    </div>
  );
}

const Faq = ({ data, className, ...props }: BlockProps<FaqFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const title = liveData.title ?? 'Frequently Asked Questions';
  const description =
    liveData.description ??
    'Hendrerit fames metus leo ut orci pretium. Sit vitae montes egestas montes mauris. Auctor vitae neque urna nam nunc pellentesque.';
  const items = liveData.itemsCollection?.items ?? [];

  const [openId, setOpenId] = useState<string | undefined>(undefined);
  const handleToggle = (id: string) =>
    setOpenId((curr) => (curr === id ? undefined : id));

  return (
    <section
      id="faq"
      className={cn('bg-background px-6 lg:px-0', className ?? '')}
      {...props}
    >
      <div className="container px-0 py-16 sm:py-20 md:px-6 lg:py-28">
        <p
          className="text-tagline mb-4 text-center text-sm leading-tight font-normal sm:text-base"
          {...getProps({ fieldId: 'title' })}
        >
          FAQ
        </p>

        <h2
          className="text-foreground mx-auto mb-4 max-w-3xl text-center text-3xl leading-tight font-medium tracking-tight sm:text-4xl md:text-5xl"
          {...getProps({ fieldId: 'title' })}
        >
          {title}
        </h2>

        <p
          className="text-muted-foreground mx-auto max-w-2xl text-center text-base font-normal sm:text-lg"
          {...getProps({ fieldId: 'description' })}
        >
          {description}
        </p>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:mt-14">
          {items.map((item) => {
            const id = `faq-item-${item.sys.id}`;
            const open = openId === id;
            const question = item.question ?? '';
            const answer = item.answer ?? '';

            if (!question && !answer) return null;

            return (
              <FaqItem
                key={id}
                id={id}
                question={question}
                answer={answer}
                open={open}
                onToggle={handleToggle}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { Faq };
