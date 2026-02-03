import type { LayoutType } from '@/block-renderer/layouts';

/** Minimal block data for Milestone 1; no GraphQL dependency. */
export type BlockData = {
  __typename: string;
  sys: { id: string; spaceId?: string };
  _serverError?: string;
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
