import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LivePreviewProvider } from '@/lib/live-preview';

import { CtaSection } from './cta-section';

vi.mock('@ninetailed/experience.js-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Experience: ({ component: Comp, ...props }: any) =>
    Comp ? React.createElement(Comp, props) : null,
  useNinetailed: () => ({ track: vi.fn(), identify: vi.fn() }),
}));

const makeRtJson = (text: string) => ({
  json: {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
      },
    ],
  },
});

const baseEntry = {
  __typename: 'CtaSection' as const,
  sys: { id: 'cta-1', spaceId: 'test' },
  internalName: 'Test CTA',
  headlineRt: makeRtJson('Start Your Free Trial Today'),
  subheadlineRt: makeRtJson('Join thousands of fintech companies already using Metafi'),
  ctaPrimaryLabelRt: makeRtJson('Get Started Free'),
  ctaPrimaryUrl: '/signup',
  ctaSecondaryLabelRt: makeRtJson('Watch Demo'),
  ctaSecondaryUrl: '/demo',
  colorVariant: 'primary' as const,
  backgroundImage: null,
  sectionStyle: null,
};

describe('CtaSection', () => {
  it('renders headline richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <CtaSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Start Your Free Trial Today')).toBeTruthy();
  });

  it('renders subheadline richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <CtaSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(
      screen.getByText('Join thousands of fintech companies already using Metafi'),
    ).toBeTruthy();
  });

  it('renders primary CTA button as link', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <CtaSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    const link = screen.getByRole('link', { name: /get started free/i });
    expect(link.getAttribute('href')).to.equal('/signup');
  });

  it('renders secondary CTA button as link', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <CtaSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    const link = screen.getByRole('link', { name: /watch demo/i });
    expect(link.getAttribute('href')).to.equal('/demo');
  });

  it('does not render primary CTA when label is missing', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <CtaSection data={{ ...baseEntry, ctaPrimaryLabelRt: null }} />
      </LivePreviewProvider>,
    );
    expect(screen.queryByRole('link', { name: /get started free/i })).toBeNull();
  });

  it('renders overlay div for image variant', () => {
    const { container } = render(
      <LivePreviewProvider locale="en-US">
        <CtaSection
          data={{
            ...baseEntry,
            colorVariant: 'image',
            backgroundImage: {
              url: 'https://example.com/bg.jpg',
              width: 1920,
              height: 1080,
              description: 'Background',
            },
          }}
        />
      </LivePreviewProvider>,
    );
    // The overlay div has aria-hidden="true"
    const overlays = container.querySelectorAll('[aria-hidden="true"]');
    expect(overlays.length).toBeGreaterThan(0);
  });

  it('applies primary bg class by default', () => {
    const { container } = render(
      <LivePreviewProvider locale="en-US">
        <CtaSection data={baseEntry} />
      </LivePreviewProvider>,
    );
    const section = container.querySelector('section');
    expect(section?.className).toContain('bg-primary');
  });
});
