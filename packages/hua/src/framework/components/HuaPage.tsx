/**
 * @hua-labs/hua/framework - HuaPage
 * 
 * Page wrapper with automatic motion and i18n support
 */

'use client';

import React from 'react';
import type { HuaPageProps } from '../types';
import { getConfig } from '../config';
import { useMotion } from '../hooks/useMotion';
import { ErrorBoundary } from './ErrorBoundary';
import { createLogger } from '../../utils/logger';

const log = createLogger('hua:page');

/**
 * HuaPage Component
 * 
 * 페이지 콘텐츠를 자동 모션 애니메이션과 i18n 지원으로 감싸는 컴포넌트입니다.
 * Wraps page content with automatic motion animations and i18n support.
 * 
 * **바이브 코딩 친화적 / Vibe Coding Friendly**:
 * - 한 파일에서 SEO, Motion, i18n을 모두 결정할 수 있습니다.
 * - You can decide SEO, Motion, and i18n all in one file.
 * - AI가 파일 하나만 보고도 완벽한 페이지를 생성할 수 있습니다.
 * - AI can generate a perfect page by looking at just one file.
 * 
 * @example
 * ```tsx
 * // app/page.tsx
 * import { HuaPage } from '@hua-labs/hua/framework';
 * 
 * export default function HomePage() {
 *   return (
 *     <HuaPage
 *       vibe="clean"
 *       i18nKey="home"
 *       title="홈"
 *       description="환영합니다"
 *     >
 *       <h1>Welcome</h1>
 *     </HuaPage>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // 바이브 코더용: vibe만으로 스타일 결정
 * // For vibe coders: decide style with just vibe
 * <HuaPage vibe="fancy">
 *   <div>화려한 인터랙션이 자동 적용됩니다</div>
 * </HuaPage>
 * ```
 */
export function HuaPage({
  children,
  title: _title,
  description: _description,
  vibe,
  i18nKey,
  enableMotion = true,
  enableErrorBoundary = true,
  errorBoundaryFallback,
  seo,
  motion,
}: HuaPageProps) {
  const config = getConfig();

  // vibe에 따라 모션 설정 조정
  // Adjust motion settings based on vibe
  const motionDuration = vibe === 'fancy' ? 800 : vibe === 'minimal' ? 300 : 600;
  const shouldEnableMotion = enableMotion && config.motion?.enableAnimations !== false;

  // motion prop 또는 vibe에 따라 모션 타입 결정
  // Determine motion type based on motion prop or vibe
  const motionType = motion || (vibe === 'fancy' ? 'slideUp' : vibe === 'minimal' ? 'fadeIn' : 'fadeIn');

  // 통합 Motion Hook 사용 (성능 최적화)
  // Use unified Motion Hook (performance optimization)
  // Note: React Rules of Hooks를 준수하기 위해 내부적으로 모든 hook을 호출하지만,
  // 실제로는 선택된 hook만 활성화되어 성능 오버헤드를 최소화합니다.
  // Note: All hooks are called internally to respect React Rules of Hooks,
  // but only the selected hook is actually activated to minimize performance overhead.
  const motionResult = useMotion<HTMLDivElement>({
    type: motionType,
    duration: motionDuration,
    autoStart: false, // 수동으로 start 호출
  });

  // Start the selected motion if enabled
  // 모션이 활성화된 경우 선택된 모션 시작
  React.useEffect(() => {
    if (shouldEnableMotion) {
      motionResult.start?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldEnableMotion]); // motionResult.start는 안정적인 함수이므로 dependency에서 제외
  const pageRef = motionResult.ref;

  // SEO 메타데이터는 Next.js App Router에서 page.tsx의 export const metadata로 처리하는 것이 권장됩니다.
  // 이 컴포넌트는 Client Component이므로 메타데이터를 직접 설정할 수 없습니다.
  // SEO 설정이 있으면 개발자에게 경고 메시지 표시 (개발 모드에서만)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && seo) {
      log.warn(
        'SEO metadata should be set using `export const metadata` in page.tsx. ' +
        'Use `generatePageMetadata()` helper function from @hua-labs/hua/framework'
      );
    }
  }, [seo]);

  // i18nKey가 있으면 해당 네임스페이스를 자동으로 로드하도록 안내
  // (실제 로드는 I18nProvider에서 자동 처리됨)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && i18nKey) {
      // i18nKey가 설정되어 있으면 해당 네임스페이스가 자동으로 로드됩니다.
      // 번역 키는 `${i18nKey}:title`, `${i18nKey}:description` 형식으로 사용할 수 있습니다.
      // Translation keys can be used in the format `${i18nKey}:title`, `${i18nKey}:description`
    }
  }, [i18nKey]);

  const pageContent = (
    <div ref={pageRef} style={motionResult.style}>
      {children}
    </div>
  );

  // Wrap with ErrorBoundary if enabled
  if (enableErrorBoundary) {
    return (
      <ErrorBoundary fallback={errorBoundaryFallback}>
        {pageContent}
      </ErrorBoundary>
    );
  }

  return pageContent;
}
