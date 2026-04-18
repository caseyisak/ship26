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
  ... on CtaSection {
    internalName
    headlineRt { json }
    subheadlineRt { json }
    ctaPrimaryUrl
    ctaSecondaryUrl
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

/**
 * Lean Hero fragment for PAGE_BY_SLUG — omits ntExperiencesCollection.
 * NT data is available via HERO_BY_ID (preview route only).
 * Keeps PAGE_BY_SLUG under Contentful's 8192-byte query limit (LL-011).
 */
const HERO_PAGE_FIELDS = `
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

/**
 * Lean FAQ fragment for PAGE_BY_SLUG — omits ntExperiencesCollection.
 * NT data is available via FAQ_BY_ID (preview route only).
 * Keeps PAGE_BY_SLUG under Contentful's 8192-byte query limit (LL-011).
 */
const FAQ_PAGE_FIELDS = `
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

/**
 * Lean TabbedContent fragment for PAGE_BY_SLUG — omits ntExperiencesCollection.
 * NT data is available via TABBED_CONTENT_BY_ID (preview route only).
 * Keeps PAGE_BY_SLUG under Contentful's 8192-byte query limit (LL-011).
 */
const TABBED_CONTENT_PAGE_FIELDS = `
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
  }
`;

/** Feature Item fragment: all fields from Feature Item content type (titleRt, descriptionRt, media, animationKey, mediaPlacement, sectionStyle). */
const FEATURE_ITEM_FIELDS = `
  __typename
  sys { id }
  ... on FeatureItem {
    titleRt { json }
    descriptionRt { json }
    media { url }
    animationKey
    mediaPlacement
    sectionStyle
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

/**
 * Lean Features fragment for PAGE_BY_SLUG — omits ntExperiencesCollection.
 * NT data is available via FEATURES_BY_ID (preview route only).
 * Keeps PAGE_BY_SLUG under Contentful's 8192-byte query limit (LL-011).
 */
const FEATURES_PAGE_FIELDS = `
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

/**
 * Lean DataViz fragment for PAGE_BY_SLUG — omits ntExperiencesCollection.
 * NT data is available via DATA_VIZ_BY_ID (preview route only).
 * Keeps PAGE_BY_SLUG under Contentful's 8192-byte query limit (LL-011).
 */
const DATA_VIZ_PAGE_FIELDS = `
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

/** CtaSection fragment: full-width CTA block with colorVariant, optional background image, and dual CTAs. */
const CTA_SECTION_FIELDS = `
  __typename
  sys { id }
  ... on CtaSection {
    internalName
    headlineRt { json }
    subheadlineRt { json }
    ctaPrimaryLabelRt { json }
    ctaPrimaryUrl
    ctaSecondaryLabelRt { json }
    ctaSecondaryUrl
    colorVariant
    backgroundImage { url width height description }
    sectionStyle
  }
`;

/** PricingPlanFeature fragment: single feature line item on a plan card. */
const PRICING_PLAN_FEATURE_FIELDS = `
  __typename
  sys { id }
  ... on PricingPlanFeature {
    internalName
    label { json }
  }
`;

/** PricingPlan fragment: single pricing tier card. */
const PRICING_PLAN_FIELDS = `
  __typename
  sys { id }
  ... on PricingPlan {
    internalName
    name
    blurb { json }
    monthlyPrice
    annualPrice
    perUnitMonthly
    perUnitAnnual
    badge
    colorVariant
    ctaLabel { json }
    ctaUrl
    featuresCollection(limit: 20) {
      items { ${PRICING_PLAN_FEATURE_FIELDS} }
    }
  }
`;

/** Pricing fragment: pricing section with optional monthly/yearly toggle and plan cards. */
const PRICING_FIELDS = `
  __typename
  sys { id }
  ... on Pricing {
    internalName
    label { json }
    title { json }
    description { json }
    showToggle
    colorVariant
    plansCollection(limit: 6) {
      items { ${PRICING_PLAN_FIELDS} }
    }
  }
`;

/**
 * Lean Pricing fragment for PAGE_BY_SLUG — header only (no nested plans/features).
 * Full data is loaded in PRICING_BY_ID (used by the preview route and BY_ID fetcher).
 * Intentionally excluded from nested items to stay within Contentful's 8192-byte query limit.
 * NOTE: title/description aliased to titleRt/descriptionRt to avoid type conflict with
 * BlogPostsSection.title/description (String) in the shared inline fragment selection set.
 */
const PRICING_PAGE_FIELDS = `
  __typename
  sys { id }
  ... on Pricing {
    internalName
    label { json }
    titleRt: title { json }
    descriptionRt: description { json }
    showToggle
    colorVariant
    plansCollection(limit: 6) {
      items { ${PRICING_PLAN_FIELDS} }
    }
  }
`;

/** IconGridItem fragment: single icon + text card. */
const ICON_GRID_ITEM_FIELDS = `
  __typename
  sys { id }
  ... on IconGridItem {
    internalName
    icon { url }
    animationKey
    title { json }
    description { json }
  }
`;

/** IconGrid fragment: bordered card or borderless icon-above-text grid. */
const ICON_GRID_FIELDS = `
  __typename
  sys { id }
  ... on IconGrid {
    internalName
    label { json }
    title { json }
    description { json }
    style
    columns
    colorVariant
    itemsCollection(limit: 20) {
      items { ${ICON_GRID_ITEM_FIELDS} }
    }
  }
`;

/**
 * Lean IconGrid fragment for PAGE_BY_SLUG — header only (no nested items).
 * Full data loaded in ICON_GRID_BY_ID.
 * NOTE: title/description aliased to titleRt/descriptionRt to avoid type conflict with
 * BlogPostsSection.title/description (String) in the shared inline fragment selection set.
 */
const ICON_GRID_PAGE_FIELDS = `
  __typename
  sys { id }
  ... on IconGrid {
    internalName
    label { json }
    titleRt: title { json }
    descriptionRt: description { json }
    style
    columns
    colorVariant
    itemsCollection(limit: 20) {
      items { ${ICON_GRID_ITEM_FIELDS} }
    }
  }
`;

/** FeatureShowcaseItem fragment: 1/3 text + 2/3 image. */
const FEATURE_SHOWCASE_ITEM_FIELDS = `
  __typename
  sys { id }
  ... on FeatureShowcaseItem {
    internalName
    title { json }
    description { json }
    media { url }
  }
`;

/** FeatureShowcase fragment: stacked 2-col showcase sections. */
const FEATURE_SHOWCASE_FIELDS = `
  __typename
  sys { id }
  ... on FeatureShowcase {
    internalName
    label { json }
    title { json }
    description { json }
    colorVariant
    itemsCollection(limit: 10) {
      items { ${FEATURE_SHOWCASE_ITEM_FIELDS} }
    }
  }
`;

/**
 * Lean FeatureShowcase fragment for PAGE_BY_SLUG — header only (no nested items).
 * Full data loaded in FEATURE_SHOWCASE_BY_ID.
 * NOTE: title/description aliased to titleRt/descriptionRt to avoid type conflict with
 * BlogPostsSection.title/description (String) in the shared inline fragment selection set.
 */
const FEATURE_SHOWCASE_PAGE_FIELDS = `
  __typename
  sys { id }
  ... on FeatureShowcase {
    internalName
    label { json }
    titleRt: title { json }
    descriptionRt: description { json }
    colorVariant
    itemsCollection(limit: 10) {
      items { ${FEATURE_SHOWCASE_ITEM_FIELDS} }
    }
  }
`;

/** MediaCard fragment: large image card with imageFit. */
const MEDIA_CARD_FIELDS = `
  __typename
  sys { id }
  ... on MediaCard {
    internalName
    title { json }
    description { json }
    media { url }
    imageFit
  }
`;

/** MediaCardGrid fragment: grid of media cards. */
const MEDIA_CARD_GRID_FIELDS = `
  __typename
  sys { id }
  ... on MediaCardGrid {
    internalName
    label { json }
    title { json }
    description { json }
    columns
    colorVariant
    itemsCollection(limit: 12) {
      items { ${MEDIA_CARD_FIELDS} }
    }
  }
`;

/**
 * Lean MediaCardGrid fragment for PAGE_BY_SLUG — header only (no nested items).
 * Full data loaded in MEDIA_CARD_GRID_BY_ID.
 * NOTE: title/description aliased to titleRt/descriptionRt to avoid type conflict with
 * BlogPostsSection.title/description (String) in the shared inline fragment selection set.
 */
const MEDIA_CARD_GRID_PAGE_FIELDS = `
  __typename
  sys { id }
  ... on MediaCardGrid {
    internalName
    label { json }
    titleRt: title { json }
    descriptionRt: description { json }
    columns
    colorVariant
    itemsCollection(limit: 12) {
      items { ${MEDIA_CARD_FIELDS} }
    }
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

/**
 * PAGE_BY_SLUG — lean query kept under Contentful's 8192-byte limit (LL-011).
 * All block fragments use *_PAGE_FIELDS variants that omit ntExperiencesCollection
 * and nested items collections where possible.
 * Full data (NT + nested items) is only fetched via *_BY_ID queries in preview routes.
 */
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
            ${HERO_PAGE_FIELDS}
            ${BANNER_FIELDS}
            ${FAQ_PAGE_FIELDS}
            ${TABBED_CONTENT_PAGE_FIELDS}
            ${FEATURES_PAGE_FIELDS}
            ${DATA_VIZ_PAGE_FIELDS}
            ${TWO_ACROSS_FIELDS}
            ${BLOG_POSTS_SECTION_FIELDS}
            ${CTA_SECTION_FIELDS}
            ${PRICING_PAGE_FIELDS}
            ${ICON_GRID_PAGE_FIELDS}
            ${FEATURE_SHOWCASE_PAGE_FIELDS}
            ${MEDIA_CARD_GRID_PAGE_FIELDS}
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

/** Fetch a single CtaSection entry by entry ID (for ID-based live preview).
 *  ntExperiencesCollection is intentionally excluded from CTA_SECTION_FIELDS (PAGE_BY_SLUG byte limit) — added here only. */
export const CTA_SECTION_BY_ID = `
  query CtaSectionById($id: String!, $locale: String!, $preview: Boolean) {
    ctaSectionCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${CTA_SECTION_FIELDS}
        ... on CtaSection {
          ntExperiencesCollection(limit: 10) {
            items { ${NT_EXPERIENCE_FIELDS} }
          }
        }
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
    descriptionRt { json }
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
  ... on Hero {
    internalName
    headlineRt { json }
    subheadlineRt { json }
    ctaText
    ctaUrl
    variant
    sectionStyle
    background { url }
  }
  ... on CtaSection {
    internalName
    headlineRt { json }
    subheadlineRt { json }
    ctaPrimaryLabelRt { json }
    ctaPrimaryUrl
    ctaSecondaryLabelRt { json }
    ctaSecondaryUrl
    colorVariant
    backgroundImage { url width height description }
    sectionStyle
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
        slug
        headerBlock { ${DASHBOARD_SLOT_FIELDS} }
        primaryBlock { ${DASHBOARD_SLOT_FIELDS} }
        secondaryBlock { ${DASHBOARD_SLOT_FIELDS} }
        tertiaryBlock { ${DASHBOARD_SLOT_FIELDS} }
        quaternaryBlock { ${DASHBOARD_SLOT_FIELDS} }
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
        slug
        headerBlock { ${DASHBOARD_SLOT_FIELDS} }
        primaryBlock { ${DASHBOARD_SLOT_FIELDS} }
        secondaryBlock { ${DASHBOARD_SLOT_FIELDS} }
        tertiaryBlock { ${DASHBOARD_SLOT_FIELDS} }
        quaternaryBlock { ${DASHBOARD_SLOT_FIELDS} }
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

/** Fetch a single Pricing entry by entry ID (for ID-based live preview). */
export const PRICING_BY_ID = `
  query PricingById($id: String!, $locale: String!, $preview: Boolean) {
    pricingCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${PRICING_FIELDS}
      }
    }
  }
`;

/** Fetch a single IconGrid entry by entry ID (for ID-based live preview). */
export const ICON_GRID_BY_ID = `
  query IconGridById($id: String!, $locale: String!, $preview: Boolean) {
    iconGridCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${ICON_GRID_FIELDS}
      }
    }
  }
`;

/** Fetch a single FeatureShowcase entry by entry ID (for ID-based live preview). */
export const FEATURE_SHOWCASE_BY_ID = `
  query FeatureShowcaseById($id: String!, $locale: String!, $preview: Boolean) {
    featureShowcaseCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${FEATURE_SHOWCASE_FIELDS}
      }
    }
  }
`;

/** Fetch a single MediaCardGrid entry by entry ID (for ID-based live preview). */
export const MEDIA_CARD_GRID_BY_ID = `
  query MediaCardGridById($id: String!, $locale: String!, $preview: Boolean) {
    mediaCardGridCollection(where: { sys: { id: $id } }, locale: $locale, preview: $preview, limit: 1) {
      items {
        ${MEDIA_CARD_GRID_FIELDS}
      }
    }
  }
`;
