/**
 * @hua-labs/hua/framework - LiveRegion
 * 
 * 스크린 리더 사용자에게 동적 상태 변화를 알리는 컴포넌트
 * Component that announces dynamic state changes to screen reader users
 */

'use client';

import React from 'react';

/**
 * LiveRegion 컴포넌트 props
 */
export interface LiveRegionProps {
  /**
   * 알림할 메시지
   * Message to announce
   */
  message?: string;
  
  /**
   * Live region의 politeness 레벨
   * Politeness level of the live region
   * 
   * - 'polite': 현재 작업이 완료된 후 알림 (기본값)
   * - 'assertive': 즉시 알림
   * - 'off': 알림 비활성화
   * 
   * @default "polite"
   */
  politeness?: 'polite' | 'assertive' | 'off';
  
  /**
   * 추가 CSS 클래스
   * Additional CSS classes
   */
  className?: string;
}

/**
 * LiveRegion 컴포넌트
 * 
 * 스크린 리더 사용자에게 동적 상태 변화를 알립니다.
 * Announces dynamic state changes to screen reader users.
 * 
 * @example
 * ```tsx
 * function MyForm() {
 *   const [message, setMessage] = useState('');
 * 
 *   const handleSubmit = async () => {
 *     setMessage('저장 중...');
 *     await saveData();
 *     setMessage('저장되었습니다!');
 *   };
 * 
 *   return (
 *     <div>
 *       <form onSubmit={handleSubmit}>Form fields</form>
 *       <LiveRegion message={message} />
 *     </div>
 *   );
 * }
 * ```
 * 
 * @param props - LiveRegion props
 * @returns LiveRegion 컴포넌트
 */
export function LiveRegion({
  message,
  politeness = 'polite',
  className,
}: LiveRegionProps): React.JSX.Element {
  // aria-live는 자동으로 업데이트를 감지하므로
  // 메시지 변경만으로도 알림이 발생합니다.
  // 별도의 useEffect는 필요하지 않습니다.

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={className || 'sr-only'}
    >
      {message}
    </div>
  );
}
