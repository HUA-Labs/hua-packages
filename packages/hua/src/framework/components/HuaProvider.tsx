/**
 * @hua-labs/hua/framework - HuaProvider
 *
 * Root layout wrapper that automatically sets up all providers
 */

'use client';

import React from 'react';
import type { HuaProviderProps } from '../types';
import { UnifiedProviders } from './Providers';
import { useTranslation } from '@hua-labs/i18n-core';

/**
 * HUA UI 기본 테마 색상 (Teal 브랜드)
 */
const DEFAULT_THEME_COLORS = {
  primary: 'hsl(166 78% 30%)',
  primaryForeground: 'hsl(0 0% 100%)',
  secondary: 'hsl(210 15% 94%)',
  secondaryForeground: 'hsl(210 10% 20%)',
  destructive: 'hsl(0 84% 60%)',
  destructiveForeground: 'hsl(0 0% 98%)',
  muted: 'hsl(210 15% 94%)',
  mutedForeground: 'hsl(210 10% 40%)',
  accent: 'hsl(166 60% 92%)',
  accentForeground: 'hsl(166 78% 25%)',
  card: 'hsl(0 0% 100%)',
  cardForeground: 'hsl(210 10% 10%)',
  popover: 'hsl(0 0% 100%)',
  popoverForeground: 'hsl(210 10% 10%)',
  background: 'hsl(210 20% 98%)',
  foreground: 'hsl(210 10% 10%)',
  border: 'hsl(210 15% 88%)',
  input: 'hsl(210 15% 88%)',
  ring: 'hsl(166 78% 30%)',
};

const DEFAULT_DARK_COLORS = {
  primary: 'hsl(166 72% 45%)',
  primaryForeground: 'hsl(210 15% 6%)',
  secondary: 'hsl(210 15% 15%)',
  secondaryForeground: 'hsl(210 10% 90%)',
  destructive: 'hsl(0 62% 50%)',
  destructiveForeground: 'hsl(0 0% 98%)',
  muted: 'hsl(210 15% 15%)',
  mutedForeground: 'hsl(210 10% 60%)',
  accent: 'hsl(166 50% 20%)',
  accentForeground: 'hsl(166 72% 60%)',
  card: 'hsl(210 15% 9%)',
  cardForeground: 'hsl(210 10% 95%)',
  popover: 'hsl(210 15% 9%)',
  popoverForeground: 'hsl(210 10% 95%)',
  background: 'hsl(210 15% 6%)',
  foreground: 'hsl(210 10% 95%)',
  border: 'hsl(210 15% 18%)',
  input: 'hsl(210 15% 18%)',
  ring: 'hsl(166 72% 45%)',
};

/**
 * Tailwind v4 @theme CSS 생성
 *
 * branding.colors에서 primary/secondary/accent가 있으면 해당 색상 사용,
 * 없으면 HUA UI 기본 Teal 테마 사용
 */
function generateThemeCSS(branding?: { colors?: { primary?: string; secondary?: string; accent?: string } }): string {
  const colors = { ...DEFAULT_THEME_COLORS };
  const darkColors = { ...DEFAULT_DARK_COLORS };

  // branding.colors가 있으면 primary/secondary/accent 오버라이드
  if (branding?.colors) {
    if (branding.colors.primary) {
      colors.primary = branding.colors.primary;
      colors.ring = branding.colors.primary;
      darkColors.primary = branding.colors.primary;
      darkColors.ring = branding.colors.primary;
    }
    if (branding.colors.secondary) {
      colors.secondary = branding.colors.secondary;
      darkColors.secondary = branding.colors.secondary;
    }
    if (branding.colors.accent) {
      colors.accent = branding.colors.accent;
      darkColors.accent = branding.colors.accent;
    }
  }

  return `
:root {
  --color-primary: ${colors.primary};
  --color-primary-foreground: ${colors.primaryForeground};
  --color-secondary: ${colors.secondary};
  --color-secondary-foreground: ${colors.secondaryForeground};
  --color-destructive: ${colors.destructive};
  --color-destructive-foreground: ${colors.destructiveForeground};
  --color-muted: ${colors.muted};
  --color-muted-foreground: ${colors.mutedForeground};
  --color-accent: ${colors.accent};
  --color-accent-foreground: ${colors.accentForeground};
  --color-card: ${colors.card};
  --color-card-foreground: ${colors.cardForeground};
  --color-popover: ${colors.popover};
  --color-popover-foreground: ${colors.popoverForeground};
  --color-background: ${colors.background};
  --color-foreground: ${colors.foreground};
  --color-border: ${colors.border};
  --color-input: ${colors.input};
  --color-ring: ${colors.ring};
}

.dark {
  --color-primary: ${darkColors.primary};
  --color-primary-foreground: ${darkColors.primaryForeground};
  --color-secondary: ${darkColors.secondary};
  --color-secondary-foreground: ${darkColors.secondaryForeground};
  --color-destructive: ${darkColors.destructive};
  --color-destructive-foreground: ${darkColors.destructiveForeground};
  --color-muted: ${darkColors.muted};
  --color-muted-foreground: ${darkColors.mutedForeground};
  --color-accent: ${darkColors.accent};
  --color-accent-foreground: ${darkColors.accentForeground};
  --color-card: ${darkColors.card};
  --color-card-foreground: ${darkColors.cardForeground};
  --color-popover: ${darkColors.popover};
  --color-popover-foreground: ${darkColors.popoverForeground};
  --color-background: ${darkColors.background};
  --color-foreground: ${darkColors.foreground};
  --color-border: ${darkColors.border};
  --color-input: ${darkColors.input};
  --color-ring: ${darkColors.ring};
}
`.trim();
}

/**
 * Theme CSS Injector - Tailwind v4 @theme 대신 런타임에 CSS 변수 주입
 */
function ThemeInjector({ branding }: { branding?: { colors?: { primary?: string; secondary?: string; accent?: string } } }) {
  const cssContent = React.useMemo(() => generateThemeCSS(branding), [branding]);

  return (
    <style
      dangerouslySetInnerHTML={{ __html: cssContent }}
      data-hua-theme="injected"
    />
  );
}

/**
 * Language transition wrapper - adds smooth fade during language change
 */
function LanguageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useTranslation();

  return (
    <div
      style={{
        opacity: isLoading ? 0.4 : 1,
        transition: 'opacity 300ms ease-in-out',
      }}
    >
      {children}
    </div>
  );
}

/**
 * HuaProvider Component
 *
 * Automatically configures i18n, motion, and state providers based on configuration.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { HuaProvider } from '@hua-labs/hua/framework';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="ko">
 *       <body>
 *         <HuaProvider>{children}</HuaProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function HuaProvider({ children, config }: HuaProviderProps) {
  return (
    <UnifiedProviders config={config}>
      <ThemeInjector branding={config?.branding} />
      <LanguageTransitionWrapper>{children}</LanguageTransitionWrapper>
    </UnifiedProviders>
  );
}
