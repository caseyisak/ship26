import type { LayoutType } from '@/block-renderer/layouts';

/** Minimal block data; no GraphQL codegen dependency. */
export type BlockData = {
  __typename: string;
  sys: { id: string; spaceId?: string };
  _serverError?: string;
};

/** Hero section (matches Contentful Hero content type: internalName, headline, subheadline, media, ctaText, ctaUrl, sectionStyle, variant, nt_experiences). */
export type HeroFragment = BlockData & {
  __typename: 'Hero';
  internalName?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  variant?: string | null;
  sectionStyle?: string | null;
  image?: { url?: string } | null;
  ntExperiencesCollection?: {
    items: Array<{ __typename?: string; sys?: { id: string } }>;
  };
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
};

export type PersonalizedBlockData = BlockData & {
  ntExperiencesCollection?: { items: unknown[] };
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
