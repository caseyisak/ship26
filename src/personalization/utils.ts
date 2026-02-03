import type { BlockData, PersonalizedBlockData } from '@/block-renderer/types';

export function isPersonalized(
  data: BlockData | PersonalizedBlockData | null,
): boolean {
  void data;
  return false;
}
