import type {
  BlockConfig,
  BlockData,
  FaqFragment,
  HeroFragment,
  TabbedContentFragment,
} from '@/block-renderer/types';
import { Faq } from '@/cms-components/faq';
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

export const blockConfigs: BlockConfig<BlockData>[] = [
  heroConfig as BlockConfig<BlockData>,
  faqConfig as BlockConfig<BlockData>,
  tabbedContentConfig as BlockConfig<BlockData>,
];
