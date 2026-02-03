import { LayoutProps } from './types';

export const layoutTypes = ['default'] as const;
export type LayoutType = (typeof layoutTypes)[number];

const Identity = ({ children }: LayoutProps) => children;

export function getLayoutComponent(
  layoutType: LayoutType,
): React.ComponentType<LayoutProps> {
  void layoutType;
  return Identity;
}
