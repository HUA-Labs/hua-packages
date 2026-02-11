/**
 * @hua-labs/hua/framework - SkipToContent
 * 
 * 키보드 사용자를 위한 "콘텐츠로 건너뛰기" 링크
 * "Skip to content" link for keyboard users
 */

'use client';

import React from 'react';
import { createLogger } from '../../../utils/logger';

const log = createLogger('hua:a11y:skip-to-content');

/**
 * SkipToContent 컴포넌트 props
 */
export interface SkipToContentProps {
  /**
   * 메인 콘텐츠의 ID
   * ID of the main content element
   * 
   * @default "main-content"
   */
  targetId?: string;
  
  /**
   * 링크 텍스트
   * Link text
   * 
   * @default "Skip to content"
   */
  children?: React.ReactNode;
  
  /**
   * 추가 CSS 클래스
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SkipToContent 컴포넌트
 * 
 * 키보드 사용자가 네비게이션을 건너뛰고 메인 콘텐츠로 바로 이동할 수 있도록 합니다.
 * Allows keyboard users to skip navigation and go directly to main content.
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { SkipToContent } from '@hua-labs/hua/framework';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SkipToContent />
 *         <nav>Navigation</nav>
 *         <main id="main-content" tabIndex={-1}>
 *           {children}
 *         </main>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * @param props - SkipToContent props
 * @returns SkipToContent 컴포넌트
 */
export function SkipToContent({
  targetId = 'main-content',
  children = 'Skip to content',
  className,
}: SkipToContentProps): React.JSX.Element {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    try {
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (process.env.NODE_ENV === 'development') {
        log.warn('Target element not found', { targetId });
      }
    } catch (error) {
      // focus() 또는 scrollIntoView() 실패 시 조용히 처리
      if (process.env.NODE_ENV === 'development') {
        log.warn('Failed to focus or scroll to target', { error: String(error) });
      }
    }
  };

  const defaultClassName = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2';

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={className || defaultClassName}
    >
      {children}
    </a>
  );
}
