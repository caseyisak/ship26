'use client';

import { BlockRenderer } from '@/block-renderer';
import { useLiveUpdates } from '@/lib/live-preview';
import type { PageData, PageSection } from '@/services/contentful/page';

type Props = {
  page: PageData;
};

/** Transform raw GraphQL section data to our internal format */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformSection(item: any): PageSection | null {
  if (!item || !item.__typename) return null;

  try {
    if (item.__typename === 'Hero') {
      return {
        __typename: 'Hero',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        headline: item.headline ?? null,
        subheadline: item.subheadline ?? null,
        ctaText: item.ctaText ?? null,
        ctaUrl: item.ctaUrl ?? null,
        variant: item.variant ?? null,
        sectionStyle: item.sectionStyle ?? null,
        background: item.background ?? null,
        image: item.media ?? null,
        ntExperiencesCollection: item.ntExperiencesCollection ?? undefined,
      };
    }
    if (item.__typename === 'Faq') {
      return {
        __typename: 'Faq',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        title: item.title ?? null,
        description: item.description ?? null,
        itemsCollection: item.itemsCollection
          ? {
              items: item.itemsCollection.items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((faqItem: any) =>
                  faqItem && faqItem.__typename === 'Faqitem'
                    ? {
                        __typename: 'FaqItem',
                        sys: { id: faqItem.sys.id },
                        internalName: faqItem.internalName ?? null,
                        question: faqItem.question ?? null,
                        answer: faqItem.answer ?? null,
                      }
                    : null,
                )
                .filter(Boolean),
            }
          : null,
      };
    }
    if (item.__typename === 'Tabbedcontent') {
      return {
        __typename: 'Tabbedcontent',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        tagline: item.tagline ?? null,
        title: item.title ?? null,
        description: item.description ?? null,
        itemsCollection: item.itemsCollectionCollection
          ? {
              items: item.itemsCollectionCollection.items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((tabItem: any) =>
                  tabItem && tabItem.__typename === 'Tabbedcontentitem'
                    ? {
                        __typename: 'TabbedContentItem',
                        sys: { id: tabItem.sys.id },
                        label: tabItem.label ?? null,
                        body: tabItem.body ?? null,
                        image: tabItem.image ?? null,
                        imageAlt: tabItem.imageAlt ?? null,
                        href: tabItem.href ?? null,
                        buttonLabel: tabItem.buttonLabel ?? null,
                      }
                    : null,
                )
                .filter(Boolean),
            }
          : null,
        ntExperiencesCollection:
          item.ntExperiencesCollectionCollection ?? undefined,
      };
    }
    if (item.__typename === 'Features') {
      return {
        __typename: 'Features',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        label: item.label ?? null,
        title: item.title ?? null,
        description: item.description ?? null,
        // Keep feature items RAW - let FeatureCard component handle transformation after useLiveUpdates
        itemsCollection: item.itemsCollection ?? null,
        ntExperiencesCollection: item.ntExperiencesCollection ?? undefined,
      };
    }
    if (item.__typename === 'DataViz') {
      return {
        __typename: 'DataViz',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        title: item.title ?? null,
        description: item.description ?? null,
        chartType: item.chartType ?? null,
        csvData: item.csvData ?? null,
        colorScheme: item.colorScheme ?? null,
        showLegend: item.showLegend ?? null,
      };
    }
    if (item.__typename === 'Banner') {
      return {
        __typename: 'Banner',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        headlineRt: item.headlineRt ?? null,
        subheadlineRt: item.subheadlineRt ?? null,
        copy: item.copy ?? null,
        ctaText: item.ctaText ?? null,
        ctaUrl: item.ctaUrl ?? null,
        variant: item.variant ?? null,
        colorVariant: item.colorVariant ?? null,
        sectionStyle: item.sectionStyle ?? null,
        game: null,
        media: item.media
          ? { ...item.media, __typename: 'MediaWrapper' as const }
          : null,
      };
    }
    if (item.__typename === 'TwoAcross') {
      return {
        __typename: 'TwoAcross',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        eyebrow: item.eyebrow ?? null,
        heading: item.heading ?? null,
        body: item.body ? { json: item.body.json } : null,
        media: item.media ?? null,
        mediaAltText: item.mediaAltText ?? null,
        mediaPosition: item.mediaPosition ?? null,
        ctaLabel: item.ctaLabel ?? null,
        ctaUrl: item.ctaUrl ?? null,
        sectionStyle: item.sectionStyle ?? null,
        colorVariant: item.colorVariant ?? null,
      };
    }
    if (item.__typename === 'BlogPostsSection') {
      return {
        __typename: 'BlogPostsSection',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        title: item.title ?? null,
        description: item.description ?? null,
        limit: item.limit ?? null,
        postsCollection: item.postsCollection ?? null,
      };
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[transformSection] Error:', error);
    return null;
  }
}

/**
 * Renders page sections with Contentful live updates.
 *
 * The `useLiveUpdates` hook receives RAW GraphQL data and automatically
 * updates it when Contentful sends changes. We then transform the live-updated
 * data for rendering.
 *
 * Key strategy: Include the full section order in each component's key to
 * ensure React properly re-renders when sections are reordered.
 */
export function PageContentLive({ page }: Props) {
  // Apply live updates to the RAW GraphQL data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const livePage = useLiveUpdates(page) as any;

  // Transform the live-updated sections
  const rawSections = livePage?.sectionsCollection?.items ?? [];
  const sections = rawSections
    .map(transformSection)
    .filter(Boolean) as PageSection[];

  // Create a stable key that updates when section order changes
  const sectionKey = sections.map((s) => s.sys.id).join('-');

  return (
    <div className="container">
      {sections.map((section, index) => (
        <BlockRenderer
          key={`${sectionKey}-${section.sys.id}-${index}`}
          data={section}
        />
      ))}
    </div>
  );
}
