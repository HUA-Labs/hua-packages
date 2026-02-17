/**
 * @hua-labs/hua/framework - useLiveRegion
 * 
 * 프로그래밍 방식으로 Live Region을 사용하는 hook
 * Hook for programmatically using Live Region
 */

'use client';

import React, { useCallback, useState } from 'react';
import { LiveRegion } from '../components/LiveRegion';

/**
 * useLiveRegion 반환 타입
 */
export interface UseLiveRegionReturn {
  /**
   * 메시지를 알림
   * Announce a message
   */
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  
  /**
   * LiveRegion 컴포넌트
   * LiveRegion component to render
   */
  LiveRegionComponent: React.JSX.Element;
  
  /**
   * 현재 메시지
   * Current message
   */
  message: string | undefined;
}

/**
 * useLiveRegion Hook
 * 
 * 프로그래밍 방식으로 Live Region을 사용할 수 있습니다.
 * Allows programmatic use of Live Region.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { announce, LiveRegionComponent } = useLiveRegion();
 * 
 *   const handleClick = () => {
 *     announce('버튼이 클릭되었습니다');
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleClick}>Click me</button>
 *       {LiveRegionComponent}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @param defaultPoliteness - 기본 politeness 레벨
 * @returns Live Region 제어 함수와 컴포넌트
 */
export function useLiveRegion(
  defaultPoliteness: 'polite' | 'assertive' = 'polite'
): UseLiveRegionReturn {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>(defaultPoliteness);

  const announce = useCallback(
    (newMessage: string, newPoliteness?: 'polite' | 'assertive') => {
      // 메시지를 초기화한 후 다시 설정하여 스크린 리더가 변경을 감지하도록 함
      setMessage(undefined);
      
      // 다음 틱에 메시지 설정
      setTimeout(() => {
        setMessage(newMessage);
        if (newPoliteness) {
          setPoliteness(newPoliteness);
        }
      }, 0);
    },
    []
  );

  const LiveRegionComponent = React.createElement(LiveRegion, {
    message,
    politeness,
  });

  return {
    announce,
    LiveRegionComponent,
    message,
  };
}
