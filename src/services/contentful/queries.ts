/** Ninetailed audience fragment fields. */
const NT_AUDIENCE_FIELDS = `
  sys { id }
  ntAudienceId
  ntName
  ntDescription
  ntRules
`;

/**
 * Content fields for NT experience variant items.
 * Includes inline fragments for all personalizable block types.
 * Fetches scalar/media fields only (no nested itemsCollections) to stay
 * within Contentful's 8192-byte query size limit.
 * Most personalization use cases swap headlines/copy/media, not nested items.
 * Intentionally excludes ntExperiencesCollection to avoid circular queries.
 */
const NT_VARIANT_FIELDS = `
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
    variant
  }
  ... on Faq {
    internalName
    title
    description
  }
  ... on Features {
    internalName
    label
    title
    description
  }
  ... on Tabbedcontent {
    internalName
    tagline
    title
    description
  }
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

/** Ninetailed experience fragment fields. */
const NT_EXPERIENCE_FIELDS = `
  sys { id }
  ntExperienceId
  ntName
  ntType
  ntConfig
  ntAudience { ${NT_AUDIENCE_FIELDS} }
  ntVariantsCollection(limit: 10) {
    items { ${NT_VARIANT_FIELDS} }
  }
`;

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
    variant
    ntExperiencesCollection(limit: 10) {
      items { ${NT_EXPERIENCE_FIELDS} }
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
    ntExperiencesCollection(limit: 10) {
      items { ${NT_EXPERIENCE_FIELDS} }
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

/** TabbedContent fragment: all fields from TabbedContent content type (internalName, tagline, title, description, itemsCollection, ntExperiences). */
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
    ntExperiencesCollection(limit: 10) {
      items { ${NT_EXPERIENCE_FIELDS} }
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
      items { ${NT_EXPERIENCE_FIELDS} }
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
    ntExperiencesCollection(limit: 10) {
      items { ${NT_EXPERIENCE_FIELDS} }
    }
  }
`;

/** BlogPostsSection fragment: section header + curated post cards (no body).
 *  Note: inlines post card fields to avoid forward-reference to BLOG_POST_CARD_FIELDS. */
const BLOG_POSTS_SECTION_FIELDS = `
  __typename
  sys { id }
  ... on BlogPostsSection {
    internalName
    title
    description
    limit
    postsCollection(limit: 12) {
      items {
        __typename
        sys { id }
        ... on BlogPost {
          title
          slug
          excerpt
          publishDate
          tags
          heroImage { url width height }
          author { __typename sys { id } ... on Author { name bio } }
        }
      }
    }
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
            ${BLOG_POSTS_SECTION_FIELDS}
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

/** Author fragment: name and bio. */
const AUTHOR_FIELDS = `
  __typename
  sys { id }
  ... on Author {
    name
    bio
  }
`;

/** BlogPost card fragment: all fields except body (for listing pages). */
const BLOG_POST_CARD_FIELDS = `
  __typename
  sys { id }
  ... on BlogPost {
    title
    slug
    excerpt
    publishDate
    tags
    heroImage { url width height }
    author {
      ${AUTHOR_FIELDS}
    }
  }
`;

/** BlogPost full fragment: includes body richtext JSON (for detail pages). */
const BLOG_POST_FIELDS = `
  __typename
  sys { id }
  ... on BlogPost {
    title
    slug
    excerpt
    publishDate
    tags
    heroImage { url width height }
    body { json }
    author {
      ${AUTHOR_FIELDS}
    }
    ntExperiencesCollection(limit: 10) {
      items { ${NT_EXPERIENCE_FIELDS} }
    }
  }
`;

/** MediaWrapper fragment: asset URL + channel/aspect-ratio metadata. */
const MEDIA_WRAPPER_FIELDS = `
  __typename
  sys { id }
  ... on MediaWrapper {
    internalName
    asset { url width height }
    channels
    aspectRatios
  }
`;

/** Game fragment: core game metadata used by Banner and SocialPost. */
const GAME_FIELDS = `
  __typename
  sys { id }
  ... on Game {
    title
    week
    seasonYear
    opponentName
    homeAway
    kickoffDateTime
  }
`;

/** Banner fragment: gameday banner for web + mobile surfaces.
 *  Note: game field omitted — Game content type is not in master schema (bears-only). */
const BANNER_FIELDS = `
  __typename
  sys { id }
  ... on Banner {
    internalName
    headline
    subheadline
    copy
    ctaText
    ctaUrl
    media {
      ${MEDIA_WRAPPER_FIELDS}
    }
  }
`;

/** SocialPost fragment: one post for one or more channels.
 *  Note: game field omitted — Game content type is not in master schema (bears-only). */
const SOCIAL_POST_FIELDS = `
  __typename
  sys { id }
  ... on SocialPost {
    internalName
    channel
    channels
    postType
    copy
    hashtags
    status
    media {
      ${MEDIA_WRAPPER_FIELDS}
    }
  }
`;

/** Fetch all blog posts for listing page (ordered newest first). */
export const BLOG_POSTS = `
  query BlogPosts($locale: String!, $preview: Boolean) {
    blogPostCollection(locale: $locale, preview: $preview, limit: 20, order: publishDate_DESC) {
      items {
        ${BLOG_POST_CARD_FIELDS}
      }
    }
  }
`;

/** Fetch a single Banner entry by entry ID (for ID-based live preview). */
export const BANNER_BY_ID = `
  query BannerById($id: String!, $locale: String!, $preview: Boolean) {
    bannerCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${BANNER_FIELDS}
      }
    }
  }
`;

/** Fetch a single blog post by slug. */
export const BLOG_POST_BY_SLUG = `
  query BlogPostBySlug($slug: String!, $locale: String!, $preview: Boolean) {
    blogPostCollection(where: { slug: $slug }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${BLOG_POST_FIELDS}
      }
    }
  }
`;

/** Fetch a single blog post by entry ID (for live preview). */
export const BLOG_POST_BY_ID = `
  query BlogPostById($id: String!, $locale: String!, $preview: Boolean) {
    blogPostCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${BLOG_POST_FIELDS}
      }
    }
  }
`;

/** Fetch a single SocialPost entry by entry ID (for ID-based live preview). */
export const SOCIAL_POST_BY_ID = `
  query SocialPostById($id: String!, $locale: String!, $preview: Boolean) {
    socialPostCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${SOCIAL_POST_FIELDS}
      }
    }
  }
`;

/** Fetch a single BlogPostsSection entry by entry ID (for ID-based live preview). */
export const BLOG_POSTS_SECTION_BY_ID = `
  query BlogPostsSectionById($id: String!, $locale: String!, $preview: Boolean) {
    blogPostsSectionCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${BLOG_POSTS_SECTION_FIELDS}
      }
    }
  }
`;

/** Fetch all Ninetailed experiences (used by PersonalizationProvider). */
export const GET_PERSONALIZATION_EXPERIENCES = `
  query GetPersonalizationExperiences($preview: Boolean = false) {
    ntExperienceCollection(preview: $preview, limit: 100) {
      items { ${NT_EXPERIENCE_FIELDS} }
    }
  }
`;

/** Fetch all Ninetailed audiences (used by PersonalizationProvider). */
export const GET_PERSONALIZATION_AUDIENCES = `
  query GetPersonalizationAudiences($preview: Boolean = false) {
    ntAudienceCollection(preview: $preview, limit: 100) {
      items { ${NT_AUDIENCE_FIELDS} }
    }
  }
`;
