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
        headlineRt: item.headlineRt ?? null,
        subheadlineRt: item.subheadlineRt ?? null,
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
        titleRt: item.titleRt ?? null,
        descriptionRt: item.descriptionRt ?? null,
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
                        questionRt: faqItem.questionRt ?? null,
                        answerRt: faqItem.answerRt ?? null,
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
        taglineRt: item.taglineRt ?? null,
        titleRt: item.titleRt ?? null,
        descriptionRt: item.descriptionRt ?? null,
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
    if (item.__typename === 'DataViz') {
      return {
        __typename: 'DataViz',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        titleRt: item.titleRt ?? null,
        descriptionRt: item.descriptionRt ?? null,
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
        eyebrowRt: item.eyebrowRt ?? null,
        headingRt: item.headingRt ?? null,
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
    if (item.__typename === 'CtaSection') {
      return {
        __typename: 'CtaSection',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        headlineRt: item.headlineRt ?? null,
        subheadlineRt: item.subheadlineRt ?? null,
        ctaPrimaryLabelRt: item.ctaPrimaryLabelRt ?? null,
        ctaPrimaryUrl: item.ctaPrimaryUrl ?? null,
        ctaSecondaryLabelRt: item.ctaSecondaryLabelRt ?? null,
        ctaSecondaryUrl: item.ctaSecondaryUrl ?? null,
        colorVariant: item.colorVariant ?? null,
        backgroundImage: item.backgroundImage ?? null,
        sectionStyle: item.sectionStyle ?? null,
      };
    }
    if (item.__typename === 'Pricing') {
      return {
        __typename: 'Pricing',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        label: item.label ?? null,
        // PAGE_BY_SLUG aliases title/description as titleRt/descriptionRt to avoid
        // type conflict with BlogPostsSection.title (String) in shared selection set
        title: item.title ?? item.titleRt ?? null,
        description: item.description ?? item.descriptionRt ?? null,
        showToggle: item.showToggle ?? null,
        colorVariant: item.colorVariant ?? null,
        plansCollection: item.plansCollection ?? null,
      };
    }
    if (item.__typename === 'IconGrid') {
      return {
        __typename: 'IconGrid',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        label: item.label ?? null,
        title: item.title ?? item.titleRt ?? null,
        description: item.description ?? item.descriptionRt ?? null,
        style: item.style ?? null,
        columns: item.columns ?? null,
        colorVariant: item.colorVariant ?? null,
        itemsCollection: item.itemsCollection ?? null,
      };
    }
    if (item.__typename === 'FeatureShowcase') {
      return {
        __typename: 'FeatureShowcase',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        label: item.label ?? null,
        title: item.title ?? item.titleRt ?? null,
        description: item.description ?? item.descriptionRt ?? null,
        colorVariant: item.colorVariant ?? null,
        itemsCollection: item.itemsCollection ?? null,
      };
    }
    if (item.__typename === 'MediaCardGrid') {
      return {
        __typename: 'MediaCardGrid',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        label: item.label ?? null,
        title: item.title ?? item.titleRt ?? null,
        description: item.description ?? item.descriptionRt ?? null,
        columns: item.columns ?? null,
        colorVariant: item.colorVariant ?? null,
        itemsCollection: item.itemsCollection ?? null,
      };
    }
    if (item.__typename === 'FeatureSection') {
      return {
        __typename: 'FeatureSection',
        sys: { id: item.sys.id },
        internalName: item.internalName ?? null,
        label: item.label ?? null,
        // PAGE_BY_SLUG aliases title/description as titleRt/descriptionRt to avoid
        // type conflict with BlogPostsSection.title (String) in shared selection set
        title: item.titleRt ?? item.title ?? null,
        description: item.descriptionRt ?? item.description ?? null,
        displayVariant: item.displayVariant ?? null,
        columns: item.columns ?? null,
        itemsCollection: item.itemsCollection ?? null,
        sectionStyle: item.sectionStyle ?? null,
        ntExperiencesCollection: item.ntExperiencesCollection ?? null,
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
