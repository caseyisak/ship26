/** Hero fragment: all fields from Hero content type (internalName, headline, subheadline, background, media, ctaText, ctaUrl, sectionStyle, sectionStyleUpdatedAt, variant, nt_experiences). */
const HERO_FIELDS = `
  __typename
  sys { id }
  ... on Hero {
    internalName
    headline
    subheadline
    background { url }
    media { url }
    ctaText
    ctaUrl
    sectionStyle
    sectionStyleUpdatedAt
    variant
    ntExperiencesCollection(limit: 10) {
      items { __typename sys { id } }
    }
  }
`;

/** FaqItem fragment: all fields from FaqItem content type (internalName, question, answer). */
const FAQ_ITEM_FIELDS = `
  __typename
  sys { id }
  ... on Faqitem {
    internalName
    question
    answer
  }
`;

/** FAQ fragment: all fields from FAQ content type (internalName, title, description, items). */
const FAQ_FIELDS = `
  __typename
  sys { id }
  ... on Faq {
    internalName
    title
    description
    itemsCollection(limit: 50) {
      items {
        ${FAQ_ITEM_FIELDS}
      }
    }
  }
`;

/** TabbedContentItem fragment: all fields from TabbedContentItem content type (label, body, image, imageAlt, href, buttonLabel). */
const TABBED_CONTENT_ITEM_FIELDS = `
  __typename
  sys { id }
  ... on Tabbedcontentitem {
    label
    body
    image { url width height }
    imageAlt
    href
    buttonLabel
  }
`;

/** TabbedContent fragment: all fields from TabbedContent content type (internalName, tagline, title, description, itemsCollection, nt_experiences). */
const TABBED_CONTENT_FIELDS = `
  __typename
  sys { id }
  ... on Tabbedcontent {
    internalName
    tagline
    title
    description
    itemsCollectionCollection(limit: 50) {
      items {
        ${TABBED_CONTENT_ITEM_FIELDS}
      }
    }
    ntExperiencesCollectionCollection(limit: 10) {
      items { __typename sys { id } }
    }
  }
`;

/** Feature Item fragment: all fields from Feature Item content type (title, description, media, animationKey). */
const FEATURE_ITEM_FIELDS = `
  __typename
  sys { id }
  ... on FeatureItem {
    title
    description
    media { url }
    animationKey
  }
`;

/** Features fragment: all fields from Features content type (internalName, label, title, description, items, ntExperiences). */
const FEATURES_FIELDS = `
  __typename
  sys { id }
  ... on Features {
    internalName
    label
    title
    description
    itemsCollection(limit: 20) {
      items {
        ${FEATURE_ITEM_FIELDS}
      }
    }
    ntExperiencesCollection(limit: 10) {
      items { __typename sys { id } }
    }
  }
`;

/** DataViz fragment: all fields from DataViz content type (internalName, title, description, chartType, csvData, colorScheme, showLegend). */
const DATA_VIZ_FIELDS = `
  __typename
  sys { id }
  ... on DataViz {
    internalName
    title
    description
    chartType
    csvData { url }
    colorScheme
    showLegend
  }
`;

export const PAGE_BY_SLUG = `
  query PageBySlug($slug: String!, $locale: String!, $preview: Boolean) {
    pageCollection(where: { slug: $slug }, locale: $locale, preview: $preview, limit: 1) {
      items {
        __typename
        sys { id }
        internalName
        slug
        sectionsCollection(limit: 20) {
          items {
            __typename
            sys { id }
            ${HERO_FIELDS}
            ${FAQ_FIELDS}
            ${TABBED_CONTENT_FIELDS}
            ${FEATURES_FIELDS}
            ${DATA_VIZ_FIELDS}
          }
        }
        ntExperiencesCollection(limit: 10) {
          items { __typename sys { id } }
        }
      }
    }
  }
`;

export const PAGE_SLUGS = `
  query PageSlugs($locale: String!, $preview: Boolean) {
    pageCollection(locale: $locale, preview: $preview, limit: 100) {
      items {
        slug
      }
    }
  }
`;

/** Fetch a single Hero entry by entry ID (for ID-based live preview, no slug). Uses same Hero fields as PAGE_BY_SLUG. */
export const HERO_BY_ID = `
  query HeroById($id: String!, $locale: String!, $preview: Boolean) {
    heroCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${HERO_FIELDS}
      }
    }
  }
`;

/** Fetch a single DataViz entry by entry ID (for ID-based live preview). */
export const DATA_VIZ_BY_ID = `
  query DataVizById($id: String!, $locale: String!, $preview: Boolean) {
    dataVizCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${DATA_VIZ_FIELDS}
      }
    }
  }
`;

/** Fetch a single TabbedContent entry by entry ID (for ID-based live preview, no slug). Uses same TabbedContent fields as PAGE_BY_SLUG. */
export const TABBED_CONTENT_BY_ID = `
  query TabbedContentById($id: String!, $locale: String!, $preview: Boolean) {
    tabbedContentCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${TABBED_CONTENT_FIELDS}
      }
    }
  }
`;
