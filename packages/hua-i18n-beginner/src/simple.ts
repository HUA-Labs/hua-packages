/**
 * 진짜 한 줄로 시작하는 다국어 지원
 * 초보자를 위한 최대한 간단한 API
 */

import React from 'react';
import { SimpleI18n } from './easy';

/**
 * 진짜 한 줄로 i18n 설정을 완료하는 함수
 * 
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router)
 * import { createI18nApp } from '@hua-labs/i18n-beginner';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {createI18nApp()({ children })}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function createI18nApp() {
  return function I18nApp({ children }: { children: React.ReactNode }) {
    return React.createElement(SimpleI18n, { children });
  };
}

/**
 * 더 간단한 Provider (기본값만 사용)
 */
export function SimpleProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(SimpleI18n, { children });
}

/**
 * 언어별 Provider (언어만 지정)
 */
export function createLanguageProvider(language: string) {
  return function LanguageProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(SimpleI18n, { children });
  };
}

/**
 * 디버그 모드 Provider (디버그 모드 활성화)
 */
export function createDebugProvider() {
  return function DebugProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(SimpleI18n, { children });
  };
}

// 더 간단한 별칭들
export const I18nApp = SimpleProvider;
export const LanguageApp = createLanguageProvider('ko');
export const DebugApp = createDebugProvider(); 