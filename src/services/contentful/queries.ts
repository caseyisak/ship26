/** Hero fragment: all fields from Hero content type (internalName, headline, subheadline, media, background, ctaText, ctaUrl, sectionStyle, sectionStyleUpdatedAt, variant, nt_experiences). */
const HERO_FIELDS = `
  __typename
  sys { id }
  ... on Hero {
    internalName
    headline
    subheadline
    media { url }
    background { url }
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

export const PAGE_BY_SLUG = `
  query PageBySlug($slug: String!, $locale: String!, $preview: Boolean) {
    pageCollection(where: { slug: $slug }, locale: $locale, preview: $preview, limit: 1) {
      items {
        internalName
        slug
        sectionsCollection(limit: 20) {
          items {
            __typename
            sys { id }
            ${HERO_FIELDS}
            ${FAQ_FIELDS}
            ${TABBED_CONTENT_FIELDS}
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
