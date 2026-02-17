/**
 * @hua-labs/hua/framework - withSuspense
 * 
 * 컴포넌트를 Suspense로 감싸는 HOC
 * HOC that wraps a component with Suspense
 */

'use client';

import React, { Suspense, type ComponentType, type ReactNode } from 'react';
import { Skeleton } from '@hua-labs/ui';
import { SkeletonGroup } from '../components/SkeletonGroup';

/**
 * withSuspense 옵션
 */
export interface WithSuspenseOptions {
  /**
   * 로딩 중 표시할 fallback
   * Fallback to show while loading
   */
  fallback?: ReactNode;
  
  /**
   * 기본 Skeleton fallback 사용 여부
   * Whether to use default Skeleton fallback
   * 
   * @default true
   */
  useDefaultFallback?: boolean;
}

/**
 * withSuspense HOC
 * 
 * 컴포넌트를 Suspense로 감싸는 Higher-Order Component입니다.
 * 
 * Higher-Order Component that wraps a component with Suspense.
 * 
 * @example
 * ```tsx
 * const AsyncPosts = withSuspense(Posts, <Skeleton height={200} />);
 * 
 * function MyPage() {
 *   return <AsyncPosts />;
 * }
 * ```
 * 
 * @param Component - 감쌀 컴포넌트
 * @param options - 옵션 또는 fallback
 * @returns Suspense로 감싼 컴포넌트
 */
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  optionsOrFallback?: WithSuspenseOptions | ReactNode
): ComponentType<P> {
  let fallback: ReactNode | undefined;
  let useDefaultFallback = true;

  if (optionsOrFallback !== undefined) {
    if (React.isValidElement(optionsOrFallback) || typeof optionsOrFallback === 'string') {
      // fallback이 직접 전달된 경우
      fallback = optionsOrFallback;
      useDefaultFallback = false;
    } else {
      // 옵션 객체가 전달된 경우
      const options = optionsOrFallback as WithSuspenseOptions;
      fallback = options.fallback;
      useDefaultFallback = options.useDefaultFallback ?? true;
    }
  }

  const defaultFallback = useDefaultFallback ? (
    <SkeletonGroup>
      <Skeleton width="60%" height={32} />
      <Skeleton width="80%" />
      <Skeleton width="70%" />
    </SkeletonGroup>
  ) : null;

  const WrappedComponent = (props: P) => {
    return (
      <Suspense fallback={fallback ?? defaultFallback}>
        <Component {...props} />
      </Suspense>
    );
  };

  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
