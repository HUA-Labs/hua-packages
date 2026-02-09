/**
 * @hua-labs/hua/framework - BrandedCard
 * 
 * Card 컴포넌트에 branding을 자동으로 적용하는 wrapper
 * Wrapper that automatically applies branding to Card component
 * 
 * CSS 변수를 사용하여 Tailwind의 최적화를 활용합니다.
 * Uses CSS variables to leverage Tailwind's optimization.
 */

'use client';

import React from 'react';
import { Card, merge, type CardProps } from '@hua-labs/ui';
import { useBranding } from '../branding/context';

/**
 * BrandedCard Component
 * 
 * Card 컴포넌트에 branding 설정을 자동으로 적용합니다.
 * Automatically applies branding configuration to Card component.
 * 
 * **자동 적용되는 branding**:
 * - Accent 색상: `variant="outline"`일 때 `border-[var(--color-accent)]` 사용
 * - Primary 색상: `variant="default"`일 때 `bg-[var(--color-primary)]/5` 사용
 * 
 * **Auto-applied branding**:
 * - Accent color: Uses `border-[var(--color-accent)]` when `variant="outline"`
 * - Primary color: Uses `bg-[var(--color-primary)]/5` when `variant="default"`
 * 
 * **CSS 변수 방식의 장점**:
 * - Tailwind의 JIT 컴파일러 최적화 활용
 * - 인라인 스타일 없이 깔끔한 코드
 * - 런타임에 동적으로 색상 변경 가능
 * 
 * **Advantages of CSS variables**:
 * - Leverages Tailwind's JIT compiler optimization
 * - Clean code without inline styles
 * - Dynamic color changes at runtime
 * 
 * @example
 * ```tsx
 * // branding 설정이 있으면 자동으로 색상 적용
 * // Automatically applies colors if branding is configured
 * <BrandedCard variant="outline">
 *   <CardContent>내용</CardContent>
 * </BrandedCard>
 * 
 * // branding이 없으면 기본 Card와 동일하게 동작
 * // Works same as default Card if branding is not configured
 * <BrandedCard variant="elevated">
 *   <CardContent>내용</CardContent>
 * </BrandedCard>
 * ```
 */
export const BrandedCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const branding = useBranding();

    // Branding 색상이 있으면 Tailwind arbitrary values 사용
    // Use Tailwind arbitrary values if branding colors exist
    let brandingClasses = '';

    if (branding?.colors) {
      if (variant === 'outline' && branding.colors.accent) {
        // Accent 색상을 테두리로 사용
        // Use accent color as border
        brandingClasses = 'border-[var(--color-accent)]';
      } else if (variant === 'default' && branding.colors.primary) {
        // Primary 색상의 약간의 tint를 배경에 적용
        // Apply slight tint of primary color to background
        brandingClasses = 'bg-[var(--color-primary)]/5';
      }
    }

    return (
      <Card
        ref={ref}
        variant={variant}
        className={merge(brandingClasses, className)}
        {...props}
      />
    );
  }
);

BrandedCard.displayName = 'BrandedCard';
