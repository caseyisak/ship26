import type { BlockData, PersonalizedBlockData } from '../types';

export interface ErrorProps {
  data?: BlockData | PersonalizedBlockData | null;
  layoutType?: string;
  children?: React.ReactNode;
}
