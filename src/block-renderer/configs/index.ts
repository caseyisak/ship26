import type {
  BlockConfig,
  BlockData,
  DataVizFragment,
  FaqFragment,
  FeaturesFragment,
  HeroFragment,
  TabbedContentFragment,
} from '@/block-renderer/types';
import { DataViz } from '@/cms-components/data-viz';
import { Faq } from '@/cms-components/faq';
import { Features } from '@/cms-components/features';
import { Hero } from '@/cms-components/hero';
import { TabbedContent } from '@/cms-components/tabbed-content';

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

export const blockConfigs: BlockConfig<BlockData>[] = [
  heroConfig as BlockConfig<BlockData>,
  faqConfig as BlockConfig<BlockData>,
  tabbedContentConfig as BlockConfig<BlockData>,
  featuresConfig as BlockConfig<BlockData>,
  dataVizConfig as BlockConfig<BlockData>,
];
