import type {
  BannerFragment,
  BlockConfig,
  BlockData,
  BlogPostsSectionFragment,
  CardsWrapperFragment,
  CtaSectionFragment,
  DataVizFragment,
  FaqFragment,
  FeatureSectionFragment,
  FeatureShowcaseFragment,
  FeaturesFragment,
  HeroFragment,
  IconGridFragment,
  MediaCardGridFragment,
  PricingFragment,
  TabbedContentFragment,
  TwoAcrossFragment,
} from '@/block-renderer/types';
import { Banner } from '@/cms-components/banner';
import { FeatureSection } from '@/cms-components/feature-section';
import { BlogPostsSection } from '@/cms-components/blog-posts-section';
import { CardsWrapper } from '@/cms-components/cards-wrapper';
import { CtaSection } from '@/cms-components/cta-section';
import { DataViz } from '@/cms-components/data-viz';
import { Faq } from '@/cms-components/faq';
import { FeatureShowcase } from '@/cms-components/feature-showcase';
import { Features } from '@/cms-components/features';
import { Hero } from '@/cms-components/hero';
import { IconGrid } from '@/cms-components/icon-grid';
import { MediaCardGrid } from '@/cms-components/media-card-grid';
import { Pricing } from '@/cms-components/pricing';
import { TabbedContent } from '@/cms-components/tabbed-content';
import { TwoAcross } from '@/cms-components/two-across/two-across';

const heroConfig: BlockConfig<HeroFragment> = {
  typename: 'Hero',
  layouts: {
    default: () => Hero,
  },
};

const faqConfig: BlockConfig<FaqFragment> = {
  typename: 'Faq',
  layouts: {
    default: () => Faq,
  },
};

const tabbedContentConfig: BlockConfig<TabbedContentFragment> = {
  typename: 'Tabbedcontent',
  layouts: {
    default: () => TabbedContent,
  },
};

const featuresConfig: BlockConfig<FeaturesFragment> = {
  typename: 'Features',
  layouts: {
    default: () => Features,
  },
};

const cardsWrapperConfig: BlockConfig<CardsWrapperFragment> = {
  typename: 'CardsWrapper',
  layouts: {
    default: () => CardsWrapper,
  },
};

const dataVizConfig: BlockConfig<DataVizFragment> = {
  typename: 'DataViz',
  layouts: {
    default: () => DataViz,
  },
};

const bannerConfig: BlockConfig<BannerFragment> = {
  typename: 'Banner',
  layouts: {
    default: () => Banner,
  },
};

const blogPostsSectionConfig: BlockConfig<BlogPostsSectionFragment> = {
  typename: 'BlogPostsSection',
  layouts: {
    default: () => BlogPostsSection,
  },
};

const twoAcrossConfig: BlockConfig<TwoAcrossFragment> = {
  typename: 'TwoAcross',
  layouts: {
    default: () => TwoAcross,
  },
};

const ctaSectionConfig: BlockConfig<CtaSectionFragment> = {
  typename: 'CtaSection',
  layouts: {
    default: () => CtaSection,
  },
};

const pricingConfig: BlockConfig<PricingFragment> = {
  typename: 'Pricing',
  layouts: {
    default: () => Pricing,
  },
};

const iconGridConfig: BlockConfig<IconGridFragment> = {
  typename: 'IconGrid',
  layouts: {
    default: () => IconGrid,
  },
};

const featureShowcaseConfig: BlockConfig<FeatureShowcaseFragment> = {
  typename: 'FeatureShowcase',
  layouts: {
    default: () => FeatureShowcase,
  },
};

const mediaCardGridConfig: BlockConfig<MediaCardGridFragment> = {
  typename: 'MediaCardGrid',
  layouts: {
    default: () => MediaCardGrid,
  },
};

const featureSectionConfig: BlockConfig<FeatureSectionFragment> = {
  typename: 'FeatureSection',
  layouts: {
    default: () => FeatureSection,
  },
};

export const blockConfigs: BlockConfig<BlockData>[] = [
  heroConfig as BlockConfig<BlockData>,
  faqConfig as BlockConfig<BlockData>,
  tabbedContentConfig as BlockConfig<BlockData>,
  featuresConfig as BlockConfig<BlockData>,
  cardsWrapperConfig as BlockConfig<BlockData>,
  dataVizConfig as BlockConfig<BlockData>,
  bannerConfig as BlockConfig<BlockData>,
  blogPostsSectionConfig as BlockConfig<BlockData>,
  twoAcrossConfig as BlockConfig<BlockData>,
  ctaSectionConfig as BlockConfig<BlockData>,
  pricingConfig as BlockConfig<BlockData>,
  iconGridConfig as BlockConfig<BlockData>,
  featureShowcaseConfig as BlockConfig<BlockData>,
  mediaCardGridConfig as BlockConfig<BlockData>,
  featureSectionConfig as BlockConfig<BlockData>,
];
