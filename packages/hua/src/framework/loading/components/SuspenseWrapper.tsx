/**
 * @hua-labs/hua/framework - SuspenseWrapper
 * 
 * React Suspense를 더 쉽게 사용할 수 있게 해주는 컴포넌트
 * Component that makes React Suspense easier to use
 */

'use client';

import React, { Suspense, useMemo, type ReactNode } from 'react';
import { Skeleton } from '@hua-labs/ui';
import { SkeletonGroup } from './SkeletonGroup';

/**
 * SuspenseWrapper 컴포넌트 props
 */
export interface SuspenseWrapperProps {
  /**
   * Suspense로 감쌀 자식 요소
   * Children to wrap with Suspense
   */
  children: ReactNode;
  
  /**
   * 로딩 중 표시할 fallback
   * Fallback to show while loading
   * 
   * @default <SkeletonGroup>...</SkeletonGroup>
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
 * SuspenseWrapper 컴포넌트
 * 
 * React Suspense를 더 쉽게 사용할 수 있게 해줍니다.
 * 기본적으로 Skeleton fallback을 제공합니다.
 * 
 * Makes React Suspense easier to use.
 * Provides Skeleton fallback by default.
 * 
 * @example
 * ```tsx
 * // 기본 사용 (자동 Skeleton fallback)
 * <SuspenseWrapper>
 *   <AsyncComponent />
 * </SuspenseWrapper>
 * 
 * // 커스텀 fallback
 * <SuspenseWrapper fallback={<Spinner />}>
 *   <AsyncComponent />
 * </SuspenseWrapper>
 * ```
 * 
 * @param props - SuspenseWrapper props
 * @returns SuspenseWrapper 컴포넌트
 */
export function SuspenseWrapper({
  children,
  fallback,
  useDefaultFallback = true,
}: SuspenseWrapperProps): React.JSX.Element {
  const defaultFallback = useMemo(
    () =>
      useDefaultFallback ? (
        <SkeletonGroup>
          <Skeleton width="60%" height={32} />
          <Skeleton width="80%" />
          <Skeleton width="70%" />
        </SkeletonGroup>
      ) : null,
    [useDefaultFallback]
  );

  return (
    <Suspense fallback={fallback ?? defaultFallback}>
      {children}
    </Suspense>
  );
}
