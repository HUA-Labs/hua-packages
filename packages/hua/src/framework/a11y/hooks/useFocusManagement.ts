/**
 * @hua-labs/hua/framework - useFocusManagement
 * 
 * 페이지 전환 시 자동으로 메인 콘텐츠에 포커스를 이동시키는 hook
 * Automatically focuses main content on page transitions
 */

'use client';

import { useEffect, useRef, useMemo, type RefObject } from 'react';
import { createLogger } from '../../../utils/logger';

const log = createLogger('hua:a11y:focus-management');

/**
 * Focus Management 옵션
 */
export interface FocusManagementOptions {
  /**
   * 마운트 시 자동으로 포커스할지 여부
   * Whether to automatically focus on mount
   * 
   * @default true
   */
  autoFocus?: boolean;
  
  /**
   * 포커스할 요소의 선택자 (기본값: 요소 자체)
   * Selector for element to focus (default: element itself)
   */
  focusSelector?: string;
  
  /**
   * 포커스 시 스크롤할지 여부
   * Whether to scroll when focusing
   * 
   * @default false
   */
  scrollIntoView?: boolean;
  
  /**
   * 스크롤 옵션 (scrollIntoView가 true일 때)
   * Scroll options (when scrollIntoView is true)
   */
  scrollOptions?: ScrollIntoViewOptions;
}

/**
 * Focus Management Hook
 * 
 * 페이지 전환 시 자동으로 메인 콘텐츠에 포커스를 이동시킵니다.
 * Automatically focuses main content on page transitions.
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   const mainRef = useFocusManagement({ autoFocus: true });
 * 
 *   return (
 *     <main ref={mainRef} tabIndex={-1}>
 *       <h1>Page Title</h1>
 *     </main>
 *   );
 * }
 * ```
 * 
 * @param options - Focus Management 옵션
 * @returns 요소에 연결할 ref
 */
export function useFocusManagement<T extends HTMLElement = HTMLElement>(
  options: FocusManagementOptions = {}
): RefObject<T | null> {
  const {
    autoFocus = true,
    focusSelector,
    scrollIntoView = false,
    scrollOptions: userScrollOptions,
  } = options;

  const ref = useRef<T>(null);
  
  // scrollOptions 메모이제이션 (객체가 매번 새로 생성되는 것을 방지)
  const scrollOptions = useMemo<ScrollIntoViewOptions>(
    () => userScrollOptions ?? { behavior: 'smooth' as const, block: 'start' as const },
    [userScrollOptions]
  );

  useEffect(() => {
    if (!autoFocus || !ref.current) {
      return;
    }

    // 포커스할 요소 찾기
    let elementToFocus: HTMLElement | null = ref.current;

    if (focusSelector) {
      const found = ref.current.querySelector<HTMLElement>(focusSelector);
      if (found) {
        elementToFocus = found;
      }
    }

    // 포커스 이동
    if (elementToFocus) {
      // 약간의 지연을 두어 렌더링 완료 후 포커스
      const timeoutId = setTimeout(() => {
        try {
          elementToFocus?.focus();
          
          if (scrollIntoView && elementToFocus && scrollOptions) {
            elementToFocus.scrollIntoView(scrollOptions);
          }
        } catch (error) {
          // focus() 실패 시 조용히 처리
          if (process.env.NODE_ENV === 'development') {
            log.warn('Failed to focus element', { error: String(error) });
          }
        }
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [autoFocus, focusSelector, scrollIntoView, scrollOptions]);

  return ref;
}
