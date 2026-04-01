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
export type NtVariantItem = { __typename?: string; sys: { id: string } } & Record<string, unknown>;

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

/** Hero section (matches Contentful Hero content type: internalName, headline, subheadline, background, media, ctaText, ctaUrl, sectionStyle, variant, nt_experiences). */
export type HeroFragment = BlockData & {
  __typename: 'Hero';
  internalName?: string | null;
  headline?: string | null;
  subheadline?: string | null;
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

/** FaqItem (matches Contentful FaqItem content type: internalName, question, answer). */
export type FaqItemFragment = {
  __typename: 'FaqItem';
  sys: { id: string };
  internalName?: string | null;
  question?: string | null;
  answer?: string | null;
};

/** FAQ section (matches Contentful FAQ content type: internalName, title, description, items). */
export type FaqFragment = BlockData & {
  __typename: 'Faq';
  internalName?: string | null;
  title?: string | null;
  description?: string | null;
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

/** TabbedContent section (matches Contentful TabbedContent content type: internalName, tagline, title, description, itemsCollection, ntExperiences). */
export type TabbedContentFragment = BlockData & {
  __typename: 'Tabbedcontent';
  internalName?: string | null;
  tagline?: string | null;
  title?: string | null;
  description?: string | null;
  itemsCollection?: { items: TabbedContentItemFragment[] } | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** Feature Item (matches Contentful Feature Item content type: title, description, media, animationKey). */
export type FeatureItemFragment = {
  __typename: 'FeatureItem';
  sys: { id: string };
  title?: string | null;
  description?: string | null;
  image?: { url?: string } | null; // Mapped field name (legacy)
  media?: { url?: string } | null; // Raw Contentful field name
  animationKey?: string | null;
};

/** Features section (matches Contentful Features content type: internalName, label, title, description, items, ntExperiences). */
export type FeaturesFragment = BlockData & {
  __typename: 'Features';
  internalName?: string | null;
  label?: string | null;
  title?: string | null;
  description?: string | null;
  itemsCollection?: { items: FeatureItemFragment[] } | null;
  ntExperiencesCollection?: {
    items: Array<NtExperienceFragment>;
  } | null;
};

/** DataViz section (matches Contentful DataViz content type: internalName, title, description, chartType, csvData, colorScheme, showLegend). */
export type DataVizFragment = BlockData & {
  __typename: 'DataViz';
  internalName?: string | null;
  title?: string | null;
  description?: string | null;
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

/** BlogPost (matches Contentful BlogPost content type: title, slug, excerpt, publishDate, tags, heroImage, body, author). */
export type BlogPostFragment = BlockData & {
  __typename: 'BlogPost';
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  publishDate?: string | null;
  tags?: string[] | null;
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

/** Banner block — gameday banner rendered on web and mock mobile app. */
export type BannerFragment = BlockData & {
  __typename: 'Banner';
  internalName?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  copy?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  game?: GameFragment | null;
  media?: MediaWrapperFragment | null;
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
