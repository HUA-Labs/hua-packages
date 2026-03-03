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
import { Button } from '@hua-labs/ui';
import { useBranding } from '../branding/context';

/**
 * BrandedButton Component
 *
 * Button 컴포넌트에 branding 설정을 자동으로 적용합니다.
 * Automatically applies branding configuration to Button component.
 *
 * Branding 색상을 CSS 변수를 통해 inline style로 주입합니다.
 * Injects branding colors via CSS variables as inline styles.
 *
 * @example
 * ```tsx
 * <BrandedButton variant="default">저장</BrandedButton>
 * <BrandedButton variant="outline">취소</BrandedButton>
 * ```
 */
type BrandedButtonProps = ComponentPropsWithoutRef<typeof Button>;

export const BrandedButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BrandedButtonProps
>((props: BrandedButtonProps, ref: React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>) => {
  const { variant = 'default', style, ...restProps } = props;
  const branding = useBranding();

  let brandingStyle: React.CSSProperties | undefined;

  if (branding?.colors) {
    if (variant === 'default' && branding.colors.primary) {
      brandingStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        borderColor: 'var(--color-primary)',
      };
    } else if (variant === 'secondary' && branding.colors.secondary) {
      brandingStyle = {
        backgroundColor: 'var(--color-secondary)',
        color: 'white',
        borderColor: 'var(--color-secondary)',
      };
    } else if (variant === 'outline' && branding.colors.accent) {
      brandingStyle = {
        borderColor: 'var(--color-accent)',
        color: 'var(--color-accent)',
        backgroundColor: 'transparent',
      };
    }
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      style={brandingStyle ? { ...brandingStyle, ...style } : style}
      {...restProps}
    />
  );
});

BrandedButton.displayName = 'BrandedButton';
