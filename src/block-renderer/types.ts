import type { LayoutType } from '@/block-renderer/layouts';

/** Minimal block data; no GraphQL codegen dependency. */
export type BlockData = {
  __typename: string;
  sys: { id: string; spaceId?: string };
  _serverError?: string;
};

export type NtAudienceFragment = {
  sys: { id: string };
  ntAudienceId: string;
  ntName: string;
  ntDescription?: string | null;
  ntRules?: unknown;
};

/** A single NT experience variant item — typed broadly to hold any block's fields. */
export type NtVariantItem = {
  __typename?: string;
  sys: { id: string };
} & Record<string, unknown>;

export type NtExperienceFragment = {
  sys: { id: string };
  ntExperienceId: string;
  ntName: string;
  ntType: string;
  ntConfig?: unknown;
  ntAudience?: NtAudienceFragment | null;
  ntVariantsCollection?: {
    items: Array<NtVariantItem>;
  } | null;
};

/** Hero section (matches Contentful Hero content type: internalName, headlineRt, subheadlineRt, background, media, ctaText, ctaUrl, sectionStyle, variant, nt_experiences). */
export type HeroFragment = BlockData & {
  __typename: 'Hero';
  internalName?: string | null;
  headlineRt?: { json: Record<string, unknown> } | null;
  subheadlineRt?: { json: Record<string, unknown> } | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  variant?: string | null;
  sectionStyle?: string | null;
  background?: { url?: string } | null;
  image?: { url?: string } | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** FaqItem (matches Contentful FaqItem content type: internalName, questionRt, answerRt). */
export type FaqItemFragment = {
  __typename: 'FaqItem';
  sys: { id: string };
  internalName?: string | null;
  questionRt?: { json: Record<string, unknown> } | null;
  answerRt?: { json: Record<string, unknown> } | null;
};

/** FAQ section (matches Contentful FAQ content type: internalName, titleRt, descriptionRt, items). */
export type FaqFragment = BlockData & {
  __typename: 'Faq';
  internalName?: string | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  itemsCollection?: { items: FaqItemFragment[] } | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** TabbedContentItem (matches Contentful TabbedContentItem content type: label, body, image, imageAlt, href, buttonLabel). */
export type TabbedContentItemFragment = {
  __typename: 'TabbedContentItem';
  sys: { id: string };
  label?: string | null;
  body?: string | null;
  image?: { url?: string; width?: number; height?: number } | null;
  imageAlt?: string | null;
  href?: string | null;
  buttonLabel?: string | null;
};

/** TabbedContent section (matches Contentful TabbedContent content type: internalName, taglineRt, titleRt, descriptionRt, itemsCollection, ntExperiences). */
export type TabbedContentFragment = BlockData & {
  __typename: 'Tabbedcontent';
  internalName?: string | null;
  taglineRt?: { json: Record<string, unknown> } | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  itemsCollection?: { items: TabbedContentItemFragment[] } | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** Feature Item (matches Contentful Feature Item content type: titleRt, descriptionRt, media, animationKey). */
export type FeatureItemFragment = {
  __typename: 'FeatureItem';
  sys: { id: string };
  titleRt?: {
    json: Record<string, unknown>;
    links?: {
      entries?: {
        inline?: Array<{
          sys: { id: string };
          __typename?: string;
          ntMergetagId?: string | null;
          ntFallback?: string | null;
        } | null>;
      };
    };
  } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  image?: { url?: string } | null; // Mapped field name (legacy)
  media?: { url?: string } | null; // Raw Contentful field name
  animationKey?: string | null;
  mediaPlacement?: 'top' | 'bottom' | 'left' | 'right' | null;
  sectionStyle?: Record<string, string> | null;
};

/** Features section (matches Contentful Features content type: internalName, labelRt, titleRt, descriptionRt, mediaPosition, items, ntExperiences). */
export type FeaturesFragment = BlockData & {
  __typename: 'Features';
  internalName?: string | null;
  labelRt?: { json: Record<string, unknown> } | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  mediaPosition?: 'top' | 'bottom' | 'left' | 'right' | null;
  itemsCollection?: { items: FeatureItemFragment[] } | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** Card (matches Contentful Card content type: renamed from featureItem). */
export type CardFragment = {
  __typename: 'Card';
  sys: { id: string };
  titleRt?: {
    json: Record<string, unknown>;
    links?: {
      entries?: {
        inline?: Array<{
          sys: { id: string };
          __typename?: string;
          ntMergetagId?: string | null;
          ntFallback?: string | null;
        } | null>;
      };
    };
  } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  image?: { url?: string } | null; // Mapped field name (legacy)
  media?: { url?: string } | null; // Raw Contentful field name
  animationKey?: string | null;
  mediaPlacement?: 'top' | 'bottom' | 'left' | 'right' | null;
  sectionStyle?: Record<string, string> | null;
};

/** CardsWrapper section (matches Contentful cardsWrapper content type: renamed from features). */
export type CardsWrapperFragment = BlockData & {
  __typename: 'CardsWrapper';
  internalName?: string | null;
  labelRt?: { json: Record<string, unknown> } | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  mediaPosition?: 'top' | 'bottom' | 'left' | 'right' | null;
  itemsCollection?: { items: CardFragment[] } | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** DataViz section (matches Contentful DataViz content type: internalName, titleRt, descriptionRt, chartType, csvData, colorScheme, showLegend). */
export type DataVizFragment = BlockData & {
  __typename: 'DataViz';
  internalName?: string | null;
  titleRt?: { json: Record<string, unknown> } | null;
  descriptionRt?: { json: Record<string, unknown> } | null;
  chartType?: string | null;
  csvData?: { url?: string } | null;
  colorScheme?: string | null;
  showLegend?: boolean | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** Author (matches Contentful Author content type: name, bio). */
export type AuthorFragment = {
  __typename: 'Author';
  sys: { id: string };
  name?: string | null;
  bio?: string | null;
};

/** BlogPost (matches Contentful BlogPost content type: title, slug, excerpt, publishDate, contentfulMetadata, heroImage, body, author). */
export type BlogPostFragment = BlockData & {
  __typename: 'BlogPost';
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  publishDate?: string | null;
  contentfulMetadata?: { tags: Array<{ id: string; name: string }> } | null;
  heroImage?: { url?: string; width?: number; height?: number } | null;
  body?: { json: unknown } | null;
  author?: AuthorFragment | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** Game entry (source of truth for all gameday content). */
export type GameFragment = {
  __typename: 'Game';
  sys: { id: string };
  title?: string | null;
  week?: number | null;
  seasonYear?: number | null;
  opponentName?: string | null;
  homeAway?: string | null;
  kickoffDateTime?: string | null;
};

/** Media Wrapper — one asset with per-channel and per-aspect-ratio metadata. */
export type MediaWrapperFragment = {
  __typename: 'MediaWrapper';
  sys: { id: string };
  internalName?: string | null;
  asset?: { url?: string; width?: number; height?: number } | null;
  channels?: string[] | null;
  aspectRatios?: string[] | null;
};

/** Banner block — web + mobile app surfaces. */
export type BannerFragment = BlockData & {
  __typename: 'Banner';
  internalName?: string | null;
  headlineRt?: { json: Record<string, unknown> } | null;
  subheadlineRt?: { json: Record<string, unknown> } | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  variant?: string | null;
  colorVariant?: 'light' | 'dark' | 'alt' | 'primary' | 'secondary' | null;
  contentType?: 'internal' | 'sponsored' | null;
  sectionStyle?: string | null;
  game?: GameFragment | null;
  media?: MediaWrapperFragment | null;
  ntExperiencesCollection?: { items: Array<NtExperienceFragment> } | null;
};

/** Social Post — multi-channel post with stacked live preview cards per selected channel. */
export type SocialPostFragment = BlockData & {
  __typename: 'SocialPost';
  internalName?: string | null;
  channels?: Array<'x' | 'instagram' | 'facebook'> | null;
  copy?: string | null;
  hashtags?: string[] | null;
  status?: string | null;
  game?: GameFragment | null;
  media?: MediaWrapperFragment | null;
};

/** Two Across — 2-column text + media section block with mediaPosition toggle. */
export type TwoAcrossFragment = BlockData & {
  __typename: 'TwoAcross';
  internalName?: string | null;
  eyebrowRt?: { json: Record<string, unknown> } | null;
  headingRt?: { json: Record<string, unknown> } | null;
  body?: { json: unknown } | null;
  media?: { url?: string } | null;
  mediaAltText?: string | null;
  mediaPosition?: 'left' | 'right' | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  sectionStyle?: string | null;
  colorVariant?: 'light' | 'dark' | 'primary' | 'secondary' | 'alt' | null;
};

/** CtaSection — full-width call-to-action block with colorVariant, optional background image, and dual CTAs. */
export type CtaSectionFragment = BlockData & {
  __typename: 'CtaSection';
  internalName?: string | null;
  headlineRt?: { json: Record<string, unknown> } | null;
  subheadlineRt?: { json: Record<string, unknown> } | null;
  ctaPrimaryLabelRt?: { json: Record<string, unknown> } | null;
  ctaPrimaryUrl?: string | null;
  /** Page reference for primary CTA — takes precedence over ctaPrimaryUrl when present. */
  primaryCtaPage?: { slug?: string | null } | null;
  ctaSecondaryLabelRt?: { json: Record<string, unknown> } | null;
  ctaSecondaryUrl?: string | null;
  /** Page reference for secondary CTA — takes precedence over ctaSecondaryUrl when present. */
  secondaryCtaPage?: { slug?: string | null } | null;
  colorVariant?:
    | 'light'
    | 'dark'
    | 'alt'
    | 'primary'
    | 'secondary'
    | 'image'
    | null;
  backgroundImage?: {
    url?: string;
    width?: number;
    height?: number;
    description?: string;
  } | null;
  /** When true, renders a radial dot pattern overlay over the section background. */
  showDottedPattern?: boolean | null;
  sectionStyle?: string | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** Blog Posts Section — curated list of blog posts embeddable on any page. */
export type BlogPostsSectionFragment = BlockData & {
  __typename: 'BlogPostsSection';
  internalName?: string | null;
  title?: string | null;
  description?: string | null;
  limit?: number | null;
  postsCollection?: {
    items: Array<BlogPostFragment>;
  } | null;
};

/** Pricing Plan Feature — a single feature line item on a plan card. */
export type PricingPlanFeatureFragment = {
  __typename: 'PricingPlanFeature';
  sys: { id: string };
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
};

/** Pricing Plan — a single tier card within a Pricing block. */
export type PricingPlanFragment = {
  __typename: 'PricingPlan';
  sys: { id: string };
  internalName?: string | null;
  name?: string | null;
  blurb?: { json: Record<string, unknown> } | null;
  monthlyPrice?: string | null;
  annualPrice?: string | null;
  perUnitMonthly?: string | null;
  perUnitAnnual?: string | null;
  badge?: string | null;
  colorVariant?: string | null;
  ctaLabel?: { json: Record<string, unknown> } | null;
  ctaUrl?: string | null;
  featuresCollection?: { items: PricingPlanFeatureFragment[] } | null;
};

/** Pricing section — toggle + plan cards. */
export type PricingFragment = BlockData & {
  __typename: 'Pricing';
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  showToggle?: boolean | null;
  colorVariant?: 'light' | 'dark' | 'accent' | null;
  plansCollection?: { items: PricingPlanFragment[] } | null;
};

/** Icon Grid Item — a single icon + text card. */
export type IconGridItemFragment = {
  __typename: 'IconGridItem';
  sys: { id: string };
  internalName?: string | null;
  icon?: { url?: string } | null;
  animationKey?: string | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
};

/** Icon Grid — bordered card or borderless icon-above-text grid. */
export type IconGridFragment = BlockData & {
  __typename: 'IconGrid';
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  style?: 'card' | 'borderless' | null;
  columns?: number | null;
  colorVariant?: 'light' | 'dark' | 'accent' | null;
  itemsCollection?: { items: IconGridItemFragment[] } | null;
};

/** Feature Showcase Item — 1/3 text + 2/3 image. */
export type FeatureShowcaseItemFragment = {
  __typename: 'FeatureShowcaseItem';
  sys: { id: string };
  internalName?: string | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  media?: { url?: string } | null;
};

/** Feature Showcase — stacked 2-col showcase sections. */
export type FeatureShowcaseFragment = BlockData & {
  __typename: 'FeatureShowcase';
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  colorVariant?: 'light' | 'dark' | 'accent' | null;
  itemsCollection?: { items: FeatureShowcaseItemFragment[] } | null;
};

/** Media Card — large image area card with imageFit option. */
export type MediaCardFragment = {
  __typename: 'MediaCard';
  sys: { id: string };
  internalName?: string | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  media?: { url?: string } | null;
  imageFit?: 'contain' | 'cover' | null;
};

/** Media Card Grid — grid of media cards. */
export type MediaCardGridFragment = BlockData & {
  __typename: 'MediaCardGrid';
  internalName?: string | null;
  label?: { json: Record<string, unknown> } | null;
  title?: { json: Record<string, unknown> } | null;
  description?: { json: Record<string, unknown> } | null;
  columns?: number | null;
  colorVariant?: 'light' | 'dark' | 'accent' | null;
  itemsCollection?: { items: MediaCardFragment[] } | null;
};

export type PersonalizedBlockData = BlockData & {
  ntExperiencesCollection?: { items: Array<NtExperienceFragment> };
};

export type InheritedProps = Record<string, unknown>;

export type BlockProps<
  T extends BlockData = BlockData,
  P extends InheritedProps = InheritedProps,
> = {
  data: T;
  className?: string;
} & P;

type GetComponent<
  T extends BlockData,
  P extends InheritedProps = InheritedProps,
> = () => React.ComponentType<BlockProps<T, P>>;

export type BlockConfig<
  T extends BlockData,
  P extends InheritedProps = InheritedProps,
> = {
  typename: T['__typename'];
  layouts: Partial<Record<LayoutType, GetComponent<T, P>>> & {
    default: GetComponent<T, P>;
  };
};

export interface BlockRendererDefaultProps {
  data?: PersonalizedBlockData | BlockData | null;
  layoutType?: LayoutType;
}
