import type {
  BannerFragment,
  BlockConfig,
  BlockData,
  BlogPostsSectionFragment,
  DataVizFragment,
  FaqFragment,
  FeaturesFragment,
  HeroFragment,
  TabbedContentFragment,
  TwoAcrossFragment,
} from '@/block-renderer/types';
import { Banner } from '@/cms-components/banner';
import { BlogPostsSection } from '@/cms-components/blog-posts-section';
import { DataViz } from '@/cms-components/data-viz';
import { Faq } from '@/cms-components/faq';
import { Features } from '@/cms-components/features';
import { Hero } from '@/cms-components/hero';
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

export const blockConfigs: BlockConfig<BlockData>[] = [
  heroConfig as BlockConfig<BlockData>,
  faqConfig as BlockConfig<BlockData>,
  tabbedContentConfig as BlockConfig<BlockData>,
  featuresConfig as BlockConfig<BlockData>,
  dataVizConfig as BlockConfig<BlockData>,
  bannerConfig as BlockConfig<BlockData>,
  blogPostsSectionConfig as BlockConfig<BlockData>,
  twoAcrossConfig as BlockConfig<BlockData>,
];
