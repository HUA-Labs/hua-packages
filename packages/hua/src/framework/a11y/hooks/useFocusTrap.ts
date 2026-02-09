/**
 * @hua-labs/hua/framework - useFocusTrap
 * 
 * 모달, 드로어 등에서 포커스를 트랩하는 hook
 * Traps focus within a container (e.g., modal, drawer)
 */

'use client';

import { useEffect, useRef, useCallback, type RefObject } from 'react';

/**
 * Focus Trap 옵션
 */
export interface FocusTrapOptions {
  /**
   * 포커스 트랩 활성화 여부
   * Whether focus trap is active
   * 
   * @default true
   */
  isActive?: boolean;
  
  /**
   * Escape 키를 눌렀을 때 호출할 콜백
   * Callback when Escape key is pressed
   */
  onEscape?: () => void;
  
  /**
   * 포커스할 초기 요소 선택자
   * Selector for initial element to focus
   */
  initialFocus?: string;
  
  /**
   * 포커스가 트랩 밖으로 나갔을 때 호출할 콜백
   * Callback when focus leaves the trap
   */
  onFocusOut?: () => void;
}

/**
 * Focus Trap Hook
 * 
 * 모달, 드로어 등에서 포커스를 컨테이너 내부에 트랩합니다.
 * Traps focus within a container (e.g., modal, drawer).
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useFocusTrap({ 
 *     isActive: isOpen, 
 *     onEscape: onClose 
 *   });
 * 
 *   if (!isOpen) return null;
 * 
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <button onClick={onClose}>Close</button>
 *       Modal content
 *     </div>
 *   );
 * }
 * ```
 * 
 * @param options - Focus Trap 옵션
 * @returns 컨테이너에 연결할 ref
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: FocusTrapOptions = {}
): RefObject<T | null> {
  const {
    isActive = true,
    onEscape,
    initialFocus,
    onFocusOut,
  } = options;

  const ref = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef(onEscape);
  const onFocusOutRef = useRef(onFocusOut);

  // 콜백 ref 업데이트
  useEffect(() => {
    onEscapeRef.current = onEscape;
    onFocusOutRef.current = onFocusOut;
  }, [onEscape, onFocusOut]);

  useEffect(() => {
    if (!isActive || !ref.current) {
      return;
    }

    const container = ref.current;

    // 현재 포커스된 요소 저장
    previousActiveElement.current = document.activeElement as HTMLElement;

    // 포커스 가능한 요소들 찾기
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
        .filter((el) => {
          // 숨겨진 요소 제외
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
    };

    // 초기 포커스 설정
    const focusInitialElement = () => {
      try {
        if (initialFocus) {
          const element = container.querySelector<HTMLElement>(initialFocus);
          if (element) {
            element.focus();
            return;
          }
        }

        // 첫 번째 포커스 가능한 요소에 포커스
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          // 포커스 가능한 요소가 없으면 컨테이너에 포커스
          container.setAttribute('tabindex', '-1');
          container.focus();
        }
      } catch (error) {
        // focus() 실패 시 (예: 요소가 아직 렌더링되지 않음)
        // 조용히 실패 (접근성 기능이므로 에러를 던지지 않음)
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useFocusTrap] Failed to focus initial element:', error);
        }
      }
    };

    // 키보드 이벤트 핸들러
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscapeRef.current) {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }

      // Tab 키 처리
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const currentElement = document.activeElement as HTMLElement;

        // Shift + Tab (역방향)
        if (event.shiftKey) {
          if (currentElement === firstElement) {
            event.preventDefault();
            try {
              lastElement.focus();
            } catch (error) {
              // focus() 실패 시 조용히 처리
              if (process.env.NODE_ENV === 'development') {
                console.warn('[useFocusTrap] Failed to focus last element:', error);
              }
            }
          }
        } else {
          // Tab (정방향)
          if (currentElement === lastElement) {
            event.preventDefault();
            try {
              firstElement.focus();
            } catch (error) {
              // focus() 실패 시 조용히 처리
              if (process.env.NODE_ENV === 'development') {
                console.warn('[useFocusTrap] Failed to focus first element:', error);
              }
            }
          }
        }
      }
    };

    // 포커스 아웃 감지
    const handleFocusIn = (event: FocusEvent) => {
      if (!container.contains(event.target as Node)) {
        onFocusOutRef.current?.();
        // 포커스를 다시 컨테이너 내부로 이동
        try {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        } catch (error) {
          // focus() 실패 시 조용히 처리
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useFocusTrap] Failed to refocus element:', error);
          }
        }
      }
    };

    // 초기 포커스 설정
    focusInitialElement();

    // 이벤트 리스너 등록
    container.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    // 정리 함수
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);

      // 이전 포커스 복원
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, initialFocus]);

  return ref;
}
