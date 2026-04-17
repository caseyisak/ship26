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
    headlineRt { json }
    subheadlineRt { json }
    background { url }
    media { url }
    ctaText
    ctaUrl
    sectionStyle
    variant
  }
  ... on Faq {
    internalName
    titleRt { json }
    descriptionRt { json }
  }
  ... on Features {
    internalName
    labelRt { json }
    titleRt { json }
    descriptionRt { json }
  }
  ... on Tabbedcontent {
    internalName
    taglineRt { json }
    titleRt { json }
    descriptionRt { json }
  }
  ... on DataViz {
    internalName
    titleRt { json }
    descriptionRt { json }
    chartType
    csvData { url }
    colorScheme
    showLegend
  }
  ... on Banner {
    internalName
    headlineRt { json }
    subheadlineRt { json }
    ctaText
    ctaUrl
    variant
    colorVariant
    sectionStyle
  }
  ... on TwoAcross {
    internalName
    eyebrowRt { json }
    headingRt { json }
    media { url }
    mediaPosition
    ctaLabel
    ctaUrl
    colorVariant
    sectionStyle
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

/** Hero fragment: all fields from Hero content type (internalName, headlineRt, subheadlineRt, background, media, ctaText, ctaUrl, sectionStyle, variant, nt_experiences). */
const HERO_FIELDS = `
  __typename
  sys { id }
  ... on Hero {
    internalName
    headlineRt { json }
    subheadlineRt { json }
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

/** FaqItem fragment: all fields from FaqItem content type (internalName, questionRt, answerRt). */
const FAQ_ITEM_FIELDS = `
  __typename
  sys { id }
  ... on Faqitem {
    internalName
    questionRt { json }
    answerRt { json }
  }
`;

/** FAQ fragment: all fields from FAQ content type (internalName, titleRt, descriptionRt, items). */
const FAQ_FIELDS = `
  __typename
  sys { id }
  ... on Faq {
    internalName
    titleRt { json }
    descriptionRt { json }
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

/** TabbedContent fragment: all fields from TabbedContent content type (internalName, taglineRt, titleRt, descriptionRt, itemsCollection, ntExperiences). */
const TABBED_CONTENT_FIELDS = `
  __typename
  sys { id }
  ... on Tabbedcontent {
    internalName
    taglineRt { json }
    titleRt { json }
    descriptionRt { json }
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

/** Feature Item fragment: all fields from Feature Item content type (titleRt, descriptionRt, media, animationKey, mediaPlacement). */
const FEATURE_ITEM_FIELDS = `
  __typename
  sys { id }
  ... on FeatureItem {
    titleRt { json }
    descriptionRt { json }
    media { url }
    animationKey
    mediaPlacement
  }
`;

/** Features fragment: all fields from Features content type (internalName, labelRt, titleRt, descriptionRt, items, ntExperiences). */
const FEATURES_FIELDS = `
  __typename
  sys { id }
  ... on Features {
    internalName
    labelRt { json }
    titleRt { json }
    descriptionRt { json }
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

/** DataViz fragment: all fields from DataViz content type (internalName, titleRt, descriptionRt, chartType, csvData, colorScheme, showLegend). */
const DATA_VIZ_FIELDS = `
  __typename
  sys { id }
  ... on DataViz {
    internalName
    titleRt { json }
    descriptionRt { json }
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
          contentfulMetadata { tags { id name } }
          heroImage { url width height }
          author { __typename sys { id } ... on Author { name bio } }
        }
      }
    }
  }
`;

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

/** TwoAcross fragment: 2-column text + media section. */
const TWO_ACROSS_FIELDS = `
  __typename
  sys { id }
  ... on TwoAcross {
    internalName
    eyebrowRt { json }
    headingRt { json }
    body { json }
    media { url }
    mediaAltText
    mediaPosition
    ctaLabel
    ctaUrl
    sectionStyle
    colorVariant
  }
`;

/** Banner fragment: web + mobile surfaces. */
const BANNER_FIELDS = `
  __typename
  sys { id }
  ... on Banner {
    internalName
    headlineRt { json }
    subheadlineRt { json }
    copy
    ctaText
    ctaUrl
    variant
    colorVariant
    sectionStyle
    media {
      ${MEDIA_WRAPPER_FIELDS}
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
            ${BANNER_FIELDS}
            ${FAQ_FIELDS}
            ${TABBED_CONTENT_FIELDS}
            ${FEATURES_FIELDS}
            ${DATA_VIZ_FIELDS}
            ${TWO_ACROSS_FIELDS}
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

/** Fetch a single FAQ entry by entry ID (for ID-based live preview). */
export const FAQ_BY_ID = `
  query FaqById($id: String!, $locale: String!, $preview: Boolean) {
    faqCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${FAQ_FIELDS}
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
    contentfulMetadata { tags { id name } }
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
    contentfulMetadata { tags { id name } }
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

/** SocialPost fragment: channels (multi-select), copy, hashtags, status, media. */
const SOCIAL_POST_FIELDS = `
  __typename
  sys { id }
  ... on SocialPost {
    internalName
    channels
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

// ── Dashboard Page queries ────────────────────────────────────────────────────

const DASHBOARD_SLOT_FIELDS = `
  __typename
  ... on Entry { sys { id } }
  ... on Banner {
    internalName
    headlineRt { json }
    subheadlineRt { json }
    copy
    ctaText
    ctaUrl
    variant
    colorVariant
    sectionStyle
  }
  ... on FeatureItem {
    titleRt {
      json
      links {
        entries {
          inline {
            sys { id }
            ... on NtMergetag {
              ntMergetagId
              ntFallback
            }
          }
        }
      }
    }
    description
    media { url }
    animationKey
    mediaPlacement
    sectionStyle
  }
  ... on Faq {
    internalName
    titleRt { json }
    descriptionRt { json }
    itemsCollection(limit: 50) {
      items {
        __typename
        sys { id }
        ... on Faqitem {
          internalName
          questionRt { json }
          answerRt { json }
        }
      }
    }
  }
`;

/** Fetch a DashboardPage entry by entry ID (used for live preview). */
export const DASHBOARD_PAGE_BY_ID = `
  query DashboardPageById($id: String!, $locale: String!, $preview: Boolean) {
    dashboardPageCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        __typename
        sys { id }
        internalName
        title
        slug
        pageType
        top { ${DASHBOARD_SLOT_FIELDS} }
        middle { ${DASHBOARD_SLOT_FIELDS} }
        bottom { ${DASHBOARD_SLOT_FIELDS} }
      }
    }
  }
`;

/** Fetch a DashboardPage entry by pageType (dashboard-home | upgrades | checkout). */
export const DASHBOARD_PAGE_BY_TYPE = `
  query DashboardPageByType($pageType: String!, $locale: String!, $preview: Boolean) {
    dashboardPageCollection(where: { pageType: $pageType }, locale: $locale, preview: $preview, limit: 1) {
      items {
        __typename
        sys { id }
        internalName
        title
        slug
        pageType
        top { ${DASHBOARD_SLOT_FIELDS} }
        middle { ${DASHBOARD_SLOT_FIELDS} }
        bottom { ${DASHBOARD_SLOT_FIELDS} }
      }
    }
  }
`;

/** Fetch a DashboardPage entry by slug. */
export const DASHBOARD_PAGE_BY_SLUG = `
  query DashboardPageBySlug($slug: String!, $locale: String!, $preview: Boolean) {
    dashboardPageCollection(where: { slug: $slug }, locale: $locale, preview: $preview, limit: 1) {
      items {
        __typename
        sys { id }
        internalName
        title
        slug
        pageType
        top { ${DASHBOARD_SLOT_FIELDS} }
        middle { ${DASHBOARD_SLOT_FIELDS} }
        bottom { ${DASHBOARD_SLOT_FIELDS} }
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

/** News Article fragment: all fields from NewsArticle content type. */
const NEWS_ARTICLE_FIELDS = `
  __typename
  sys { id }
  ... on NewsArticle {
    internalName
    title
    slug
    excerpt
    publishedDate
    category
    media { url width height }
  }
`;

/** Fetch a collection of NewsArticle entries (for news grid). */
export const NEWS_ARTICLES_COLLECTION = `
  query NewsArticlesCollection($locale: String!, $preview: Boolean, $limit: Int, $skip: Int) {
    newsArticleCollection(locale: $locale, preview: $preview, limit: $limit, skip: $skip, order: publishedDate_DESC) {
      total
      items {
        ${NEWS_ARTICLE_FIELDS}
      }
    }
  }
`;

/** Fetch a single NewsArticle entry by entry ID. */
export const NEWS_ARTICLE_BY_ID = `
  query NewsArticleById($id: String!, $locale: String!, $preview: Boolean) {
    newsArticleCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${NEWS_ARTICLE_FIELDS}
      }
    }
  }
`;
