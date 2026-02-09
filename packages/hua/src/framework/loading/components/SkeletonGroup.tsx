/**
 * @hua-labs/hua/framework - SkeletonGroup
 * 
 * 여러 Skeleton을 그룹으로 묶는 컴포넌트
 * Component for grouping multiple Skeletons
 */

'use client';

import React from 'react';
import { Skeleton } from '@hua-labs/ui';

/**
 * SkeletonGroup 컴포넌트 props
 */
export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 자식 요소들
   * Children elements
   */
  children?: React.ReactNode;
  
  /**
   * 간격 크기
   * Spacing size
   * 
   * @default "md"
   */
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * SkeletonGroup 컴포넌트
 * 
 * 여러 Skeleton을 일관된 간격으로 그룹화합니다.
 * Groups multiple Skeletons with consistent spacing.
 * 
 * @example
 * ```tsx
 * <SkeletonGroup>
 *   <Skeleton width="60%" height={32} />
 *   <Skeleton width="80%" />
 *   <Skeleton width="70%" />
 * </SkeletonGroup>
 * ```
 * 
 * @param props - SkeletonGroup props
 * @returns SkeletonGroup 컴포넌트
 */
export function SkeletonGroup({
  children,
  spacing = 'md',
  className,
  ...props
}: SkeletonGroupProps): React.JSX.Element {
  const spacingClasses = {
    sm: 'space-y-2', // 8px
    md: 'space-y-4', // 16px
    lg: 'space-y-6', // 24px
  };

  return (
    <div
      className={`${spacingClasses[spacing]} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
