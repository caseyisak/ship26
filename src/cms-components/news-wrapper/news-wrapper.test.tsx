import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LivePreviewProvider } from '@/lib/live-preview';

import { NewsWrapper } from './news-wrapper';

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

const makePost = (id: string, overrides: Partial<{
  title: string;
  slug: string;
  excerpt: string;
  publishDate: string;
  authorName: string;
  imageUrl: string;
  tagId: string;
  tagName: string;
}> = {}) => ({
  __typename: 'BlogPost' as const,
  sys: { id, spaceId: 'test' },
  title: overrides.title ?? `Post ${id}`,
  slug: overrides.slug ?? `post-${id}`,
  excerpt: overrides.excerpt ?? `Excerpt for post ${id}`,
  publishDate: overrides.publishDate ?? '2026-01-01T00:00:00Z',
  contentfulMetadata: overrides.tagId
    ? { tags: [{ id: overrides.tagId, name: overrides.tagName ?? overrides.tagId }] }
    : { tags: [] },
  heroImage: overrides.imageUrl ? { url: overrides.imageUrl, width: 800, height: 450 } : null,
  body: null,
  author: overrides.authorName
    ? { __typename: 'Author' as const, sys: { id: 'author-1' }, name: overrides.authorName, bio: null }
    : null,
});

const baseEntry = {
  __typename: 'NewsWrapper' as const,
  sys: { id: 'nw-1', spaceId: 'test' },
  internalName: 'Test News Wrapper',
  labelRt: makeRtJson('Latest News'),
  titleRt: makeRtJson('Stay Informed'),
  descriptionRt: makeRtJson('The latest updates from Metafi.'),
  filterCategory: null,
  sortOrder: 'newest_first',
  maxItems: 6,
  priorityItemsCollection: null,
  ntExperiencesCollection: null,
  mergedArticles: [
    makePost('p1', { title: 'First Article', authorName: 'Jane Doe', tagId: 'company', tagName: 'Company' }),
    makePost('p2', { title: 'Second Article', authorName: 'John Smith', tagId: 'product', tagName: 'Product' }),
    makePost('p3', { title: 'Third Article' }),
  ],
};

describe('NewsWrapper', () => {
  it('renders label richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Latest News')).toBeTruthy();
  });

  it('renders title richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Stay Informed')).toBeTruthy();
  });

  it('renders description richtext', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('The latest updates from Metafi.')).toBeTruthy();
  });

  it('renders all article titles', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('First Article')).toBeTruthy();
    expect(screen.getByText('Second Article')).toBeTruthy();
    expect(screen.getByText('Third Article')).toBeTruthy();
  });

  it('renders article excerpts', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Excerpt for post p1')).toBeTruthy();
  });

  it('renders author name', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('John Smith')).toBeTruthy();
  });

  it('renders category badges', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={baseEntry} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('Company')).toBeTruthy();
    expect(screen.getByText('Product')).toBeTruthy();
  });

  it('renders article links with correct href', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={baseEntry} />
      </LivePreviewProvider>,
    );
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/blog/post-p1');
    expect(hrefs).toContain('/blog/post-p2');
  });

  it('renders empty state when no articles', () => {
    render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper data={{ ...baseEntry, mergedArticles: [] }} />
      </LivePreviewProvider>,
    );
    expect(screen.getByText('No articles to display.')).toBeTruthy();
  });

  it('renders without label/title/description when not set', () => {
    const { container } = render(
      <LivePreviewProvider locale="en-US">
        <NewsWrapper
          data={{
            ...baseEntry,
            labelRt: null,
            titleRt: null,
            descriptionRt: null,
          }}
        />
      </LivePreviewProvider>,
    );
    // Should still render the section without crashing
    expect(container.querySelector('section#news-wrapper')).toBeTruthy();
  });
});
