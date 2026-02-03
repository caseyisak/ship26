import type {
  BlockConfig,
  BlockData,
  FaqFragment,
  HeroFragment,
} from '@/block-renderer/types';
import { Faq } from '@/cms-components/faq';
import { Hero } from '@/cms-components/hero';

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

export const blockConfigs: BlockConfig<BlockData>[] = [
  heroConfig as BlockConfig<BlockData>,
  faqConfig as BlockConfig<BlockData>,
];
