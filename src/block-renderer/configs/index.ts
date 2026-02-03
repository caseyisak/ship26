import type {
  BlockConfig,
  BlockData,
  HeroFragment,
} from '@/block-renderer/types';
import { Hero } from '@/cms-components/hero';

const heroConfig: BlockConfig<HeroFragment> = {
  typename: 'Hero',
  layouts: {
    default: () => Hero,
  },
};

export const blockConfigs: BlockConfig<BlockData>[] = [
  heroConfig as BlockConfig<BlockData>,
];
