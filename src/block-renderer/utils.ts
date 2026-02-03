import { blockConfigs } from './configs';
import type { LayoutType } from './layouts';
import type {
  BlockConfig,
  BlockData,
  BlockProps,
  BlockRendererDefaultProps,
  PersonalizedBlockData,
} from './types';

export function getComponentConfig<Props extends BlockRendererDefaultProps>(
  data: BlockData | PersonalizedBlockData,
): BlockConfig<NonNullable<Props['data']>> | undefined {
  const found = blockConfigs.find(
    (config) => config.typename === data.__typename,
  );
  return found ? (found as BlockConfig<NonNullable<Props['data']>>) : undefined;
}

export function getComponent<Props extends BlockRendererDefaultProps>({
  componentConfig,
  layoutType,
}: {
  componentConfig?: BlockConfig<NonNullable<Props['data']>>;
  layoutType: LayoutType;
}):
  | React.ComponentType<BlockProps<NonNullable<Props['data']>> & object>
  | undefined {
  if (!componentConfig) return undefined;
  const componentGetter = componentConfig.layouts[layoutType];
  return componentGetter?.();
}

export function isMissingData(data: BlockData): boolean {
  return Object.keys(data).every(
    (key) => key === '__typename' || key === 'sys',
  );
}

export function renderTypeName(
  data?: PersonalizedBlockData | BlockData | null,
): string {
  return data?.__typename ?? 'Unknown Type';
}

export function renderEntryId(
  data?: PersonalizedBlockData | BlockData | null,
): string {
  return data?.sys?.id ?? 'Unknown ID';
}
