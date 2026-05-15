import type {
  BannerFragment,
  BlockConfig,
  BlockData,
  BlockProps,
  BlogPostsSectionFragment,
  CardFragment,
  CardsWrapperFragment,
  CtaSectionFragment,
  DataVizFragment,
  DynamicListingFragment,
  FaqFragment,
  FeatureSectionFragment,
  FeatureShowcaseFragment,
  FeaturesFragment,
  FormFragment,
  HeroFragment,
  IconFeatureGridFragment,
  IconGridFragment,
  MediaCardGridFragment,
  NewsWrapperFragment,
  PricingFragment,
  ProductDetailPageFragment,
  TabbedContentFragment,
  TwoAcrossFragment,
} from '@/block-renderer/types';
import { CardBlock } from '@/block-renderer/configs/card-block';
import { DynamicListing } from '@/cms-components/dynamic-listing/dynamic-listing';
import { Pdp } from '@/cms-components/pdp/pdp';
import { Banner } from '@/cms-components/banner';
import { Form } from '@/cms-components/form';
import { FeatureSection } from '@/cms-components/feature-section';
import { BlogPostsSection } from '@/cms-components/blog-posts-section';
import { CardsWrapper } from '@/cms-components/cards-wrapper';
import { CtaSection } from '@/cms-components/cta-section';
import { DataViz } from '@/cms-components/data-viz';
import { Faq } from '@/cms-components/faq';
import { FeatureShowcase } from '@/cms-components/feature-showcase';
import { Features } from '@/cms-components/features';
import { Hero } from '@/cms-components/hero';
import { IconFeatureGrid } from '@/cms-components/icon-feature-grid';
import { IconGrid } from '@/cms-components/icon-grid';
import { MediaCardGrid } from '@/cms-components/media-card-grid';
import { NewsWrapper } from '@/cms-components/news-wrapper';
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

const newsWrapperConfig: BlockConfig<NewsWrapperFragment> = {
  typename: 'NewsWrapper',
  layouts: {
    default: () => NewsWrapper,
  },
};

const iconFeatureGridConfig: BlockConfig<IconFeatureGridFragment> = {
  typename: 'IconFeatureGrid',
  layouts: {
    default: () => IconFeatureGrid,
  },
};

const formConfig: BlockConfig<FormFragment> = {
  typename: 'Form',
  layouts: {
    default: () => Form,
  },
};

const pdpConfig: BlockConfig<ProductDetailPageFragment> = {
  typename: 'ProductDetailPage',
  layouts: {
    default: () => Pdp,
  },
};

const dynamicListingConfig: BlockConfig<DynamicListingFragment> = {
  typename: 'DynamicListing',
  layouts: {
    default: () => DynamicListing,
  },
};

const cardConfig: BlockConfig<CardFragment> = {
  typename: 'Card',
  layouts: {
    default: () => CardBlock,
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
  newsWrapperConfig as BlockConfig<BlockData>,
  iconFeatureGridConfig as BlockConfig<BlockData>,
  formConfig as BlockConfig<BlockData>,
  pdpConfig as BlockConfig<BlockData>,
  dynamicListingConfig as BlockConfig<BlockData>,
  cardConfig as BlockConfig<BlockData>,
];
