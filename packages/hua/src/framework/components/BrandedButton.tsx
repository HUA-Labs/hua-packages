/**
 * @hua-labs/hua/framework - BrandedButton
 * 
 * Button 컴포넌트에 branding을 자동으로 적용하는 wrapper
 * Wrapper that automatically applies branding to Button component
 * 
 * CSS 변수를 사용하여 Tailwind의 최적화를 활용합니다.
 * Uses CSS variables to leverage Tailwind's optimization.
 */

'use client';

import * as React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { Button, merge } from '@hua-labs/ui';
import { useBranding } from '../branding/context';

/**
 * BrandedButton Component
 * 
 * Button 컴포넌트에 branding 설정을 자동으로 적용합니다.
 * Automatically applies branding configuration to Button component.
 * 
 * **자동 적용되는 branding**:
 * - Primary 색상: `variant="default"`일 때 `bg-[var(--color-primary)]` 사용
 * - Secondary 색상: `variant="secondary"`일 때 `bg-[var(--color-secondary)]` 사용
 * - Accent 색상: `variant="outline"`일 때 `border-[var(--color-accent)]` 사용
 * 
 * **Auto-applied branding**:
 * - Primary color: Uses `bg-[var(--color-primary)]` when `variant="default"`
 * - Secondary color: Uses `bg-[var(--color-secondary)]` when `variant="secondary"`
 * - Accent color: Uses `border-[var(--color-accent)]` when `variant="outline"`
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
 * // branding 설정이 있으면 자동으로 primary 색상 적용
 * // Automatically applies primary color if branding is configured
 * <BrandedButton variant="default">저장</BrandedButton>
 * 
 * // branding이 없으면 기본 Button과 동일하게 동작
 * // Works same as default Button if branding is not configured
 * <BrandedButton variant="outline">취소</BrandedButton>
 * ```
 */
type BrandedButtonProps = ComponentPropsWithoutRef<typeof Button>;

export const BrandedButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BrandedButtonProps
>((props: BrandedButtonProps, ref: React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>) => {
  const { variant = 'default', className, ...restProps } = props;
  const branding = useBranding();

  // Branding 색상이 있으면 Tailwind arbitrary values 사용
  // Use Tailwind arbitrary values if branding colors exist
  let brandingClasses = '';

  if (branding?.colors) {
    if (variant === 'default' && branding.colors.primary) {
      // Primary 색상을 배경으로 사용
      // Use primary color as background
      brandingClasses = 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:opacity-90';
    } else if (variant === 'secondary' && branding.colors.secondary) {
      // Secondary 색상을 배경으로 사용
      // Use secondary color as background
      brandingClasses = 'bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] hover:opacity-90';
    } else if (variant === 'outline' && branding.colors.accent) {
      // Accent 색상을 테두리와 텍스트로 사용
      // Use accent color for border and text
      brandingClasses = 'border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent hover:bg-[var(--color-accent)]/10';
    }
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      className={merge(brandingClasses, className)}
      {...restProps}
    />
  );
});

BrandedButton.displayName = 'BrandedButton';
