/**
 * @hua-labs/hua/framework - Loading State
 * 
 * 로딩 상태 최적화 도구 모음
 * Loading state optimization tools
 */

export { useDelayedLoading } from './hooks/useDelayedLoading';
export { useLoadingState } from './hooks/useLoadingState';
export { SkeletonGroup } from './components/SkeletonGroup';
export { SuspenseWrapper } from './components/SuspenseWrapper';
export { withSuspense } from './hoc/withSuspense';

// Skeleton은 @hua-labs/ui에서 re-export
export { Skeleton } from '@hua-labs/ui';

export type { DelayedLoadingOptions } from './hooks/useDelayedLoading';
export type { SkeletonGroupProps } from './components/SkeletonGroup';
export type { SuspenseWrapperProps } from './components/SuspenseWrapper';
