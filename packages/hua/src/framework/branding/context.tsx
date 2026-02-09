/**
 * @hua-labs/hua/framework - Branding Context
 * 
 * 브랜딩 설정을 컴포넌트에서 사용하기 위한 Context
 */

'use client';

import React, { createContext, useContext } from 'react';
import type { HuaConfig } from '../types';
import { generateCSSVariables } from './css-vars';

/**
 * Branding context value
 */
interface BrandingContextValue {
  branding: NonNullable<HuaConfig['branding']> | null;
}

/**
 * Branding context
 */
const BrandingContext = createContext<BrandingContextValue>({
  branding: null,
});

/**
 * BrandingProvider component
 * 
 * 브랜딩 설정을 제공하고 CSS 변수를 자동으로 주입하는 Provider입니다.
 * Provides branding configuration and automatically injects CSS variables.
 * 
 * @example
 * ```tsx
 * <BrandingProvider branding={config.branding}>
 *   {children}
 * </BrandingProvider>
 * ```
 */
export function BrandingProvider({
  branding,
  children,
}: {
  branding: NonNullable<HuaConfig['branding']> | null;
  children: React.ReactNode;
}) {
  // SSR 시 초기 CSS 변수 주입 (FOUC 방지)
  // Inject initial CSS variables on SSR (prevent FOUC)
  // Next.js의 suppressHydrationWarning을 사용하여 클라이언트 하이드레이션 시 경고 방지
  // Use Next.js suppressHydrationWarning to prevent warnings during client hydration
  const cssVarsString = React.useMemo(() => {
    if (!branding) return '';
    return generateCSSVariables(branding);
  }, [branding]);

  // 클라이언트 사이드에서 CSS 변수 동적 업데이트
  // Dynamically update CSS variables on client side
  React.useEffect(() => {
    if (!branding || !cssVarsString) return;

    // style 태그 생성 또는 업데이트
    // Create or update style tag
    const styleId = 'hua-branding-vars';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = cssVarsString;

    // Cleanup
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [branding, cssVarsString]);

  return (
    <BrandingContext.Provider value={{ branding }}>
      {/* SSR 시 초기 CSS 변수 주입 (FOUC 방지) */}
      {/* Inject initial CSS variables on SSR (prevent FOUC) */}
      {cssVarsString && (
        <style
          id="hua-branding-vars"
          dangerouslySetInnerHTML={{ __html: cssVarsString }}
          suppressHydrationWarning
        />
      )}
      {children}
    </BrandingContext.Provider>
  );
}

/**
 * useBranding hook
 * 
 * 브랜딩 설정을 가져오는 훅입니다.
 * 
 * @returns Branding configuration or null
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const branding = useBranding();
 *   const primaryColor = branding?.colors?.primary || 'blue';
 *   return <div style={{ color: primaryColor }}>Hello</div>;
 * }
 * ```
 */
export function useBranding(): NonNullable<HuaConfig['branding']> | null {
  const { branding } = useContext(BrandingContext);
  return branding;
}

/**
 * Get color from branding
 * 
 * 브랜딩에서 색상을 가져옵니다. 없으면 기본값을 반환합니다.
 * 
 * @param colorKey - Color key (primary, secondary, etc.)
 * @param defaultValue - Default color if not found
 * @returns Color value
 */
export function useBrandingColor(
  colorKey: keyof NonNullable<NonNullable<HuaConfig['branding']>['colors']>,
  defaultValue?: string
): string | undefined {
  const branding = useBranding();
  return branding?.colors?.[colorKey] || defaultValue;
}
